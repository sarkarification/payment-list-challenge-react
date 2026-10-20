import { format } from "date-fns";
import { CURRENCIES } from "../constants";

export type Currency = (typeof CURRENCIES)[number];

export const formatDate = (date: string): string => {
  return format(new Date(date), "dd/MM/yyyy, HH:mm:ss");
};

export const formatCurrency = (amount: number, currency: Currency): string => {
  if (!currency) return amount.toString();
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(amount);
};
