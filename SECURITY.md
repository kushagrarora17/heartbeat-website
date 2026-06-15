# Security notes

## Runtime hardening

- Production deploys include a strict Netlify header policy.
- Third-party fonts and analytics have been removed to keep the CSP narrow.
- The site scripts are self-hosted under `/public/scripts`.

## Trusted HTML

The article and event detail pages render repository-owned HTML through `sanitizeTrustedHtml()` before using `set:html`.

Allowed content is limited to the curated article/event markup in `src/content/**`.
If new rich text is introduced, update the sanitizer and review the output before merging.

## Review checklist

- Do not add new external script or font domains without updating the CSP.
- Avoid inline event handlers and `javascript:` URLs in content.
- Prefer self-hosted assets and static markup over remote embeds.
