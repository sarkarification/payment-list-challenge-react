import {
  EmptyBox,
  SkeletonTableRow,
  StatusBadge,
  Table,
  TableBodyWrapper,
  TableCell,
  TableHeader,
  TableHeaderRow,
  TableHeaderWrapper,
  TableRow,
  TableWrapper,
} from "@src/components/components";
import { formatCurrency, formatDate } from "@src/utils/utils";
import { I18N } from "@src/constants/i18n";
import {
  DefaultTableSkeletonRows,
  PaymentTableHeaders,
  PaymentTableProps,
} from "./paymentTable.config";

export const PaymentTable = ({
  loading,
  tableSkeletonRowCount,
  payments,
  pagination,
}: PaymentTableProps) => {
  if (!loading && payments.length === 0)
    return <EmptyBox>{I18N.NO_PAYMENTS_FOUND}</EmptyBox>;
  return (
    <TableWrapper>
      <Table aria-busy={loading}>
        <TableHeaderWrapper>
          <TableHeaderRow>
            {PaymentTableHeaders.map((header, index) => (
              <TableHeader key={index}>{header}</TableHeader>
            ))}
          </TableHeaderRow>
        </TableHeaderWrapper>

        <TableBodyWrapper>
          {loading &&
            Array.from({
              length: tableSkeletonRowCount ?? DefaultTableSkeletonRows,
            }).map((_, index) => (
              <SkeletonTableRow key={index} aria-hidden="true">
                <td colSpan={PaymentTableHeaders.length} />
              </SkeletonTableRow>
            ))}
          {!loading &&
            payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.id}</TableCell>
                <TableCell>{formatDate(payment.date)}</TableCell>
                <TableCell>
                  {payment.currency
                    ? formatCurrency(payment.amount, payment.currency)
                    : payment.amount.toString()}
                </TableCell>
                <TableCell>
                  {payment.customerName.length === 0
                    ? I18N.EMPTY_CUSTOMER
                    : payment.customerName}
                </TableCell>
                <TableCell>
                  {payment.currency.length === 0
                    ? I18N.EMPTY_CURRENCY
                    : payment.currency}
                </TableCell>
                <TableCell>
                  <StatusBadge status={payment.status}>
                    {payment.status}
                  </StatusBadge>
                </TableCell>
              </TableRow>
            ))}
        </TableBodyWrapper>
      </Table>
      {!loading && pagination}
    </TableWrapper>
  );
};
