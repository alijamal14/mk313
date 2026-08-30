# Deploying mk313.com

The site is static. It currently ships from **GitHub Pages**; this branch prepares a
move to **Cloudflare Pages**, which adds response-header control and serverless
functions (needed for the contact form).

---

## Why move

| | GitHub Pages | Cloudflare Pages |
|---|---|---|
| Custom response headers (CSP, HSTS, cache) | no | yes, via `_headers` |
| Serverless functions | no | yes, via `functions/` |
| Publishes from a private repo | paid plan only | yes, free plan |
| Preview deploy per branch | no | yes |

You already run Cloudflare DNS in front of GitHub Pages, so today every request
takes an extra hop. Moving removes it.

---

## 1. Create the Pages project

Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
**Connect to Git** → select `alijamal14/mk313`.

Build settings — this is a plain static site, so there is no build step:

| Setting | Value |
|---|---|
| Production branch | `main` |
| Framework preset | None |
| Build command | *(leave empty)* |
| Build output directory | `/` |

Cloudflare picks up `functions/` and `_headers` automatically.

## 2. Set up email delivery for the contact form

The form posts to `/api/contact`, which sends through [Resend](https://resend.com).

1. Create a Resend account and **verify the `mk313.com` domain** (add the DKIM/SPF
   records it gives you to Cloudflare DNS). Unverified domains cannot send.
2. Create an API key.
3. In the Pages project → **Settings → Environment variables → Production**:

| Name | Type | Value |
|---|---|---|
| `RESEND_API_KEY` | **Secret** | the key from Resend |
| `CONTACT_TO` | Plaintext | `info@mk313.com` |
| `CONTACT_FROM` | Plaintext | `MK313 website <website@mk313.com>` |

`CONTACT_FROM` must be on the verified domain. Replies go to the sender's own
address, so you can reply directly from your inbox.

Add the same variables to the **Preview** environment if you want the form working
on branch previews.

> Set `RESEND_API_KEY` as a **Secret**, not plaintext. Never commit it to the repo —
> a private repo is access control, not a secret store, and git history is permanent.

## 3. Optional: spam hardening with Turnstile

The form already uses a honeypot field and a minimum fill-time check, which stops
most automated submissions. If spam still gets through:

1. Create a Turnstile widget for `mk313.com`.
2. Add `TURNSTILE_SECRET` as a Secret in the Pages project.
3. Add the Turnstile script and widget to the form, and pass the token as `token`
   in the POST body.

The Function verifies the token whenever `TURNSTILE_SECRET` is present, and skips
verification when it is not — so step 2 alone will start rejecting untokened posts.
Add the widget first.

## 4. Cut the domain over

1. Pages project → **Custom domains** → add `mk313.com` and `www.mk313.com`.
2. Cloudflare rewrites the DNS records to point at Pages. The existing GitHub Pages
   `A`/`CNAME` records are replaced.
3. Verify, then in the GitHub repo → **Settings → Pages**, set Source to **None** so
   the two do not both claim the domain.

Keep `CNAME` in the repo until the cutover is confirmed; it is harmless afterwards.

## 5. Verify after deploy

```bash
curl -sI https://mk313.com/ | grep -iE 'content-security-policy|strict-transport|cache-control'
curl -s -o /dev/null -w '%{http_code}\n' https://mk313.com/sitemap.xml
curl -s -X POST https://mk313.com/api/contact -H 'Content-Type: application/json' -d '{"name":"","email":"","message":""}'
```

The last call should return `422` with per-field errors. Then send a real message
through the form and confirm it lands in `info@mk313.com`.

---

## Cache busting — important for future edits

CSS and JS are served with a one-year immutable cache, so the URL carries a version
token. **When you edit `css/styles.css` or `js/main.js`, bump the token in all four
places or returning visitors will get stale assets:**

- `index.html`, `about.html`, `careers.html` — `?v=N` on the `<link>` and `<script>`
- `sw.js` — the `PRECACHE` entries and the `VERSION` constant

This is what made the first redesign deploy briefly serve new HTML against an old
cached stylesheet.

## Rolling back

Cloudflare Pages keeps every deployment. Dashboard → **Deployments** → pick a
previous one → **Rollback**. No git revert needed.

## Note

`IIS-Deployment-Guide.md` documents an older Windows/IIS hosting path and does not
describe the current setup. Delete it or mark it historical.
