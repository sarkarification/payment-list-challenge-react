export const STATUS_TYPES = {
  COMPLETED: "completed",
  PENDING: "pending",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;

export const ERROR_TYPES = {
  NOT_FOUND: "notFound",
  SERVER_ERROR: "serverError",
  UNKNOWN: "unknown",
} as const;

export type ErrorType = (typeof ERROR_TYPES)[keyof typeof ERROR_TYPES];
