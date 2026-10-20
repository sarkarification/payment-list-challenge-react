import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CURRENCIES } from "@src/constants";
import { I18N } from "@src/constants/i18n";
import { PaymentSearch } from "./paymentSearch";
import type { PaymentSearchProps } from "./paymentSearch.config";

afterEach(cleanup);

const setup = (overrides: Partial<PaymentSearchProps> = {}) => {
  const props: PaymentSearchProps = {
    searchTerm: "pay_134",
    currency: "GBP",
    onSearchChange: vi.fn(),
    onCurrencyChange: vi.fn(),
    onSearch: vi.fn((event) => event.preventDefault()),
    onClearFilters: vi.fn(),
    isLoading: false,
    ...overrides,
  };

  return { ...render(<PaymentSearch {...props} />), props };
};

describe("PaymentSearch", () => {
  it("renders accessible search controls with the supplied values", () => {
    setup();

    const input = screen.getByRole("textbox", {
      name: I18N.SEARCH_LABEL,
    }) as HTMLInputElement;
    const select = screen.getByRole("combobox", {
      name: I18N.CURRENCY_FILTER_LABEL,
    }) as HTMLSelectElement;
    expect(input.value).toBe("pay_134");
    expect(input.placeholder).toBe(I18N.SEARCH_PLACEHOLDER);
    expect(select.value).toBe("GBP");
    expect(
      screen
        .getByRole("button", { name: I18N.SEARCH_BUTTON })
        .getAttribute("type"),
    ).toBe("submit");
  });

  it("provides an empty option and all supported currencies", () => {
    setup();

    const options = screen.getAllByRole("option") as HTMLOptionElement[];
    expect(options.map((option) => option.value)).toEqual(["", ...CURRENCIES]);
    expect(options.slice(1).map((option) => option.textContent)).toEqual([
      ...CURRENCIES,
    ]);
  });

  it("passes input changes to the parent", () => {
    let receivedValue: string | undefined;
    const onSearchChange = vi.fn(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        receivedValue = event.currentTarget.value;
      },
    );
    setup({ onSearchChange });

    fireEvent.change(screen.getByRole("textbox", { name: I18N.SEARCH_LABEL }), {
      target: { value: "pay_205" },
    });

    expect(onSearchChange).toHaveBeenCalledTimes(1);
    expect(receivedValue).toBe("pay_205");
  });

  it.each(["", ...CURRENCIES])(
    "passes currency selection '%s' to the parent",
    (value) => {
      let receivedValue: string | undefined;
      const onCurrencyChange = vi.fn(
        (event: React.ChangeEvent<HTMLSelectElement>) => {
          receivedValue = event.currentTarget.value;
        },
      );
      setup({ onCurrencyChange });

      fireEvent.change(
        screen.getByRole("combobox", { name: I18N.CURRENCY_FILTER_LABEL }),
        {
          target: { value },
        },
      );

      expect(onCurrencyChange).toHaveBeenCalledTimes(1);
      expect(receivedValue).toBe(value);
    },
  );

  it("submits the form when Search is clicked", () => {
    const { props } = setup();

    fireEvent.click(screen.getByRole("button", { name: I18N.SEARCH_BUTTON }));

    expect(props.onSearch).toHaveBeenCalledTimes(1);
    expect(props.onSearch).toHaveBeenCalledWith(
      expect.objectContaining({ type: "submit" }),
    );
  });

  it("does not submit while search text or currency changes", () => {
    const { props } = setup();

    fireEvent.change(screen.getByRole("textbox", { name: I18N.SEARCH_LABEL }), {
      target: { value: "pay_205" },
    });
    fireEvent.change(
      screen.getByRole("combobox", { name: I18N.CURRENCY_FILTER_LABEL }),
      {
        target: { value: "EUR" },
      },
    );

    expect(props.onSearch).not.toHaveBeenCalled();
  });

  it("hides Clear Filters by default", () => {
    setup();

    expect(
      screen.queryByRole("button", { name: I18N.CLEAR_FILTERS }),
    ).toBeNull();
  });

  it("calls onClearFilters without submitting the form", () => {
    const { props } = setup({ showClearFilters: true });

    fireEvent.click(screen.getByRole("button", { name: I18N.CLEAR_FILTERS }));

    expect(props.onClearFilters).toHaveBeenCalledTimes(1);
    expect(props.onSearch).not.toHaveBeenCalled();
  });

  it("supports displaying Clear Filters without an optional callback", () => {
    const { props } = setup({
      showClearFilters: true,
      onClearFilters: undefined,
    });

    expect(() =>
      fireEvent.click(screen.getByRole("button", { name: I18N.CLEAR_FILTERS })),
    ).not.toThrow();
    expect(props.onSearch).not.toHaveBeenCalled();
  });

  it("shows the loading indicator only while loading", () => {
    const { props, rerender } = setup({ isLoading: true });

    expect(screen.queryByLabelText(I18N.LOADING_PAYMENTS)).not.toBeNull();

    rerender(<PaymentSearch {...props} isLoading={false} />);

    expect(screen.queryByLabelText(I18N.LOADING_PAYMENTS)).toBeNull();
  });

  it("reflects updated search and currency props", () => {
    const { props, rerender } = setup();

    rerender(<PaymentSearch {...props} searchTerm="pay_205" currency="EUR" />);

    expect(
      (
        screen.getByRole("textbox", {
          name: I18N.SEARCH_LABEL,
        }) as HTMLInputElement
      ).value,
    ).toBe("pay_205");
    expect(
      (
        screen.getByRole("combobox", {
          name: I18N.CURRENCY_FILTER_LABEL,
        }) as HTMLSelectElement
      ).value,
    ).toBe("EUR");
  });
});
