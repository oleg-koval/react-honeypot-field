import type { InputHTMLAttributes, Ref } from "react";

// ---------------------------------------------------------------------------
// Core result type — same tagged-union convention as trembita
// ---------------------------------------------------------------------------

export type HoneypotResult =
  | { ok: true }
  | { ok: false; reason: HoneypotFailReason };

export type HoneypotFailReason =
  | "honeypot_filled"
  | "submitted_too_fast";

// ---------------------------------------------------------------------------
// Component props
// ---------------------------------------------------------------------------

export interface HoneypotFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "tabIndex"> {
  /** Hidden field name. Avoid "honeypot" — bots know that word.
   *  @default "website" */
  name?: string;
  /** Visible-to-screen-readers label text.
   *  @default "Do not fill this field" */
  label?: string;
  /** @default -1 */
  tabIndex?: number;
}

// ---------------------------------------------------------------------------
// Hook types
// ---------------------------------------------------------------------------

export interface HoneypotOptions {
  /** Field name sent with the form. Avoid obvious names like "bot" or "trap".
   *  @default "website" */
  fieldName?: string;

  /** Minimum milliseconds between mount and a valid submission.
   *  Humans rarely fill a form in under a second.
   *  @default 1500 */
  timeThreshold?: number;
}

export interface HoneypotFieldProps_Internal {
  /** Spread these onto the `<HoneypotField />` component. */
  ref: Ref<HTMLInputElement>;
  name: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

export interface UseHoneypotReturn {
  /** Props to spread onto `<HoneypotField />`. */
  fieldProps: HoneypotFieldProps_Internal;
  /** Client-side validation. Call before submitting. */
  validate: () => HoneypotResult;
  /** Unix timestamp (ms) when the hook mounted. Pass to server for
   *  server-side time-threshold checks. */
  mountedAt: number;
}

// ---------------------------------------------------------------------------
// Server-side validation
// ---------------------------------------------------------------------------

export type ServerHoneypotFailReason =
  | HoneypotFailReason
  | "missing_timestamp";

export type ServerHoneypotResult =
  | { ok: true }
  | { ok: false; reason: ServerHoneypotFailReason };

export interface ServerHoneypotOptions {
  /** The value of the honeypot field from the form submission. */
  fieldValue: string | null | undefined;
  /** Unix timestamp (ms) when the form was mounted (sent from client). */
  mountedAt?: number | null;
  /** Unix timestamp (ms) when the form was submitted (server receives). */
  submittedAt?: number | null;
  /** Minimum elapsed ms to consider a submission human.
   *  @default 1500 */
  timeThreshold?: number;
}
