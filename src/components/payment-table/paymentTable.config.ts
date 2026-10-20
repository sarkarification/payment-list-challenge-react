import { I18N } from "@src/constants/i18n";
import { Payment } from "@src/types/payment";

export const PaymentTableHeaders = [
  I18N.TABLE_HEADER_PAYMENT_ID,
  I18N.TABLE_HEADER_DATE,
  I18N.TABLE_HEADER_AMOUNT,
  I18N.TABLE_HEADER_CUSTOMER,
  I18N.TABLE_HEADER_CURRENCY,
  I18N.TABLE_HEADER_STATUS,
];

export const DefaultTableSkeletonRows = 5;

export interface PaymentTableProps {
  payments: Payment[];
  loading?: boolean;
  pagination?: React.ReactNode;
  tableSkeletonRowCount?: number;
}
