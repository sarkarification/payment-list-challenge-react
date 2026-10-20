import axios from "axios";
import { API_URL } from "@src/constants";
import {
  paymentSearchParamsSchema,
  paymentSearchResponseSchema,
} from "@src/schemas/payment";
import type {
  PaymentSearchParams,
  PaymentSearchResponse,
} from "@src/types/payment";

export const getPayments = async (
  params: PaymentSearchParams,
  signal?: AbortSignal,
): Promise<PaymentSearchResponse> => {
  const validatedParams = paymentSearchParamsSchema.parse(params);

  const { data } = await axios.get<unknown>(API_URL, {
    params: validatedParams,
    signal,
  });

  return paymentSearchResponseSchema.parse(data);
};
