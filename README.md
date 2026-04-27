# react-honeypot-field

<p align="center">
  <img src="./icon.png" alt="react-honeypot-field icon" width="150" height="150" />
</p>

<p align="center">
  <strong>React honeypot field for spam-resistant forms.</strong><br />
  Block common form bots with a hidden input trap and time-threshold validation.
  TypeScript-first, zero runtime dependencies, and ready for Next.js, Remix, Vite,
  React Hook Form, Formik, Express, and Hono.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/react-honeypot-field"><img src="https://img.shields.io/npm/v/react-honeypot-field?color=F25A1D&label=npm" alt="npm version" /></a>
  <a href="https://github.com/oleg-koval/react-honeypot-field/actions/workflows/code-quality.yml"><img src="https://github.com/oleg-koval/react-honeypot-field/actions/workflows/code-quality.yml/badge.svg" alt="CI status" /></a>
  <a href="https://coveralls.io/github/oleg-koval/react-honeypot-field?branch=main"><img src="https://coveralls.io/repos/github/oleg-koval/react-honeypot-field/badge.svg?branch=main" alt="Coverage status" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-062F34" alt="MIT license" /></a>
  <a href="package.json"><img src="https://img.shields.io/node/v/react-honeypot-field" alt="Supported Node version" /></a>
  <a href="tsconfig.json"><img src="https://img.shields.io/badge/TypeScript-strict-3178c6" alt="TypeScript strict mode" /></a>
</p>

```bash
npm install react-honeypot-field
```

## Why use it

`react-honeypot-field` is a small React anti-spam package for contact forms,
lead forms, signup forms, and other low-friction form flows where a CAPTCHA
would be too heavy.

- **CAPTCHA-free spam protection** for common form bots.
- **Two-layer bot detection**: hidden field trap plus submit-time threshold.
- **Client and server checks** with `useHoneypot()` and `validateHoneypot()`.
- **Typed Result API**: no thrown validation errors in submit handlers.
- **Zero runtime dependencies** and a separate server validation entry point.

For high-value or abuse-prone forms, use this with rate limiting, IP reputation,
email verification, or a CAPTCHA fallback.

## Quick start

### 1. Add the hidden field to your React form

```tsx
"use client";

import type { FormEvent } from "react";
import { HoneypotField, useHoneypot } from "react-honeypot-field";

export function ContactForm() {
  const { fieldProps, validate, mountedAt } = useHoneypot({
    fieldName: "website",
    timeThreshold: 1500,
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const hp = validate();
    if (!hp.ok) {
      // Silent drop: do not tell the bot which check failed.
      return;
    }

    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      message: String(form.get("message") ?? ""),
      website: String(form.get(fieldProps.name) ?? ""),
      _mountedAt: mountedAt,
    };

    await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <HoneypotField {...fieldProps} />

      <label>
        Name
        <input name="name" autoComplete="name" required />
      </label>

      <label>
        Email
        <input name="email" type="email" autoComplete="email" required />
      </label>

      <label>
        Message
        <textarea name="message" required />
      </label>

      <button type="submit">Send</button>
    </form>
  );
}
```

### 2. Validate again on the server

```ts
// app/api/contact/route.ts (Next.js App Router)
import { validateHoneypot } from "react-honeypot-field/validate";

export async function POST(req: Request) {
  const body = (await req.json()) as Record<string, unknown>;

  const hp = validateHoneypot({
    fieldValue: typeof body.website === "string" ? body.website : "",
    mountedAt: typeof body._mountedAt === "number" ? body._mountedAt : null,
    submittedAt: Date.now(),
  });

  if (!hp.ok) {
    // Return success so bots cannot learn how they were detected.
    return Response.json({ ok: true });
  }

  // Process the real form submission.
  return Response.json({ ok: true });
}
```

## How it catches bots

Bots that blindly fill every form field will fill the hidden honeypot input.
Bots that submit instantly will fail the time-threshold check. Humans never see
the field and usually need more than 1.5 seconds to read and submit a real form.

| Technique      | How                                                                  | Why                                                                       |
| -------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Hidden field   | Off-screen with `position: absolute; left: -9999px`                  | Some bots skip `display:none` fields, but still fill positioned fields.   |
| Time threshold | Tracks the form mount timestamp and validates elapsed time on submit | Automated submissions often arrive faster than a human can read and type. |

## API

### `<HoneypotField />`

Renders an off-screen text input. Spread `fieldProps` from `useHoneypot()` onto
it.

```tsx
import { HoneypotField } from "react-honeypot-field";

<HoneypotField name="website" label="Do not fill this field" tabIndex={-1} />;
```

| Prop       | Type     | Default                    | Description                                                              |
| ---------- | -------- | -------------------------- | ------------------------------------------------------------------------ |
| `name`     | `string` | `"website"`                | Field name. Avoid obvious names like `"honeypot"`, `"trap"`, or `"bot"`. |
| `label`    | `string` | `"Do not fill this field"` | Text for the `<label>` element.                                          |
| `tabIndex` | `number` | `-1`                       | Keeps the field out of keyboard tab order.                               |

All other `<input>` attributes are forwarded to the underlying element.

### `useHoneypot(options?)`

```ts
import { useHoneypot } from "react-honeypot-field";

const { fieldProps, validate, mountedAt } = useHoneypot({
  fieldName: "website",
  timeThreshold: 1500,
});
```

