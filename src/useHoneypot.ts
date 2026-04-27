import { useRef, useCallback } from "react";
import type {
  HoneypotOptions,
  HoneypotResult,
  UseHoneypotReturn,
} from "./types.js";

/**
 * Hook that wires together:
 *  1. A ref for the hidden honeypot input element
 *  2. A mount timestamp for time-threshold validation
 *  3. A `validate()` function for client-side checks before submission
 *
 * @example
 * ```tsx
 * function ContactForm() {
 *   const { fieldProps, validate, mountedAt } = useHoneypot();
 *
 *   function handleSubmit(e: React.FormEvent) {
 *     e.preventDefault();
 *     const result = validate();
 *     if (!result.ok) return; // silent drop — don't alert bots
 *
 *     // include mountedAt in your API payload for server-side check
 *     await fetch('/api/contact', {
 *       body: JSON.stringify({ ...formData, _mountedAt: mountedAt }),
 *     });
 *   }
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <HoneypotField {...fieldProps} />
 *       ...
 *     </form>
 *   );
 * }
 * ```
 */
export function useHoneypot(options: HoneypotOptions = {}): UseHoneypotReturn {
  const { fieldName = "website", timeThreshold = 1500 } = options;

  // Capture mount time once — stable across re-renders
  const mountedAt = useRef(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = useCallback((): HoneypotResult => {
    const value = inputRef.current?.value ?? "";

    if (value.length > 0) {
      return { ok: false, reason: "honeypot_filled" };
    }

    const elapsed = Date.now() - mountedAt.current;
    if (elapsed < timeThreshold) {
      return { ok: false, reason: "submitted_too_fast" };
    }

    return { ok: true };
  }, [timeThreshold]);

  return {
    fieldProps: {
      ref: inputRef,
      name: fieldName,
    },
    validate,
    mountedAt: mountedAt.current,
  };
}
