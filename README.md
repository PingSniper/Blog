# Doraemon — CTF Writeups & Certifications

A static, read-only blog. Visitors can browse writeups, read and download
them, and view/download your certifications. There is **no login, no
database and no admin panel on the public site** — that's what makes it
secure: there is nothing for a visitor to break into, because there is
nothing to edit.

You are the only one who can change content, because changing content
means editing `data.js` and pushing to this GitHub repository. Only
people you add as collaborators can push. Everyone else only ever
receives the finished, read-only pages.

## File structure

```
index.html      the page shell (header, nav, footer)
style.css       all the styling (red Doraemon theme)
app.js          the site logic — you should not need to touch this
data.js         <-- THIS is the file you edit to add/change/remove content
assets/
  pfp.jpg       your profile picture (header + whoami page)
  hero.jpg      the home page hero image
  writeups/     images and attachments used inside writeups, one folder per post
  certs/        certificate images/PDFs
```

## 1. Put this on GitHub

1. Create a new **public** repository on GitHub, e.g. `doraemon-blog`.
2. Upload all the files in this folder to the repository (drag-and-drop
   on the GitHub web UI works fine, or use `git` — see below).
3. Go to the repo's **Settings → Pages**.
4. Under "Build and deployment", set **Source** to "Deploy from a
   branch", branch `main`, folder `/ (root)`. Save.
5. GitHub gives you a URL like `https://yourusername.github.io/doraemon-blog/`.
   It can take a minute to go live.

### Using git instead of the web UI

```bash
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/YOURNAME/doraemon-blog.git
git push -u origin main
```

## 2. How to add, edit or remove a writeup

Open `data.js` in any text editor (GitHub lets you edit files in the
browser — click the pencil icon on the file).

To **add** a writeup, copy an existing object inside the `WRITEUPS`
array and change its fields:

```js
{
  id: "my-new-box",              // used in the URL as #my-new-box — unique, lowercase, dashes only
  title: "My New Box",
  ctf: "Hack Smarter Labs",
  cat: "Windows",                 // must be one of the CATS list above
  diff: "Medium",                 // Easy | Medium | Hard | Insane
  pts: 0,
  date: "2026-11-12",
  summary: "One sentence shown on the card.",
  files: [],                      // optional downloadable attachments
  body: `
## Recon

Write your writeup here in Markdown: \`#\`, \`##\`, \`###\` for headings,
\`- \` for list items, \`**bold**\`, \`\`\`code fences\`\`\` for terminal
output, and \`![alt text](assets/writeups/my-new-box/screenshot.png)\`
for images.
`
}
```

To **edit** a writeup, just change its fields in place.

To **remove** a writeup, delete its whole `{ ... }` object from the
array (remember to also delete the trailing comma if it was the last
item).

Images and other attachments for a writeup go in their own folder
under `assets/writeups/<your-id>/`, and you reference them from `body`
with a relative path, e.g. `assets/writeups/my-new-box/nmap.png`.

Commit and push your changes — GitHub Pages rebuilds automatically
within a minute or two, and everyone sees the update.

## 3. How to add a certification

Add an object to the `CERTS` array in `data.js`:

```js
{
  id: "c-oscp",
  name: "OSCP",
  issuer: "Offensive Security",
  date: "2026-12",
  credId: "",                         // optional
  link: "",                           // optional verification URL
  note: "One line about the cert.",
  fileUrl: "assets/certs/oscp.jpg",   // upload the image/PDF to assets/certs first
  fileType: "image/jpeg"              // or "application/pdf"
}
```

## 4. Security — why visitors can only read

This design has no attack surface for content tampering, because the
public site is just files: HTML, CSS, JS and images served as-is. There
is no server-side code, no database and no login form for an attacker
to target. The only way to change what's published is to push a commit
to this GitHub repository, so your GitHub account **is** the admin
system. Protect it accordingly:

- Use a strong, unique password.
- Turn on two-factor authentication (an authenticator app or a
  passkey, not SMS) under GitHub **Settings → Password and
  authentication**.
- Save your recovery codes somewhere offline.
- Don't add anyone as a collaborator on the repo unless you want them
  to be able to publish changes too.
- Turn on **branch protection** for `main` if you ever work with
  others, so changes need a review before they go live.
- Never commit secrets (API keys, passwords you use elsewhere) into
  this repo — it's public.

## 5. Before you make it public

A few things worth checking in your writeups before they go live:

- Remove flags for any lab that is still active, and check that
  Hack Smarter (or whichever platform) allows public writeups of it.
- Scrub real IP addresses, internal hostnames, tokens, or anything
  tied to a real client or employer.
- Strip identifying metadata from screenshots (machine name, your
  real username, location) and blur personal details.
- On certificate images, consider blurring your date of birth,
  address, or any QR code that links to a private verification page
  with personal data on it.

## 6. Custom domain (optional)

If you own a domain, you can point it at GitHub Pages: add a `CNAME`
file to the repo root containing just your domain (e.g.
`writeups.example.com`), and add the DNS records GitHub's docs
specify. See **Settings → Pages → Custom domain** in the repo for the
exact records to add.