Returns:

| Key          | Type                   | Description                                                                                            |
| ------------ | ---------------------- | ------------------------------------------------------------------------------------------------------ |
| `fieldProps` | `{ ref, name }`        | Spread onto `<HoneypotField />`.                                                                       |
| `validate()` | `() => HoneypotResult` | Call before submitting. Returns `{ ok: true }` or `{ ok: false, reason }`.                             |
| `mountedAt`  | `number`               | Unix timestamp in milliseconds when the hook mounted. Send to the server for the time-threshold check. |

`HoneypotResult`:

```ts
type HoneypotResult =
  | { ok: true }
  | { ok: false; reason: "honeypot_filled" | "submitted_too_fast" };
```

### `validateHoneypot(options)`

Server-side validation is available from a separate entry point so API routes,
server actions, and Node handlers do not bundle React.

```ts
import { validateHoneypot } from "react-honeypot-field/validate";

const result = validateHoneypot({
  fieldValue: body.website,
  mountedAt: body._mountedAt,
  submittedAt: Date.now(),
  timeThreshold: 1500,
});

if (!result.ok) {
  // result.reason:
  // "honeypot_filled" | "submitted_too_fast" | "missing_timestamp"
}
```

| Option          | Type                          | Default     | Description                                                   |
| --------------- | ----------------------------- | ----------- | ------------------------------------------------------------- |
| `fieldValue`    | `string \| null \| undefined` | Required    | Honeypot field value from the submitted form.                 |
| `mountedAt`     | `number \| null`              | `undefined` | Client mount timestamp from `useHoneypot()`.                  |
| `submittedAt`   | `number \| null`              | `undefined` | Server submit timestamp, usually `Date.now()`.                |
| `timeThreshold` | `number`                      | `1500`      | Minimum elapsed milliseconds required for a valid submission. |

## Recipes

### React Hook Form

```tsx
const formRef = useRef<HTMLFormElement>(null);
const { register, handleSubmit } = useForm<ContactValues>();
const { fieldProps, validate, mountedAt } = useHoneypot();

const onSubmit = handleSubmit((data) => {
  if (!validate().ok) return;

  const form = formRef.current ? new FormData(formRef.current) : null;
  const website = String(form?.get(fieldProps.name) ?? "");

  return fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, website, _mountedAt: mountedAt }),
  });
});

<form ref={formRef} onSubmit={onSubmit}>
  <HoneypotField {...fieldProps} />
  <input {...register("email")} />
</form>;
```

### Formik

```tsx
const formRef = useRef<HTMLFormElement>(null);
const { fieldProps, validate, mountedAt } = useHoneypot();

<Formik
  initialValues={{ email: "", message: "" }}
  onSubmit={(values, { setSubmitting }) => {
    if (!validate().ok) {
      setSubmitting(false);
      return;
    }

    const form = formRef.current ? new FormData(formRef.current) : null;
    const website = String(form?.get(fieldProps.name) ?? "");

    return fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, website, _mountedAt: mountedAt }),
    });
  }}
>
  {({ handleSubmit }) => (
    <form ref={formRef} onSubmit={handleSubmit}>
      <HoneypotField {...fieldProps} />
      <Field name="email" type="email" />
    </form>
  )}
</Formik>;
```

### Express or Hono

```ts
import { validateHoneypot } from "react-honeypot-field/validate";

app.post("/contact", async (req, res) => {
  const hp = validateHoneypot({
    fieldValue: req.body.website,
    mountedAt: req.body._mountedAt,
    submittedAt: Date.now(),
  });

  if (!hp.ok) return res.json({ ok: true });

  // Process the real form submission.
});
```

## Security notes

Honeypot spam protection is a heuristic, not a hard security boundary. A
sophisticated bot can bypass these checks by detecting off-screen elements,
leaving them empty, or waiting before submitting.

Use `react-honeypot-field` as a low-friction first layer. For high-risk forms,
combine it with server-side rate limiting, abuse monitoring, IP controls, email
verification, or a CAPTCHA challenge.

See [SECURITY.md](SECURITY.md) for the full security model.

## Design decisions

### Why not `display:none`?

Some crawlers and bots detect and skip fields with `display:none` or
`visibility:hidden`. Positioning the field off-screen keeps it present in the
DOM and styled, which catches less sophisticated bots.

### Why not name the field `"honeypot"`?

Naive bots skip fields named `"honeypot"`, `"trap"`, `"antispam"`, or similar.
The default `"website"` is plausible because many real forms include a website
field.

### Why 1500ms?

A human usually needs at least 1 to 2 seconds to read a form label and start
typing. `1500` milliseconds catches many automated submissions while staying out
of the way for normal users. Adjust `timeThreshold` if your form is unusually
short.

### Why a Result type instead of throwing?

Throwing on validation failure means you need `try`/`catch` in your submit
handler. A tagged union (`{ ok: true } | { ok: false; reason }`) works with type
narrowing and keeps submit handlers explicit.

## Documentation

- [API reference](https://oleg-koval.github.io/react-honeypot-field)
- [Next.js example](examples/nextjs)
- [Security policy](SECURITY.md)
- [Contributing guide](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)

## License

[MIT](LICENSE) - Oleg Koval
