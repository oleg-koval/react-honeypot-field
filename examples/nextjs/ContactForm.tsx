"use client";

/**
 * Next.js App Router example — complete contact form with honeypot protection.
 *
 * Install:
 *   npm install react-honeypot-field
 *
 * Pair with the server route in ./api/contact/route.ts
 */
import { useState } from "react";
import { HoneypotField, useHoneypot } from "react-honeypot-field";

export function ContactForm() {
  const { fieldProps, validate, mountedAt } = useHoneypot({
    fieldName: "website",
    timeThreshold: 1500,
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Client-side honeypot check — fail silently
    const hp = validate();
    if (!hp.ok) {
      setStatus("done"); // pretend it worked
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
          // Send mount timestamp for server-side time-threshold validation
          _mountedAt: mountedAt,
          // Honeypot field value comes from the form data automatically,
          // but you can also pass it explicitly:
          website: fieldProps.ref && "current" in fieldProps.ref
            ? (fieldProps.ref.current?.value ?? "")
            : "",
        }),
      });

      if (!res.ok) throw new Error("Server error");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return <p>Thanks — we'll be in touch soon.</p>;
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Honeypot — invisible to humans, filled by bots */}
      <HoneypotField {...fieldProps} />

      <label>
        Name
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>

      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>

      <label>
        Message
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </label>

      <button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Sending..." : "Send"}
      </button>

      {status === "error" && (
        <p>Something went wrong. Email us directly: hello@example.com</p>
      )}
    </form>
  );
}
