import { PaginationButton, PaginationRow } from "@src/components/components";
import { I18N } from "@src/constants/i18n";
import { PaginationProps } from "./pagination.config";

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  return (
    <PaginationRow>
      <PaginationButton
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        {I18N.PREVIOUS_BUTTON}
      </PaginationButton>
      <span>
        {I18N.PAGE_LABEL} {currentPage} {I18N.PAGE_OF} {totalPages}
      </span>
      <PaginationButton
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        {I18N.NEXT_BUTTON}
      </PaginationButton>
    </PaginationRow>
  );
};
