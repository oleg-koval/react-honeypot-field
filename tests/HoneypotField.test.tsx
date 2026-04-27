import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { HoneypotField } from "../src/HoneypotField.js";

describe("HoneypotField", () => {
  it("renders a text input", () => {
    const { container } = render(<HoneypotField />);
    const input = container.querySelector("input");
    expect(input).toBeTruthy();
    expect(input?.type).toBe("text");
  });

  it("defaults field name to 'website'", () => {
    const { container } = render(<HoneypotField />);
    expect(container.querySelector("input")?.name).toBe("website");
  });

  it("accepts a custom field name", () => {
    const { container } = render(<HoneypotField name="url" />);
    expect(container.querySelector("input")?.name).toBe("url");
  });

  it("sets tabIndex to -1 by default", () => {
    const { container } = render(<HoneypotField />);
    expect(container.querySelector("input")?.tabIndex).toBe(-1);
  });

  it("sets autoComplete to off", () => {
    const { container } = render(<HoneypotField />);
    expect(container.querySelector("input")?.autocomplete).toBe("off");
  });

  it("wraps in an aria-hidden container", () => {
    const { container } = render(<HoneypotField />);
    const wrapper = container.querySelector("div");
    expect(wrapper?.getAttribute("aria-hidden")).toBe("true");
  });

  it("positions wrapper off-screen via inline style", () => {
    const { container } = render(<HoneypotField />);
    const wrapper = container.querySelector("div") as HTMLDivElement;
    expect(wrapper.style.position).toBe("absolute");
    expect(wrapper.style.left).toBe("-9999px");
  });

  it("renders a label with the default text", () => {
    const { container } = render(<HoneypotField />);
    const label = container.querySelector("label");
    expect(label?.textContent).toBe("Do not fill this field");
  });

  it("renders a label with custom text", () => {
    const { container } = render(<HoneypotField label="Leave blank" />);
    expect(container.querySelector("label")?.textContent).toBe("Leave blank");
  });

  it("generates a stable id from the field name", () => {
    const { container } = render(<HoneypotField name="url" />);
    const input = container.querySelector("input");
    const label = container.querySelector("label");
    expect(input?.id).toBe("hp-field-url");
    expect(label?.htmlFor).toBe("hp-field-url");
  });

  it("accepts an explicit id", () => {
    const { container } = render(<HoneypotField id="my-hp" />);
    expect(container.querySelector("input")?.id).toBe("my-hp");
    expect(container.querySelector("label")?.htmlFor).toBe("my-hp");
  });

  it("passes through extra input attributes", () => {
    const { container } = render(
      <HoneypotField data-testid="hp" className="hidden" />,
    );
    const input = container.querySelector("input");
    expect(input?.getAttribute("data-testid")).toBe("hp");
    expect(input?.className).toBe("hidden");
  });

  it("sets displayName for DevTools", () => {
    expect(HoneypotField.displayName).toBe("HoneypotField");
  });
});
