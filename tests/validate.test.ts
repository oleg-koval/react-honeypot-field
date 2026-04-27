import { describe, it, expect } from "vitest";
import { validateHoneypot } from "../src/validate.js";

const NOW = 1_700_000_000_000; // fixed reference timestamp (ms)

describe("validateHoneypot", () => {
  // --- Honeypot field filled ---

  it("returns ok:false / honeypot_filled when fieldValue is non-empty string", () => {
    const result = validateHoneypot({ fieldValue: "http://spam.com" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("honeypot_filled");
  });

  it("returns ok:false / honeypot_filled for whitespace-only values", () => {
    // A space is still a non-zero-length fill
    const result = validateHoneypot({ fieldValue: " " });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("honeypot_filled");
  });

  it("ignores null fieldValue (treated as empty)", () => {
    const result = validateHoneypot({
      fieldValue: null,
      mountedAt: NOW,
      submittedAt: NOW + 2000,
    });
    expect(result.ok).toBe(true);
  });

  it("ignores undefined fieldValue (treated as empty)", () => {
    const result = validateHoneypot({
      fieldValue: undefined,
      mountedAt: NOW,
      submittedAt: NOW + 2000,
    });
    expect(result.ok).toBe(true);
  });

  it("ignores empty string fieldValue", () => {
    const result = validateHoneypot({
      fieldValue: "",
      mountedAt: NOW,
      submittedAt: NOW + 2000,
    });
    expect(result.ok).toBe(true);
  });

  // --- Time threshold ---

  it("returns ok:false / submitted_too_fast when elapsed < threshold", () => {
    const result = validateHoneypot({
      fieldValue: "",
      mountedAt: NOW,
      submittedAt: NOW + 500, // only 500ms elapsed
      timeThreshold: 1500,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("submitted_too_fast");
  });

  it("returns ok:true when elapsed >= threshold", () => {
    const result = validateHoneypot({
      fieldValue: "",
      mountedAt: NOW,
      submittedAt: NOW + 2000,
      timeThreshold: 1500,
    });
    expect(result.ok).toBe(true);
  });

  it("returns ok:true when elapsed === threshold exactly", () => {
    const result = validateHoneypot({
      fieldValue: "",
      mountedAt: NOW,
      submittedAt: NOW + 1500,
      timeThreshold: 1500,
    });
    expect(result.ok).toBe(true);
  });

  it("respects a custom timeThreshold of 0 (always passes time check)", () => {
    const result = validateHoneypot({
      fieldValue: "",
      mountedAt: NOW,
      submittedAt: NOW + 1,
      timeThreshold: 0,
    });
    expect(result.ok).toBe(true);
  });

  it("defaults timeThreshold to 1500ms when not provided", () => {
    const tooFast = validateHoneypot({
      fieldValue: "",
      mountedAt: NOW,
      submittedAt: NOW + 1400,
    });
    expect(tooFast.ok).toBe(false);

    const slowEnough = validateHoneypot({
      fieldValue: "",
      mountedAt: NOW,
      submittedAt: NOW + 1500,
    });
    expect(slowEnough.ok).toBe(true);
  });

  // --- Missing timestamps ---

  it("skips time check when both mountedAt and submittedAt are absent", () => {
    const result = validateHoneypot({ fieldValue: "" });
    expect(result.ok).toBe(true);
  });

  it("returns ok:false / missing_timestamp when mountedAt provided but submittedAt missing", () => {
    const result = validateHoneypot({
      fieldValue: "",
      mountedAt: NOW,
      // submittedAt omitted
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("missing_timestamp");
  });

  it("skips time check when only submittedAt provided (no mountedAt)", () => {
    // Can't compute elapsed without mountedAt — skip time check
    const result = validateHoneypot({
      fieldValue: "",
      submittedAt: NOW,
    });
    expect(result.ok).toBe(true);
  });

  // --- Priority ---

  it("honeypot_filled takes priority over time check", () => {
    const result = validateHoneypot({
      fieldValue: "spam",
      mountedAt: NOW,
      submittedAt: NOW + 2000, // would pass time check
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("honeypot_filled");
  });
});
