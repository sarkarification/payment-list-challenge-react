import { createElement } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { I18N } from "@src/constants/i18n";
import { PaymentsErrorBox } from "./paymentsErrorBox";
import { ERROR_TYPES, ErrorType } from "@src/types/types";

afterEach(cleanup);

describe("PaymentsErrorBox", () => {
  it.each<[ErrorType, string]>([
    [ERROR_TYPES.NOT_FOUND, I18N.PAYMENT_NOT_FOUND],
    [ERROR_TYPES.SERVER_ERROR, I18N.INTERNAL_SERVER_ERROR],
    [ERROR_TYPES.UNKNOWN, I18N.SOMETHING_WENT_WRONG],
  ])("renders the %s message as an alert", (errorType, message) => {
    render(createElement(PaymentsErrorBox, { errorType }));

    expect(screen.getByRole("alert").textContent).toBe(message);
  });

  it.each([null, undefined])(
    "renders nothing when errorType is %s",
    (value) => {
      const { container } = render(
        createElement(PaymentsErrorBox, {
          errorType: value as unknown as ErrorType,
        }),
      );

      expect(container.childNodes).toHaveLength(0);
      expect(screen.queryByRole("alert")).toBeNull();
    },
  );

  it.each(["invalid", "toString", "__proto__", 404, {}])(
    "falls back to the generic message for invalid runtime value %j",
    (value) => {
      render(
        createElement(PaymentsErrorBox, { errorType: value as ErrorType }),
      );

      expect(screen.getByRole("alert").textContent).toBe(
        I18N.SOMETHING_WENT_WRONG,
      );
    },
  );
});
