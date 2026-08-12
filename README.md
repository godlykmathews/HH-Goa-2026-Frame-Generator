# HH Goa 2026 Frame Generator

A mobile-first, no-account campaign tool for creating 850 × 1350 Hacker House Goa builder credentials in one pass. The uploaded source photo stays in the browser. The app only publishes the finished card when the user explicitly chooses a public-link sharing action.

## What is included

- JPG, PNG, WEBP, HEIC, and HEIF input with lazy, client-side HEIC conversion
- cover crop with drag, keyboard nudging, mouse-wheel zoom, touch pinch zoom, and no empty edges
- deterministic, local builder-title suggestions based on role keywords
- a true 850 × 1350 slim portrait PNG export rendered with the Canvas API
- local Blob download and Web Share API file sharing
- public LinkedIn/X share links backed by Supabase Storage and `generated_frames`
- dynamic `/frame/[shareId]` Open Graph and X card metadata using the generated card itself
- an extensible renderer format registry ready for a future 1080 × 1080 PFP frame

## Local setup

Requirements: Node.js 20.9 or newer and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

Local generation and download work without Supabase credentials. Public LinkedIn/X link sharing reports a clear configuration error until Supabase is configured.

## Environment variables

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

For production, set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS origin so generated share URLs and metadata are absolute.

## Supabase setup

1. Create a Supabase project.
2. Run [`supabase/migrations/001_generated_frames.sql`](supabase/migrations/001_generated_frames.sql) in the Supabase SQL editor (or apply it with the Supabase CLI).
3. Copy the project URL and publishable/anon key into `.env.local`.
4. Restart the Next.js process after changing environment variables.

The migration creates:

- a public `generated-frames` Storage bucket limited to generated image formats and a bounded file size;
- the `generated_frames` table with random eight-character public IDs;
- narrowly scoped RLS policies needed by the unauthenticated, no-login sharing flow.

Never expose a Supabase service-role key through a `NEXT_PUBLIC_` variable.

## Sharing architecture

Generation, download, and native file sharing are entirely local:

```text
source photo → browser decode/crop → Canvas PNG Blob → download or native share
```

Public-network sharing is opt-in:

```text
finished PNG Blob only → Supabase Storage → generated_frames record
                                         → /frame/{randomId}
                                         → dynamic og:image/twitter:image
                                         → X or LinkedIn compose window
```

The original photo is never separately uploaded. The public route looks up only the random share ID and stored final-image URL. X Web Intent cannot attach a browser-local image, so the intent includes the public frame page; its `summary_large_image` metadata points to the user's generated card.

## Brand assets

Swap placeholder/supplied campaign art in [`public/brand`](public/brand/README.md). Keep the existing filenames for a drop-in replacement, or update the centralized paths in the canvas renderer and the corresponding interface image paths.

The visual system uses the supplied deep Goa green, sun yellow, hot pink, Hacker House title art, Hindi Goa lettering, and sunrise illustration. Decorative SVGs in `public/brand/patterns` are intentionally lightweight and replaceable.

## Validation and production checks

```bash
npm run lint
npm run build
npm start
```

### Manual test matrix

| Area | Checks |
| --- | --- |
| JPG / PNG / WEBP | Upload each type; confirm an immediate preview, crop controls, generation, and PNG download. |
| HEIC / HEIF | Test a recent iPhone portrait and landscape; confirm the compact conversion state and correct orientation. Test on a real iPhone because desktop browser emulation does not reproduce all HEIC codecs. |
| Portrait / landscape | Drag to every crop boundary, zoom with the slider/wheel/pinch, and confirm no blank canvas area appears. |
| Corrupt/oversized file | Confirm a descriptive inline error and that the previous valid photo remains usable. |
| Mobile | Test iPhone Safari and Android Chrome at narrow widths; verify one-handed touch targets, pinch crop, no horizontal overflow, and keyboard-safe fields. |
| Download | Inspect the downloaded file dimensions (850 × 1350), PNG type, sanitized filename, sharp text, and matching crop. |
| Native sharing | On a supporting mobile browser, confirm the share sheet receives the image file and the caption contains exactly `#FrameInGoa`; cancel once to verify graceful recovery. |
| LinkedIn / X | Confirm the public-upload notice appears first, only the final PNG reaches Storage, and a blocked popup produces a usable fallback. |
| Public frame route | Open the generated `/frame/{shareId}` URL in a signed-out window and use **Create your own** to return to the generator. |
| OG preview | Inspect the public URL with an Open Graph/X card debugger after deployment; verify `og:image` and `twitter:image` equal that share record’s generated image and `twitter:card` is `summary_large_image`. |
| Supabase outage | Disconnect the network or use invalid credentials; public sharing should fail without affecting local download/native file sharing. |

HEIC conversion support ultimately depends on the source codec being readable by `heic2any`; unsupported or corrupt variants return a user-facing error instead of uploading the source photo.

## Privacy

No login, email, phone number, or authentication profile is collected. Local object URLs are revoked when replaced or reset. Supabase stores only the final generated graphic, its short random share ID, and its creation timestamp for public sharing.
