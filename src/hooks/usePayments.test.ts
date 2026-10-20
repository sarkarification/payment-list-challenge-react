import { createElement, type PropsWithChildren } from "react";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ZodError } from "zod";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getPayments } from "@src/api/payments/getPayments";
import type {
  PaymentSearchParams,
  PaymentSearchResponse,
} from "@src/types/payment";
import { ERROR_TYPES } from "@src/types/types";
import { usePayments } from "./usePayments";

vi.mock("@src/api/payments/getPayments", () => ({ getPayments: vi.fn() }));

const mockedGetPayments = vi.mocked(getPayments);
const clients: QueryClient[] = [];

const response: PaymentSearchResponse = {
  payments: [
    {
      id: "pay_test",
      customerName: "Jane Smith",
      amount: 100,
      customerAddress: "London",
      currency: "GBP",
      status: "completed",
      date: "2024-01-05T09:04:03Z",
      description: "Test payment",
    },
  ],
  total: 12,
  page: 2,
  pageSize: 5,
};

const defaultParams: PaymentSearchParams = {
  search: "",
  currency: "",
  page: 1,
  pageSize: 5,
};

const setup = (params: PaymentSearchParams = defaultParams) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  clients.push(client);
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { client }, children);

  return {
    client,
    ...renderHook((values: PaymentSearchParams) => usePayments(values), {
      initialProps: params,
      wrapper,
    }),
  };
};

const deferred = () => {
  let resolve!: (value: PaymentSearchResponse) => void;
  const promise = new Promise<PaymentSearchResponse>((complete) => {
    resolve = complete;
  });
  return { promise, resolve };
};

beforeEach(() => {
  mockedGetPayments.mockReset();
});
afterEach(() => {
  cleanup();
  clients.splice(0).forEach((client) => client.clear());
});

describe("usePayments", () => {
  it("uses the requested page for pagination while the response is pending", async () => {
    const request = deferred();
    mockedGetPayments.mockReturnValueOnce(request.promise);
    const { result } = setup({ ...defaultParams, page: 2 });

    expect(result.current).toMatchObject({
      paymentsData: undefined,
      page: 2,
      totalPages: 2,
      isPending: true,
      isFetching: true,
      isRefetching: false,
      isError: false,
      errorMessage: null,
    });

    request.resolve(response);
    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(result.current.page).toBe(2);
    expect(result.current.totalPages).toBe(3);
  });

  it("forwards all parameters and an abort signal to the API", async () => {
    mockedGetPayments.mockResolvedValue(response);
    const params: PaymentSearchParams = {
      search: "pay_test",
      currency: "GBP",
      page: 2,
      pageSize: 5,
    };
    const { result } = setup(params);

    await waitFor(() => expect(result.current.paymentsData).toEqual(response));
    expect(mockedGetPayments).toHaveBeenCalledExactlyOnceWith(
      params,
      expect.any(AbortSignal),
    );
    expect(result.current).toMatchObject({
      page: 2,
      totalPages: 3,
      isPending: false,
      isFetching: false,
      isRefetching: false,
      isError: false,
      errorMessage: null,
    });
  });

  it("returns zero total pages for a successful empty response", async () => {
    const emptyResponse = { ...response, payments: [], total: 0, page: 1 };
    mockedGetPayments.mockResolvedValue(emptyResponse);
    const { result } = setup();

    await waitFor(() =>
      expect(result.current.paymentsData).toEqual(emptyResponse),
    );
    expect(result.current.totalPages).toBe(0);
    expect(result.current.isError).toBe(false);
    expect(result.current.errorMessage).toBeNull();
  });

  it.each([
    [404, ERROR_TYPES.NOT_FOUND],
    [500, ERROR_TYPES.SERVER_ERROR],
    [401, ERROR_TYPES.UNKNOWN],
    [503, ERROR_TYPES.UNKNOWN],
  ])("maps HTTP %i to %s", async (status, errorType) => {
    const error = Object.assign(new AxiosError("HTTP failure"), {
      response: { status },
    });
    mockedGetPayments.mockRejectedValue(error);
    const { result } = setup();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.errorMessage).toBe(errorType);
    expect(result.current.isPending).toBe(false);
    expect(result.current.isFetching).toBe(false);
  });

  it.each([
    ["network failure", new AxiosError("Network Error", "ERR_NETWORK")],
    ["non-Axios failure", new Error("Unexpected failure")],
    [
      "Zod validation failure",
      new ZodError([
        { code: "custom", path: ["page"], message: "Invalid page" },
      ]),
    ],
  ])("maps a %s to unknown", async (_label, error) => {
    mockedGetPayments.mockRejectedValue(error);
    const { result } = setup();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.errorMessage).toBe(ERROR_TYPES.UNKNOWN);
  });

  it("requests new data when search, currency, page, or page size changes", async () => {
    mockedGetPayments.mockResolvedValue(response);
    const { result, rerender } = setup(defaultParams);
    await waitFor(() => expect(result.current.isFetching).toBe(false));

    const changes: PaymentSearchParams[] = [
      { ...defaultParams, search: "pay_test" },
      { ...defaultParams, search: "pay_test", currency: "GBP" },
      { ...defaultParams, search: "pay_test", currency: "GBP", page: 2 },
      {
        ...defaultParams,
        search: "pay_test",
        currency: "GBP",
        page: 2,
        pageSize: 10,
      },
    ];
    for (const [index, params] of changes.entries()) {
      rerender(params);
      await waitFor(() =>
        expect(mockedGetPayments).toHaveBeenCalledTimes(index + 2),
      );
      expect(mockedGetPayments).toHaveBeenLastCalledWith(
        params,
        expect.any(AbortSignal),
      );
      await waitFor(() => expect(result.current.isFetching).toBe(false));
    }
  });

  it("reuses fresh cached data for equivalent parameter objects", async () => {
    mockedGetPayments.mockResolvedValue(response);
    const { result, rerender } = setup({
      ...defaultParams,
      currency: "GBP",
      page: 2,
    });
    await waitFor(() => expect(result.current.isFetching).toBe(false));

    rerender({ ...defaultParams, page: 2, currency: "GBP" });

    expect(result.current.paymentsData).toEqual(response);
    expect(mockedGetPayments).toHaveBeenCalledTimes(1);
  });

  it("aborts the in-flight API signal when the hook unmounts", () => {
    mockedGetPayments.mockReturnValueOnce(deferred().promise);
    const { unmount } = setup();
    const signal = mockedGetPayments.mock.calls[0][1];
    expect(signal?.aborted).toBe(false);

    unmount();

    expect(signal?.aborted).toBe(true);
  });
});
