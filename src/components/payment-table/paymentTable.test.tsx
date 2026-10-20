import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { I18N } from "@src/constants/i18n";
import { Payment } from "@src/types/payment";
import { PaymentTable } from "./paymentTable";

afterEach(cleanup);

const payment: Payment = {
  id: "pay_test_1",
  customerName: "Jane Smith",
  amount: 1234.56,
  customerAddress: "London, UK",
  currency: "GBP",
  status: "completed",
  date: "2024-01-05T09:04:03",
  description: "Test payment",
};

describe("PaymentTable", () => {
  it("marks the table busy and hides decorative skeletons from assistive technology", () => {
    render(<PaymentTable loading payments={[payment]} />);

    const table = screen.getByRole("table");
    expect(table.getAttribute("aria-busy")).toBe("true");
    expect(within(table).getAllByRole("columnheader")).toHaveLength(6);
    expect(within(table).getAllByRole("row")).toHaveLength(1);
    const skeletons = table.querySelectorAll("tbody tr");
    expect(skeletons).toHaveLength(5);
    skeletons.forEach((row) => {
      expect(row.getAttribute("aria-hidden")).toBe("true");
      expect(row.children).toHaveLength(1);
      expect(row.firstElementChild?.getAttribute("colspan")).toBe("6");
    });
    expect(screen.queryByText(payment.id)).toBeNull();
  });

  it.each([0, 3, 10])("renders %i skeleton rows when configured", (count) => {
    render(<PaymentTable loading payments={[]} tableSkeletonRowCount={count} />);

    expect(screen.getByRole("table").querySelectorAll("tbody tr")).toHaveLength(count);
  });

  it("replaces skeletons with payments and restores pagination when loading finishes", () => {
    const pagination = <nav aria-label="Pagination">Page 1 of 2</nav>;
    const { rerender } = render(
      <PaymentTable loading payments={[]} pagination={pagination} />,
    );

    expect(screen.queryByRole("navigation", { name: "Pagination" })).toBeNull();

    rerender(<PaymentTable loading={false} payments={[payment]} pagination={pagination} />);

    const table = screen.getByRole("table");
    expect(table.getAttribute("aria-busy")).toBe("false");
    expect(table.querySelectorAll('tbody tr[aria-hidden="true"]')).toHaveLength(0);
    expect(within(table).getAllByRole("row")).toHaveLength(2);
    expect(within(table).getByText(payment.id)).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeTruthy();
  });

  it("renders all six column headers in order", () => {
    render(<PaymentTable payments={[payment]} />);

    expect(
      screen.getAllByRole("columnheader").map((header) => header.textContent),
    ).toEqual([
      I18N.TABLE_HEADER_PAYMENT_ID,
      I18N.TABLE_HEADER_DATE,
      I18N.TABLE_HEADER_AMOUNT,
      I18N.TABLE_HEADER_CUSTOMER,
      I18N.TABLE_HEADER_CURRENCY,
      I18N.TABLE_HEADER_STATUS,
    ]);
  });

  it("renders each payment in its own row with formatted dates and amounts", () => {
    render(
      <PaymentTable
        payments={[
          payment,
          {
            ...payment,
            id: "pay_test_2",
            customerName: "Alex Jones",
            currency: "JPY",
            status: "pending",
          },
        ]}
      />,
    );

    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(3);
    expect(
      within(rows[1])
        .getAllByRole("cell")
        .map((cell) => cell.textContent),
    ).toEqual([
      "pay_test_1",
      "05/01/2024, 09:04:03",
      "£1,234.56",
      "Jane Smith",
      "GBP",
      "completed",
    ]);
    expect(
      within(rows[2])
        .getAllByRole("cell")
        .map((cell) => cell.textContent),
    ).toEqual([
      "pay_test_2",
      "05/01/2024, 09:04:03",
      "JP¥1,235",
      "Alex Jones",
      "JPY",
      "pending",
    ]);
  });

  it.each<Payment["status"]>(["completed", "pending", "failed", "refunded"])(
    "displays the %s payment status",
    (status) => {
      render(<PaymentTable payments={[{ ...payment, status }]} />);

      expect(
        within(screen.getAllByRole("row")[1]).getAllByRole("cell")[5]
          .textContent,
      ).toBe(status);
    },
  );

  it("renders the empty message without a table or pagination for an empty array", () => {
    render(<PaymentTable payments={[]} pagination={<nav aria-label="Pagination">Page 1 of 0</nav>} />);

    expect(screen.getByText(I18N.NO_PAYMENTS_FOUND)).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryByRole("navigation", { name: "Pagination" })).toBeNull();
    expect(screen.queryAllByRole("cell")).toHaveLength(0);
  });

  it("replaces the loading skeleton with the empty message when no payments arrive", () => {
    const { rerender } = render(<PaymentTable loading payments={[]} />);

    expect(screen.getByRole("table").getAttribute("aria-busy")).toBe("true");
    expect(screen.queryByText(I18N.NO_PAYMENTS_FOUND)).toBeNull();

    rerender(<PaymentTable loading={false} payments={[]} />);

    expect(screen.getByText(I18N.NO_PAYMENTS_FOUND)).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("uses fallbacks for empty customer and currency values", () => {
    // Simulate incomplete API data despite the required TypeScript fields.
    const incompletePayment = {
      ...payment,
      customerName: "",
      currency: "",
    } as unknown as Payment;
    render(<PaymentTable payments={[incompletePayment]} />);

    const cells = within(screen.getAllByRole("row")[1]).getAllByRole("cell");
    expect(cells[2].textContent).toBe("1234.56");
    expect(cells[3].textContent).toBe(I18N.EMPTY_CUSTOMER);
    expect(cells[4].textContent).toBe(I18N.EMPTY_CURRENCY);
  });

  it("formats the amount when currency is GBP", () => {
    render(<PaymentTable payments={[{ ...payment, currency: "GBP" }]} />);

    const cells = within(screen.getAllByRole("row")[1]).getAllByRole("cell");
    expect(cells[2].textContent).toBe("£1,234.56");
    expect(cells[4].textContent).toBe("GBP");
  });

  it("renders supplied pagination after the table inside the same wrapper", () => {
    render(
      <PaymentTable
        payments={[payment]}
        pagination={
          <nav aria-label="Pagination">
            <button type="button">{I18N.NEXT_BUTTON}</button>
          </nav>
        }
      />,
    );

    const table = screen.getByRole("table");
    const pagination = screen.getByRole("navigation", { name: "Pagination" });
    expect(
      within(pagination).getByRole("button", { name: I18N.NEXT_BUTTON }),
    ).toBeTruthy();
    expect(table.contains(pagination)).toBe(false);
    expect(pagination.parentElement).toBe(table.parentElement);
    expect(table.nextElementSibling).toBe(pagination);
  });
});
