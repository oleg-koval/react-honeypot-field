/**
 * Next.js App Router API route — server-side honeypot validation example.
 *
 * This pairs with ContactForm.tsx in the parent directory.
 */
import { validateHoneypot } from "react-honeypot-field/validate";

export async function POST(request: Request) {
  const body = (await request.json()) as Record<string, unknown>;

  const hp = validateHoneypot({
    fieldValue: typeof body.website === "string" ? body.website : "",
    mountedAt: typeof body._mountedAt === "number" ? body._mountedAt : null,
    submittedAt: Date.now(),
    timeThreshold: 1500,
  });

  if (!hp.ok) {
    // Return 200 to avoid revealing the rejection to bots.
    // Log internally if you want visibility:
    //   console.warn("Honeypot triggered:", hp.reason, request.headers.get("x-forwarded-for"));
    return Response.json({ ok: true });
  }

  // --- your real processing here ---
  const name = String(body.name ?? "");
  const email = String(body.email ?? "");
  const message = String(body.message ?? "");

  console.log("Legitimate inquiry from:", name, email);
  void message; // process as needed

  return Response.json({ ok: true });
}
