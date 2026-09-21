# TRANSLATE — Yōkai Containment Bureau

Interactive campaign site for ONE OR EIGHT's **TRANSLATE**. Fans answer eight
personality questions, get classified as one of eight yōkai, and find out which
member of ONE OR EIGHT is assigned to apprehend them.

Built as a reskin of KONBINI 108.

---

## What's in here

```
index.html            The entire site — markup, styles, logic. No build step.
assets/
  logo.png            ONE OR EIGHT mark (transparent)
  hero.jpg            Front page group photo (grayscale)
  video/
    intro.mp4/.jpg    Plays after "Begin Questioning"
    q1–q8.mp4/.jpg    One clip per question, plus poster frames
  members/            EMPTY — drop the 8 agent photos here (see below)
```

No framework, no bundler, no npm install. It is one HTML file and a folder of
media. Open `index.html` in a browser and it runs.

---

## Running it locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

Use a server rather than double-clicking the file — opening it as `file://`
stops the videos loading in some browsers.

---

## Deploying

### GitHub

1. Create a new repository on GitHub (private is fine).
2. From this folder:

```bash
git init
git add .
git commit -m "TRANSLATE campaign site"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

If you'd rather not use the command line: on the new repo page click
**uploading an existing file**, then drag this whole folder in. That works fine
for a project this size.

### Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. **Add New → Project**, then import the repo you just pushed.
3. Leave every setting on its default. Framework preset should say **Other**.
   There is no build command and no output directory — it's a static site.
4. **Deploy.**

It goes live at `https://your-project.vercel.app` in about thirty seconds.
Every `git push` to `main` redeploys automatically.

### Custom domain

In the Vercel project: **Settings → Domains → Add**. Enter the subdomain you
want (for example `translate.crewpass108.com`), then add the CNAME record
Vercel gives you to your DNS. It's the same process used for KONBINI 108.

---

## Things you'll want to change

### Agent photos

The report currently shows a placeholder silhouette where the member photo
goes. To wire the real ones up:

1. Drop eight images into `assets/members/` named `mizuki.jpg`, `neo.jpg`,
   `reia.jpg`, `ryota.jpg`, `souma.jpg`, `takeru.jpg`, `tsubasa.jpg`,
   `yuga.jpg`. Portrait crop, roughly 660×880.
2. In `index.html`, find the `MEMBERS` object near the top of the `<script>`
   and add a `photo` key to each entry.

### Which member catches which yōkai

Near the top of the script, each yōkai carries an `agent` field:

```js
oni: { name:'ONI', jp:'鬼', key:'SDH', agent:'takeru', ... }
```

Change the value to any member id. **These are placeholders** — they need
replacing with the real mapping once the members have answered.

### The questions

The `Q` array holds all eight. Each question is tagged to one of three axes
(`P` presence, `A` approach, `T` tempo) and every option carries `v:+1` or
`v:-1` for which side of that axis it leans.

**Keep two `+1` and two `-1` options per question.** That balance is what makes
all eight yōkai come out at exactly 12.5%. Changing the wording is safe;
changing the ratio is not.

### Clips

Swap any file in `assets/video/`, keeping the filename. To change a caption,
edit the `CLIPS` object in the script.

To re-encode new footage to match:

```bash
ffmpeg -i input.mov \
  -vf "scale=1280:720,hue=s=0,eq=contrast=1.04:brightness=0.03:gamma=1.28" \
  -an -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 27 -r 24 \
  -movflags +faststart q1.mp4

ffmpeg -i q1.mp4 -vframes 1 -q:v 4 q1.jpg
```

Raise `gamma` for dark footage, lower it toward `0.96` and raise `contrast` for
bright footage. Every clip needs its poster frame generated alongside it.

---

## Not done yet

- **Share is built.** Clicking Instagram / X / TikTok renders a 1080×1920
  case file off-screen, snapshots it with html2canvas, and passes the PNG to
  the native share sheet on mobile. Desktop downloads the image and copies the
  caption. Change `SHARE_URL` near the share module once the domain is final.
- **Newsletter** is wired up (`api/subscribe.js`) but needs credentials. In
  Vercel: **Settings → Environment Variables**, add `MAILCHIMP_API_KEY` and
  `MAILCHIMP_AUDIENCE_ID`, apply to Production/Preview/Development, then
  **redeploy** — env vars only take effect on a new deployment. Subscribers are
  tagged `yokai:<id>`, `agent:<id>` and `source:translate`, with matching YOKAI
  and AGENT merge fields, so the audience can be segmented by result. Double
  opt-in by default; change `status: 'pending'` to `'subscribed'` for single.
- **Agent divisions** (Command, Tracking, Surveillance and so on) are invented
  and should be confirmed or replaced.
- **Analytics.** The GA4 tag from KONBINI 108 is not in this build. Paste the
  `gtag` snippet into `<head>` if you want it.

---

## How the scoring works

Eight questions measure three binary traits:

| Axis | Poles | Questions |
|---|---|---|
| Presence | Seen / Unseen | 3 |
| Approach | Direct / Oblique | 3 |
| Tempo | Hot / Cold | 2 (one double-weighted) |

Two options to a side, three questions an axis — 2×2×2 gives exactly eight
outcomes, one per yōkai. Each axis totals an odd number, so a tie is
impossible and no random tiebreak is needed. The same answers always produce
the same report.

Verified across all 65,536 possible answer paths: every yōkai lands at exactly
12.50%.

| | |
|---|---|
| Seen · Direct · Hot | ONI |
| Seen · Direct · Cold | ASHIARAI YASHIKI |
| Seen · Oblique · Hot | KAPPA |
| Seen · Oblique · Cold | OKUBI |
| Unseen · Direct · Hot | GASHADOKURO |
| Unseen · Direct · Cold | LONG-NECKED |
| Unseen · Oblique · Hot | FACELESS |
| Unseen · Oblique · Cold | LONG-HAIRED |
