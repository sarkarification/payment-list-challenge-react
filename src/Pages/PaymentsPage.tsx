import { useState } from "react";
import { Container, Title } from "@src/components/components";
import { PaymentSearch } from "@src/components/payment-search/paymentSearch";
import { PaymentTable } from "@src/components/payment-table/paymentTable";
import { Pagination } from "@src/components/pagination/pagination";
import { PaymentsErrorBox } from "@src/components/payments-error-box/paymentsErrorBox";
import { Currency } from "@src/utils/utils";
import { usePayments } from "@src/hooks/usePayments";
import { PAGE_SIZE } from "@src/constants";
import { PaymentSearchParams } from "@src/types/payment";
import { I18N } from "@src/constants/i18n";

const initialFilterState: PaymentSearchParams = {
  search: "",
  currency: "",
  page: 1,
  pageSize: PAGE_SIZE,
};

export const PaymentsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] =
    useState<PaymentSearchParams>(initialFilterState);

  const {
    paymentsData,
    page,
    totalPages,
    isPending,
    isRefetching,
    isError,
    errorMessage,
  } = usePayments(filters);

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSearchTerm(event.target.value);
  };

  const handleSubmitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFilters((prevFilters) => ({
      ...prevFilters,
      search: searchTerm.trim().toLowerCase(),
      page: initialFilterState.page,
    }));
  };

  const handleClearFilters = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setSearchTerm("");
    setFilters({
      ...initialFilterState,
    });
  };

  const handleCurrencyChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      currency: event.target.value as Currency | "",
      page: initialFilterState.page,
    }));
  };

  const onPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        page: newPage,
      }));
    }
  };

  return (
    <Container>
      <Title>{I18N.PAGE_TITLE}</Title>
      <PaymentSearch
        searchTerm={searchTerm}
        onSearchChange={handleSearchInputChange}
        currency={filters.currency}
        onCurrencyChange={handleCurrencyChange}
        onSearch={handleSubmitSearch}
        showClearFilters={
          !!(searchTerm || filters.search || filters.currency !== "")
        }
        onClearFilters={handleClearFilters}
        isLoading={isRefetching}
      />
      {isError && errorMessage && <PaymentsErrorBox errorType={errorMessage} />}
      {!isError && (
        <PaymentTable
          loading={isPending}
          payments={paymentsData?.payments ?? []}
          pagination={
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          }
        />
      )}
    </Container>
  );
};
