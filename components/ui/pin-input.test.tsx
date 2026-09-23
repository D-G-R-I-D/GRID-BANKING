import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PinInput } from "./pin-input";

describe("PinInput", () => {
  it("is a labelled, masked, numeric field", () => {
    render(<PinInput length={4} label="Transaction PIN" name="pin" />);
    const input = screen.getByLabelText("Transaction PIN");
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveAttribute("inputmode", "numeric");
    expect(input).toHaveAttribute("name", "pin");
  });

  it("keeps digits only, up to the PIN length", async () => {
    render(<PinInput length={4} label="PIN" />);
    const input = screen.getByLabelText("PIN");
    await userEvent.type(input, "4a8-2619");
    expect(input).toHaveValue("4826");
  });

  it("announces errors against the field", () => {
    render(<PinInput length={6} label="PIN" error="Wrong PIN" />);
    const input = screen.getByLabelText("PIN");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Wrong PIN");
  });
});
