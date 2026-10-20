import { Currency } from "@src/utils/utils";

export interface PaymentSearchProps {
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  currency: Currency | "";
  onCurrencyChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onSearch: (event: React.FormEvent<HTMLFormElement>) => void;
  showClearFilters?: boolean;
  onClearFilters?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  isLoading: boolean;
}
