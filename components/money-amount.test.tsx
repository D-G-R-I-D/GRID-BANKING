import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MoneyAmount } from "./money-amount";

describe("MoneyAmount", () => {
  it("renders a formatted naira amount", () => {
    render(<MoneyAmount minorUnits={1_234_56} />);
    expect(screen.getByText(/(₦|NGN)\s?1,234\.56/)).toBeInTheDocument();
  });

  it("adds a plus sign and positive tone when signed", () => {
    render(<MoneyAmount minorUnits={500} signed />);
    expect(screen.getByText(/\+.*5\.00/)).toHaveClass("text-positive");
  });

  it("shows a minus sign for outgoing amounts", () => {
    render(<MoneyAmount minorUnits={-500} signed />);
    expect(screen.getByText(/−.*5\.00/)).toHaveClass("text-critical");
  });
});
