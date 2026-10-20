import { getPayments } from "@src/api/payments/getPayments";
import { PaymentSearchParams } from "@src/types/payment";
import { ERROR_TYPES, ErrorType } from "@src/types/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ZodError } from "zod";

export const usePayments = (params: PaymentSearchParams) => {
  const { data, isPending, isFetching, isRefetching, isError, error } =
    useQuery({
      queryKey: ["getPayments", params],
      queryFn: ({ signal }) => getPayments(params, signal),
      staleTime: 20_000,
      gcTime: 5 * 20_000,
    });

  const getErrorMessage = (error: unknown): ErrorType => {
    if (error instanceof ZodError) {
      //This can be a Validation Error if we want to show the error.
      return ERROR_TYPES.UNKNOWN;
    }

    if (axios.isAxiosError(error)) {
      switch (error.response?.status) {
        case 404:
          return ERROR_TYPES.NOT_FOUND;
        case 500:
          return ERROR_TYPES.SERVER_ERROR;
        default:
          return ERROR_TYPES.UNKNOWN;
      }
    }

    return ERROR_TYPES.UNKNOWN;
  };

  const errorMessage: ErrorType | null = isError
    ? getErrorMessage(error)
    : null;

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : params.page;

  return {
    paymentsData: data,
    page: data?.page ?? params.page,
    totalPages,
    isPending,
    isFetching,
    isRefetching,
    isError,
    errorMessage,
  };
};
