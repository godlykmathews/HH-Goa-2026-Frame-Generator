# Public sharing architecture

Local creation, editing, rendering, and downloading do not contact Supabase.
The original upload is never passed to the sharing layer. A public upload starts
only when the user explicitly chooses an action that needs a public URL (X or a
link-based fallback) and the UI passes the finished 850 × 1350 PNG/JPEG Blob to
`uploadGeneratedFrame`.

## Setup

1. Create a Supabase project.
2. Apply `supabase/migrations/001_generated_frames.sql` with the Supabase CLI or
   SQL editor. It creates the `generated_frames` table, public
   `generated-frames` bucket, and narrow anonymous RLS policies.
3. Copy `.env.example` to `.env.local` and provide the project URL and anon key.
4. Set `NEXT_PUBLIC_SITE_URL` to the deployed HTTPS origin in production.

The bucket accepts only root-level, random eight-character `.png`/`.jpg` names,
PNG/JPEG MIME types, and files up to 10 MB. There is no anonymous update or
general delete policy. A constrained rollback function can remove a newly
reserved database record only if its corresponding Storage object does not
exist. The application also verifies that a fetched frame URL belongs to the
configured Supabase origin and exact bucket path before placing it in metadata.

## UI integration

```ts
const published = await uploadGeneratedFrame(generatedBlob, {
  origin: window.location.origin,
});

// published: { shareId, imageUrl, shareUrl }
openShareToX({ builderTitle, shareUrl: published.shareUrl });
```

`ShareUploadError.code` distinguishes `configuration`, `invalid-image`,
`storage`, `database`, and `origin` failures. A failure must not disable the
local Download action.

For private, local file sharing, call `shareNative({ blob, builderTitle,
filename })`. It uses `navigator.canShare({ files })` before opening the share
sheet and does not upload anything. If file sharing is unavailable, it returns
an `unsupported` result; a previously-created public URL may be supplied as
`fallbackUrl` for a link-only share.

The dedicated X path publishes the final image, links to `/frame/[shareId]`, and
opens a Web Intent. X cannot be given a local generated file by a normal Web
Intent. The public route emits the stored card as both `og:image` and the
`summary_large_image` Twitter card image.

## Retention

Frame objects are public and remain available until an operator removes them.
If the campaign promises a fixed retention period, schedule a trusted
service-role cleanup job that deletes expired Storage objects first and their
matching `generated_frames` rows second. Do not expose broad delete permissions
to anonymous browser clients.
