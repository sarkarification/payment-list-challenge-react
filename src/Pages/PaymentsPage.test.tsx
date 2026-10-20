import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { API_URL, PAGE_SIZE } from "@src/constants";
import { I18N } from "@src/constants/i18n";
import { server } from "@src/mocks/node";
import type { PaymentSearchResponse } from "@src/types/payment";
import { PaymentsPage } from "./PaymentsPage";

const response: PaymentSearchResponse = {
  payments: [{
    id: "pay_page_test",
    customerName: "Jane Smith",
    amount: 100,
    customerAddress: "London",
    currency: "GBP",
    status: "completed",
    date: "2024-01-05T09:04:03Z",
    description: "Page test payment",
  }],
  total: 10,
  page: 1,
  pageSize: PAGE_SIZE,
};

const clients: QueryClient[] = [];

const renderPage = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false, refetchOnReconnect: false },
    },
  });
  clients.push(client);
  render(<QueryClientProvider client={client}><PaymentsPage /></QueryClientProvider>);
  return client;
};

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  cleanup();
  clients.splice(0).forEach((client) => client.clear());
  server.resetHandlers();
});
afterAll(() => server.close());

describe("PaymentsPage", () => {
  it("shows the loading skeleton until the first response arrives", async () => {
    let release!: () => void;
    const pending = new Promise<void>((resolve) => { release = resolve; });
    server.use(http.get(`*${API_URL}`, async () => {
      await pending;
      return HttpResponse.json(response);
    }));
    renderPage();

    expect(screen.getByRole("table").getAttribute("aria-busy")).toBe("true");
    expect(screen.queryByText(I18N.NO_PAYMENTS_FOUND)).toBeNull();
    expect(screen.queryByRole("button", { name: I18N.NEXT_BUTTON })).toBeNull();

    release();
    expect(await screen.findByText("pay_page_test")).toBeTruthy();
    expect(screen.getByRole("table").getAttribute("aria-busy")).toBe("false");
    expect(screen.getByRole("button", { name: I18N.NEXT_BUTTON })).toBeTruthy();
  });

  it("shows an empty message without a table or pagination after empty success", async () => {
    server.use(http.get(`*${API_URL}`, () => HttpResponse.json({ ...response, payments: [], total: 0 })));
    renderPage();

    expect(await screen.findByText(I18N.NO_PAYMENTS_FOUND)).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryByRole("button", { name: I18N.NEXT_BUTTON })).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it.each([
    [404, I18N.PAYMENT_NOT_FOUND],
    [500, I18N.INTERNAL_SERVER_ERROR],
  ])("shows HTTP %i as an initial error without a table", async (status, message) => {
    server.use(http.get(`*${API_URL}`, () => HttpResponse.json({}, { status })));
    renderPage();

    expect((await screen.findByRole("alert")).textContent).toBe(message);
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryByText(I18N.NO_PAYMENTS_FOUND)).toBeNull();
    expect(screen.queryByRole("button", { name: I18N.NEXT_BUTTON })).toBeNull();
  });

  it("keeps cached rows visible during a refresh and removes them after refresh fails", async () => {
    server.use(http.get(`*${API_URL}`, () => HttpResponse.json(response)));
    const client = renderPage();
    await screen.findByText("pay_page_test");

    let release!: () => void;
    const pending = new Promise<void>((resolve) => { release = resolve; });
    server.use(http.get(`*${API_URL}`, async () => {
      await pending;
      return HttpResponse.json({}, { status: 500 });
    }));

    act(() => { void client.invalidateQueries({ queryKey: ["getPayments"] }); });
    await screen.findByLabelText(I18N.LOADING_PAYMENTS);
    expect(within(screen.getByRole("table")).getByText("pay_page_test")).toBeTruthy();
    expect(screen.getByRole("table").getAttribute("aria-busy")).toBe("false");

    release();
    expect((await screen.findByRole("alert")).textContent).toBe(I18N.INTERNAL_SERVER_ERROR);
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryByText("pay_page_test")).toBeNull();
  });

  it("applies normalized search on submit, resets pagination for currency, and clears filters", async () => {
    const requests: URLSearchParams[] = [];
    server.use(http.get(`*${API_URL}`, ({ request }) => {
      const params = new URL(request.url).searchParams;
      requests.push(params);
      const page = Number(params.get("page"));
      return HttpResponse.json({
        ...response,
        page,
        payments: [{ ...response.payments[0], id: `pay_result_${requests.length}` }],
      });
    }));
    renderPage();
    await screen.findByText("pay_result_1");
    const search = screen.getByRole("textbox", { name: I18N.SEARCH_LABEL });
    fireEvent.change(search, { target: { value: "  PAY_TEST  " } });
    expect(requests).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: I18N.SEARCH_BUTTON }));
    await screen.findByText("pay_result_2");
    expect(requests[1].get("search")).toBe("pay_test");

    fireEvent.click(screen.getByRole("button", { name: I18N.NEXT_BUTTON }));
    await screen.findByText("pay_result_3");
    expect(requests[2].get("page")).toBe("2");

    const currency = screen.getByRole("combobox", { name: I18N.CURRENCY_FILTER_LABEL });
    fireEvent.change(currency, { target: { value: "GBP" } });
    await screen.findByText("pay_result_4");
    expect(requests[3].get("currency")).toBe("GBP");
    expect(requests[3].get("search")).toBe("pay_test");
    expect(requests[3].get("page")).toBe("1");

    fireEvent.click(screen.getByRole("button", { name: I18N.CLEAR_FILTERS }));
    // The initial query is still fresh, so clearing should reuse its cached result.
    await screen.findByText("pay_result_1");
    expect((search as HTMLInputElement).value).toBe("");
    expect((currency as HTMLSelectElement).value).toBe("");
    await waitFor(() => expect(screen.queryByRole("button", { name: I18N.CLEAR_FILTERS })).toBeNull());
  });
});
