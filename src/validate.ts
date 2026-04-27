import type {
  ServerHoneypotOptions,
  ServerHoneypotResult,
} from "./types.js";

/**
 * Server-side honeypot validation.
 *
 * Use this in your API route / server action after the client passes
 * `fieldValue` and optionally `mountedAt` in the request body.
 *
 * @example Next.js App Router
 * ```ts
 * // app/api/contact/route.ts
 * import { validateHoneypot } from 'react-honeypot-field/validate';
 *
 * export async function POST(req: Request) {
 *   const body = await req.json();
 *
 *   const hp = validateHoneypot({
 *     fieldValue: body.website,
 *     mountedAt: body._mountedAt,
 *     submittedAt: Date.now(),
 *   });
 *
 *   if (!hp.ok) {
 *     // Silently return 200 — don't reveal to the bot that it failed
 *     return Response.json({ ok: true });
 *   }
 *
 *   // ... process the real form
 * }
 * ```
 *
 * @example Express
 * ```ts
 * app.post('/contact', (req, res) => {
 *   const hp = validateHoneypot({
 *     fieldValue: req.body.website,
 *     mountedAt: req.body._mountedAt,
 *     submittedAt: Date.now(),
 *   });
 *
 *   if (!hp.ok) return res.json({ ok: true }); // silent drop
 *
 *   // ... process the real form
 * });
 * ```
 */
export function validateHoneypot(
  opts: ServerHoneypotOptions,
): ServerHoneypotResult {
  const { fieldValue, mountedAt, submittedAt, timeThreshold = 1500 } = opts;

  // Filled honeypot — definite bot
  if (fieldValue != null && fieldValue.length > 0) {
    return { ok: false, reason: "honeypot_filled" };
  }

  // Time-threshold check (only when both timestamps are present)
  if (mountedAt != null && submittedAt != null) {
    const elapsed = submittedAt - mountedAt;
    if (elapsed < timeThreshold) {
      return { ok: false, reason: "submitted_too_fast" };
    }
  } else if (mountedAt != null && submittedAt == null) {
    // mountedAt provided but no submittedAt — caller error
    return { ok: false, reason: "missing_timestamp" };
  }

  return { ok: true };
}
