import axios from "axios";
import { ZodError } from "zod";
import { http, HttpResponse } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { API_URL, PAGE_SIZE } from "../../constants";
import { server } from "../../mocks/node";
import type {
  PaymentSearchParams,
  PaymentSearchResponse,
} from "../../types/payment";
import { getPayments } from "@src/api/payments/getPayments";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const defaultParams: PaymentSearchParams = {
  search: "",
  currency: "",
  page: 1,
  pageSize: PAGE_SIZE,
};

describe("getPayments", () => {
  it.each([0, -1, 1.5])(
    "rejects invalid page %s with a ZodError before sending a request",
    async (page) => {
      let requestCount = 0;
      server.use(
        http.get(`*${API_URL}`, () => {
          requestCount += 1;
          return HttpResponse.json({});
        }),
      );

      const error = await getPayments({ ...defaultParams, page }).catch(
        (error: unknown) => error,
      );

      expect(error).toBeInstanceOf(ZodError);
      expect(error).toMatchObject({
        issues: expect.arrayContaining([
          expect.objectContaining({ path: ["page"] }),
        ]),
      });
      expect(requestCount).toBe(0);
    },
  );

  it.each([
    { total: -1, path: ["total"] },
    { total: "12", path: ["total"] },
    { total: undefined, path: ["total"] },
  ])(
    "propagates a ZodError for invalid response total $total",
    async ({ total, path }) => {
      server.use(
        http.get(`*${API_URL}`, () =>
          HttpResponse.json({
            payments: [],
            total,
            page: 1,
            pageSize: PAGE_SIZE,
          }),
        ),
      );

      const error = await getPayments(defaultParams).catch(
        (error: unknown) => error,
      );

      expect(error).toBeInstanceOf(ZodError);
      expect(error).toMatchObject({
        issues: expect.arrayContaining([expect.objectContaining({ path })]),
      });
    },
  );

  it("propagates a ZodError for an invalid payment date in the response", async () => {
    server.use(
      http.get(`*${API_URL}`, () =>
        HttpResponse.json({
          payments: [
            {
              id: "pay_test",
              customerName: "Jane Smith",
              amount: 100,
              customerAddress: "London",
              currency: "GBP",
              status: "completed",
              date: "2024-04-15",
              description: "Test payment",
            },
          ],
          total: 1,
          page: 1,
          pageSize: PAGE_SIZE,
        }),
      ),
    );

    const error = await getPayments(defaultParams).catch(
      (error: unknown) => error,
    );

    expect(error).toBeInstanceOf(ZodError);
    expect(error).toMatchObject({
      issues: expect.arrayContaining([
        expect.objectContaining({ path: ["payments", 0, "date"] }),
      ]),
    });
  });

  it("rejects null customer name and currency with a ZodError", async () => {
    server.use(
      http.get(`*${API_URL}`, () =>
        HttpResponse.json({
          payments: [
            {
              id: "pay_test",
              customerName: null,
              amount: 100,
              customerAddress: "London",
              currency: null,
              status: "completed",
              date: "2024-04-15T23:00:00Z",
              description: "Test payment",
            },
          ],
          total: 1,
          page: 1,
          pageSize: PAGE_SIZE,
        }),
      ),
    );

    const error = await getPayments(defaultParams).catch(
      (error: unknown) => error,
    );

    expect(error).toBeInstanceOf(ZodError);
    expect(error).toMatchObject({
      issues: expect.arrayContaining([
        expect.objectContaining({ path: ["payments", 0, "customerName"] }),
        expect.objectContaining({ path: ["payments", 0, "currency"] }),
      ]),
    });
  });

  it("sends explicit default parameter values", async () => {
    let query: URLSearchParams | undefined;
    server.use(
      http.get(`*${API_URL}`, ({ request }) => {
        query = new URL(request.url).searchParams;
        return HttpResponse.json({
          payments: [],
          total: 0,
          page: 1,
          pageSize: PAGE_SIZE,
        });
      }),
    );

    await getPayments(defaultParams);

    expect(Object.fromEntries(query!)).toEqual({
      search: "",
      currency: "",
      page: "1",
      pageSize: String(PAGE_SIZE),
    });
  });

  it("sends supplied filters and pagination and returns the response body", async () => {
    let query: URLSearchParams | undefined;
    const response: PaymentSearchResponse = {
      payments: [
        {
          id: "pay_134",
          customerName: "Jane Smith",
          amount: 100,
          customerAddress: "London",
          currency: "GBP",
          status: "completed",
          date: "2024-04-15T23:00:00Z",
          description: "Test payment",
        },
      ],
      total: 12,
      page: 2,
      pageSize: 10,
    };
    server.use(
      http.get(`*${API_URL}`, ({ request }) => {
        query = new URL(request.url).searchParams;
        return HttpResponse.json(response);
      }),
    );

    const result = await getPayments({
      search: "pay_134",
      currency: "GBP",
      page: 2,
      pageSize: 10,
    });

    expect(Object.fromEntries(query!)).toEqual({
      search: "pay_134",
      currency: "GBP",
      page: "2",
      pageSize: "10",
    });
    expect(result).toEqual(response);
  });

  it("defaults omitted pageSize while preserving supplied parameters", async () => {
    let query: URLSearchParams | undefined;
    server.use(
      http.get(`*${API_URL}`, ({ request }) => {
        query = new URL(request.url).searchParams;
        return HttpResponse.json({
          payments: [],
          total: 0,
          page: 1,
          pageSize: PAGE_SIZE,
        });
      }),
    );

    await getPayments({ search: "", currency: "JPY", page: 1 });

    expect(Object.fromEntries(query!)).toEqual({
      search: "",
      currency: "JPY",
      page: "1",
      pageSize: String(PAGE_SIZE),
    });
  });

  it.each([404, 500])("propagates HTTP %s errors", async (status) => {
    server.use(
      http.get(`*${API_URL}`, () =>
        HttpResponse.json({ message: "Request failed" }, { status }),
      ),
    );

    await expect(getPayments(defaultParams)).rejects.toMatchObject({
      isAxiosError: true,
      response: { status },
    });
  });

  it("cancels an in-flight request when the supplied signal is aborted", async () => {
    const controller = new AbortController();
    server.use(
      http.get(`*${API_URL}`, () => {
        controller.abort();
        return HttpResponse.json({});
      }),
    );

    await expect(
      getPayments(defaultParams, controller.signal),
    ).rejects.toBeInstanceOf(axios.CanceledError);
  });
});
