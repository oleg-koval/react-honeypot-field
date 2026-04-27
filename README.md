# react-honeypot-field

[![npm](https://img.shields.io/npm/v/react-honeypot-field?color=F25A1D&label=npm)](https://www.npmjs.com/package/react-honeypot-field)
[![CI](https://github.com/oleg-koval/react-honeypot-field/actions/workflows/code-quality.yml/badge.svg)](https://github.com/oleg-koval/react-honeypot-field/actions/workflows/code-quality.yml)
[![Coverage](https://codecov.io/gh/oleg-koval/react-honeypot-field/branch/main/graph/badge.svg)](https://codecov.io/gh/oleg-koval/react-honeypot-field)
[![License: MIT](https://img.shields.io/badge/license-MIT-062F34)](LICENSE)
[![Node](https://img.shields.io/node/v/react-honeypot-field)](package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6)](tsconfig.json)

Lightweight honeypot field for React forms. Zero runtime dependencies. Two-layer bot detection: hidden field trap + time threshold. TypeScript-first, Result-typed API.

```bash
npm install react-honeypot-field
```

---

## How it works

Bots that blindly fill every form field will fill the hidden honeypot input. Bots that submit too quickly will fail the time-threshold check. Humans never see the field and always take longer than 1.5 seconds to fill a real form.

Two techniques, one tiny package:

| Technique | How | Why |
|-----------|-----|-----|
| Hidden field | Off-screen via CSS (`position: absolute; left: -9999px`) | `display:none` fields are skipped by some bots — off-screen ones are not |
| Time threshold | Tracks mount timestamp, validates elapsed time on submit | Legitimate users need time to read and type; bots submit instantly |

---

## Quick start

```tsx
// ContactForm.tsx
"use client";
import { HoneypotField, useHoneypot } from "react-honeypot-field";

export function ContactForm() {
  const { fieldProps, validate, mountedAt } = useHoneypot();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const hp = validate();
    if (!hp.ok) {
      // Silent drop — never alert the bot that it failed
      return;
    }

    await fetch("/api/contact", {
      method: "POST",
      body: JSON.stringify({ name, email, message, _mountedAt: mountedAt }),
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <HoneypotField {...fieldProps} />  {/* invisible to humans */}
      {/* your real fields */}
    </form>
  );
}
```

```ts
// app/api/contact/route.ts (Next.js App Router)
import { validateHoneypot } from "react-honeypot-field/validate";

export async function POST(req: Request) {
  const body = await req.json();

  const hp = validateHoneypot({
    fieldValue: body.website,        // honeypot field value
    mountedAt: body._mountedAt,      // timestamp from client
    submittedAt: Date.now(),
  });

  if (!hp.ok) return Response.json({ ok: true }); // silent drop
  // ... real processing
}
```

---

## API

### `<HoneypotField />`

Renders an off-screen text input. Spread `fieldProps` from `useHoneypot()` onto it.

```tsx
import { HoneypotField } from "react-honeypot-field";

<HoneypotField
  name="website"                    // field name in form data (default: "website")
  label="Do not fill this field"    // screen-reader label (default shown)
  tabIndex={-1}                     // keeps it out of tab order (default: -1)
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | `"website"` | Field name. Avoid "honeypot" — bots know that word. |
| `label` | `string` | `"Do not fill this field"` | Text for the `<label>` element. |
| `tabIndex` | `number` | `-1` | Keeps the field out of keyboard tab order. |

All other `<input>` attributes are forwarded to the underlying element.

---

### `useHoneypot(options?)`

```ts
import { useHoneypot } from "react-honeypot-field";

const { fieldProps, validate, mountedAt } = useHoneypot({
  fieldName: "website",   // default: "website"
  timeThreshold: 1500,    // ms, default: 1500
});
```

Returns:

| Key | Type | Description |
|-----|------|-------------|
| `fieldProps` | `{ ref, name }` | Spread onto `<HoneypotField />` |
| `validate()` | `() => HoneypotResult` | Call before submitting. Returns `{ ok: true }` or `{ ok: false, reason }` |
| `mountedAt` | `number` | Unix timestamp (ms) when hook mounted. Send to server for time-threshold check. |

`HoneypotResult`:

```ts
type HoneypotResult =
  | { ok: true }
  | { ok: false; reason: "honeypot_filled" | "submitted_too_fast" };
```

---

### `validateHoneypot(options)` — server-side

```ts
import { validateHoneypot } from "react-honeypot-field/validate";

const result = validateHoneypot({
  fieldValue: body.website,       // string | null | undefined
  mountedAt: body._mountedAt,     // number | null
  submittedAt: Date.now(),        // number | null
  timeThreshold: 1500,            // ms, default: 1500
});

if (!result.ok) {
  // result.reason: "honeypot_filled" | "submitted_too_fast" | "missing_timestamp"
}
```

Imported from a separate entry point so server-side code that uses it does not bundle React.

---

## Recipes

### With React Hook Form

```tsx
const { register } = useForm();
const { fieldProps, validate } = useHoneypot();

const onSubmit = handleSubmit((data) => {
  if (!validate().ok) return;
  // ...
});

<HoneypotField {...fieldProps} />
```

### With Formik

```tsx
const { fieldProps, validate } = useHoneypot();

<Formik
  onSubmit={(values, { setSubmitting }) => {
    if (!validate().ok) { setSubmitting(false); return; }
    // ...
  }}
>
  <HoneypotField {...fieldProps} />
</Formik>
```

### Express / Hono server

```ts
import { validateHoneypot } from "react-honeypot-field/validate";

app.post("/contact", async (req, res) => {
  const hp = validateHoneypot({
    fieldValue: req.body.website,
    mountedAt: req.body._mountedAt,
    submittedAt: Date.now(),
  });
  if (!hp.ok) return res.json({ ok: true }); // silent
  // ...
});
```

---

## Design decisions

**Why not `display:none`?**
Some crawlers and bots detect and skip fields with `display:none` or `visibility:hidden`. Positioning the field off-screen with `position:absolute; left:-9999px` makes it present in the DOM and styled, which fools less sophisticated bots.

**Why not name the field "honeypot"?**
Naive bots skip fields named "honeypot", "trap", "antispam", or similar. The default `"website"` is plausible — it is a field label a legitimate form might have, and many bots will fill it confidently.

**Why 1500ms?**
Empirically, a human needs at least 1-2 seconds to read a form label and start typing. 1500ms catches most automated submissions while never triggering for a human who glances at a form for even a moment. Adjust via `timeThreshold` if your form is unusually short.

**Why a Result type instead of throwing?**
Throwing on validation failure means you need try/catch in your submit handler. A tagged union (`{ ok: true } | { ok: false; reason }`) composes cleanly, works with type narrowing, and never surprises.

---

## Limitations

Honeypot protection adds friction — it is not a hard barrier. A sophisticated bot that:
- Detects off-screen elements and skips them, or
- Deliberately waits before submitting

...will bypass both checks. For high-value forms, layer with rate limiting, IP blocking, and/or a CAPTCHA for defence in depth.

See [SECURITY.md](SECURITY.md) for the full picture.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). PRs welcome — open an issue first for anything non-trivial.

## License

[MIT](LICENSE) — Oleg Koval
