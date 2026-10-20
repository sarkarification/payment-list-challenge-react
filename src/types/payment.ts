import z from "zod";
import {
  paymentSchema,
  paymentSearchParamsSchema,
  paymentSearchResponseSchema,
} from "@src/schemas/payment";

export type PaymentSearchParams = z.input<typeof paymentSearchParamsSchema>;

export type Payment = z.infer<typeof paymentSchema>;

export type PaymentSearchResponse = z.infer<typeof paymentSearchResponseSchema>;
