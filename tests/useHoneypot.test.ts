import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useHoneypot } from "../src/useHoneypot.js";

describe("useHoneypot", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns fieldProps, validate, and mountedAt", () => {
    const { result } = renderHook(() => useHoneypot());
    expect(result.current.fieldProps).toBeDefined();
    expect(result.current.validate).toBeTypeOf("function");
    expect(result.current.mountedAt).toBeTypeOf("number");
  });

  it("fieldProps.name defaults to 'website'", () => {
    const { result } = renderHook(() => useHoneypot());
    expect(result.current.fieldProps.name).toBe("website");
  });

  it("fieldProps.name respects fieldName option", () => {
    const { result } = renderHook(() => useHoneypot({ fieldName: "url" }));
    expect(result.current.fieldProps.name).toBe("url");
  });

  it("validate returns ok:false with reason 'submitted_too_fast' when within threshold", () => {
    vi.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
    const { result } = renderHook(() => useHoneypot({ timeThreshold: 1500 }));

    // Advance only 500ms — below threshold
    act(() => vi.advanceTimersByTime(500));
    const validation = result.current.validate();
    expect(validation.ok).toBe(false);
    if (!validation.ok) {
      expect(validation.reason).toBe("submitted_too_fast");
    }
  });

  it("validate returns ok:true when enough time has elapsed", () => {
    vi.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
    const { result } = renderHook(() => useHoneypot({ timeThreshold: 1500 }));

    // Advance 2000ms — above threshold
    act(() => vi.advanceTimersByTime(2000));
    const validation = result.current.validate();
    expect(validation.ok).toBe(true);
  });

  it("validate returns ok:false with reason 'honeypot_filled' when input has value", () => {
    vi.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
    const { result } = renderHook(() => useHoneypot({ timeThreshold: 0 }));

    // Simulate a bot filling the field
    const fakeInput = { value: "http://spam.com" } as HTMLInputElement;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (result.current.fieldProps.ref as any).current = fakeInput;

    const validation = result.current.validate();
    expect(validation.ok).toBe(false);
    if (!validation.ok) {
      expect(validation.reason).toBe("honeypot_filled");
    }
  });

  it("honeypot_filled check takes priority over time check", () => {
    vi.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
    const { result } = renderHook(() => useHoneypot({ timeThreshold: 1500 }));

    // Filled AND too fast — filled reason should win
    const fakeInput = { value: "spam" } as HTMLInputElement;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (result.current.fieldProps.ref as any).current = fakeInput;

    act(() => vi.advanceTimersByTime(500));
    const validation = result.current.validate();
    expect(validation.ok).toBe(false);
    if (!validation.ok) {
      expect(validation.reason).toBe("honeypot_filled");
    }
  });

  it("mountedAt is stable across re-renders", () => {
    vi.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
    const { result, rerender } = renderHook(() => useHoneypot());
    const first = result.current.mountedAt;

    act(() => vi.advanceTimersByTime(1000));
    rerender();

    expect(result.current.mountedAt).toBe(first);
  });

  it("fieldProps includes a ref", () => {
    const { result } = renderHook(() => useHoneypot());
    expect(result.current.fieldProps.ref).toBeDefined();
  });

  it("respects custom timeThreshold of 0 (no delay required)", () => {
    vi.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
    const { result } = renderHook(() => useHoneypot({ timeThreshold: 0 }));

    // No time advance — with threshold 0 it should pass immediately
    const validation = result.current.validate();
    expect(validation.ok).toBe(true);
  });
});
