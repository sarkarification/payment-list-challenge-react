import { I18N } from "@src/constants/i18n";
import { ErrorBox } from "@src/components/components";
import type { PaymentsErrorBoxProps } from "./paymentsErrorBox.config";
import { ERROR_TYPES, type ErrorType } from "@src/types/types";

export const PaymentsErrorBox = ({ errorType }: PaymentsErrorBoxProps) => {
  let errorPaymentsMessage: string;

  switch (errorType as ErrorType) {
    case ERROR_TYPES.NOT_FOUND:
      errorPaymentsMessage = I18N.PAYMENT_NOT_FOUND;
      break;
    case ERROR_TYPES.SERVER_ERROR:
      errorPaymentsMessage = I18N.INTERNAL_SERVER_ERROR;
      break;
    default:
      errorPaymentsMessage = I18N.SOMETHING_WENT_WRONG;
  }

  if (!errorType) {
    return null;
  }
  return <ErrorBox role="alert">{errorPaymentsMessage}</ErrorBox>;
};
