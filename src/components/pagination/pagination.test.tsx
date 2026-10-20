import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { I18N } from "@src/constants/i18n";
import { Pagination } from "./pagination";

afterEach(cleanup);

describe("Pagination", () => {
  it("displays the current page and total pages", () => {
    render(
      <Pagination currentPage={2} totalPages={5} onPageChange={vi.fn()} />,
    );

    expect(screen.getByText(`${I18N.PAGE_LABEL} 2 of 5`)).toBeInTheDocument();
  });

  it("disables Previous on the first page and allows Next", () => {
    const onPageChange = vi.fn();
    render(
      <Pagination currentPage={1} totalPages={3} onPageChange={onPageChange} />,
    );

    const previous = screen.getByRole("button", { name: I18N.PREVIOUS_BUTTON });
    const next = screen.getByRole("button", { name: I18N.NEXT_BUTTON });
    expect(previous).toBeDisabled();
    expect(next).toBeEnabled();
    fireEvent.click(previous);
    expect(onPageChange).not.toHaveBeenCalled();
    fireEvent.click(next);
    expect(onPageChange).toHaveBeenCalledExactlyOnceWith(2);
  });

  it("disables Next on the last page and allows Previous", () => {
    const onPageChange = vi.fn();
    render(
      <Pagination currentPage={3} totalPages={3} onPageChange={onPageChange} />,
    );

    const previous = screen.getByRole("button", { name: I18N.PREVIOUS_BUTTON });
    const next = screen.getByRole("button", { name: I18N.NEXT_BUTTON });
    expect(previous).toBeEnabled();
    expect(next).toBeDisabled();
    fireEvent.click(next);
    expect(onPageChange).not.toHaveBeenCalled();
    fireEvent.click(previous);
    expect(onPageChange).toHaveBeenCalledExactlyOnceWith(2);
  });

  it("requests adjacent pages when both navigation buttons are enabled", () => {
    const onPageChange = vi.fn();
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />,
    );

    const previous = screen.getByRole("button", { name: I18N.PREVIOUS_BUTTON });
    const next = screen.getByRole("button", { name: I18N.NEXT_BUTTON });
    expect(previous).toBeEnabled();
    expect(next).toBeEnabled();
    fireEvent.click(previous);
    fireEvent.click(next);
    expect(onPageChange.mock.calls).toEqual([[2], [4]]);
  });

  it.each([0, 1])(
    "disables both buttons when totalPages is %i and currentPage is 1",
    (totalPages) => {
      const onPageChange = vi.fn();
      render(
        <Pagination
          currentPage={1}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />,
      );

      for (const button of screen.getAllByRole("button")) {
        expect(button).toBeDisabled();
        fireEvent.click(button);
      }
      expect(onPageChange).not.toHaveBeenCalled();
    },
  );

  it("updates its label and navigation when the parent changes the page", () => {
    const onPageChange = vi.fn();
    const { rerender } = render(
      <Pagination currentPage={1} totalPages={2} onPageChange={onPageChange} />,
    );

    fireEvent.click(screen.getByRole("button", { name: I18N.NEXT_BUTTON }));
    expect(onPageChange).toHaveBeenCalledExactlyOnceWith(2);
    expect(screen.getByText(`${I18N.PAGE_LABEL} 1 of 2`)).toBeInTheDocument();

    rerender(
      <Pagination currentPage={2} totalPages={2} onPageChange={onPageChange} />,
    );

    expect(screen.getByText(`${I18N.PAGE_LABEL} 2 of 2`)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: I18N.PREVIOUS_BUTTON }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: I18N.NEXT_BUTTON }),
    ).toBeDisabled();
    expect(onPageChange).toHaveBeenCalledTimes(1);
  });
});
