import { z } from "zod";
import { CURRENCIES, PAGE_SIZE } from "@src/constants";
import { STATUS_TYPES } from "@src/types/types";

export const paymentSchema = z.object({
  id: z.string(),
  customerName: z.string(),
  amount: z.number(),
  customerAddress: z.string(),
  currency: z.enum(CURRENCIES),
  status: z.enum(Object.values(STATUS_TYPES)),
  date: z.iso.datetime({ precision: 0 }),
  description: z.string(),
});

export const paymentSearchResponseSchema = z.object({
  payments: z.array(paymentSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});

export const paymentSearchParamsSchema = z.object({
  search: z.string(),
  currency: z.enum(CURRENCIES).or(z.literal("")),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive().default(PAGE_SIZE),
});
