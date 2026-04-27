# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest minor | Yes |
| Previous minor | Security fixes only |
| Older | No |

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Email **oleg@olegkoval.com** with:

1. A description of the vulnerability and its potential impact
2. Steps to reproduce or a proof-of-concept
3. Any suggested fixes (optional but appreciated)

You will receive an acknowledgement within 48 hours and a resolution timeline within 7 days.

## Scope

This package is a client-side form protection utility. Known limitations by design:

- **Honeypot is not a silver bullet.** Sophisticated bots may detect and skip off-screen fields. Layer with rate limiting and CAPTCHA for high-value forms.
- **Time-threshold checks can be bypassed** by a bot that deliberately waits. This adds friction, not a hard barrier.
- **No server-side IP blocking** is included — that is out of scope for this package.

These are features, not vulnerabilities.
