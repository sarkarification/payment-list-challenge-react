import {
  ClearButton,
  FilterRow,
  SearchButton,
  SearchInput,
  Select,
  Spinner,
} from "@src/components/components";
import { I18N } from "@src/constants/i18n";
import { CURRENCIES } from "@src/constants";
import { PaymentSearchProps } from "./paymentSearch.config";

export const PaymentSearch = ({
  searchTerm = "",
  onSearchChange,
  currency,
  onCurrencyChange,
  onSearch,
  showClearFilters = false,
  onClearFilters,
  isLoading,
}: PaymentSearchProps) => {
  return (
    <form role="search" onSubmit={onSearch}>
      <FilterRow>
        <SearchInput
          aria-label={I18N.SEARCH_LABEL}
          value={searchTerm}
          onChange={onSearchChange}
          placeholder={I18N.SEARCH_PLACEHOLDER}
        />
        <Select
          value={currency}
          onChange={onCurrencyChange}
          aria-label={I18N.CURRENCY_FILTER_LABEL}
        >
          <option value="" aria-label={I18N.ALL_CURRENCIES} />
          {CURRENCIES.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </Select>
        <SearchButton type="submit">{I18N.SEARCH_BUTTON}</SearchButton>
        {showClearFilters && (
          <ClearButton type="button" onClick={onClearFilters}>
            {I18N.CLEAR_FILTERS}
          </ClearButton>
        )}
        {isLoading && <Spinner aria-label={I18N.LOADING_PAYMENTS} />}
      </FilterRow>
    </form>
  );
};
