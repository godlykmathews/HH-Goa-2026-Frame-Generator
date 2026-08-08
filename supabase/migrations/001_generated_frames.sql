-- HH Goa 2026 public frame shares
-- Run with `supabase db push` or paste into the Supabase SQL editor.

create table if not exists public.generated_frames (
  id text primary key
    constraint generated_frames_id_format
      check (id ~ '^[a-z0-9]{8}$'),
  image_url text not null
    constraint generated_frames_image_url_format
      check (
        image_url ~ '^https?://[^[:space:]]+/storage/v1/object/public/generated-frames/[a-z0-9]{8}\.(png|jpg)$'
      ),
  created_at timestamptz not null default now()
);

create index if not exists generated_frames_created_at_idx
  on public.generated_frames (created_at);

alter table public.generated_frames enable row level security;

revoke all on table public.generated_frames from anon, authenticated;
grant select, insert on table public.generated_frames to anon, authenticated;

drop policy if exists "Public can read generated frames"
  on public.generated_frames;
create policy "Public can read generated frames"
  on public.generated_frames
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can create generated frames"
  on public.generated_frames;
create policy "Public can create generated frames"
  on public.generated_frames
  for insert
  to anon, authenticated
  with check (
    id ~ '^[a-z0-9]{8}$'
    and image_url ~ (
      '/storage/v1/object/public/generated-frames/' || id || '\.(png|jpg)$'
    )
  );

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'generated-frames',
  'generated-frames',
  true,
  10485760,
  array['image/png', 'image/jpeg']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can inspect generated frame objects"
  on storage.objects;
create policy "Public can inspect generated frame objects"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'generated-frames');

drop policy if exists "Public can upload generated frame objects"
  on storage.objects;
create policy "Public can upload generated frame objects"
  on storage.objects
  for insert
  to anon, authenticated
  with check (
    bucket_id = 'generated-frames'
    and name ~ '^[a-z0-9]{8}\.(png|jpg)$'
  );

-- Roll back a reserved database record only when a recent upload did not
-- create its corresponding object. Anonymous clients never receive general
-- delete permission for valid frame records or Storage objects.
create or replace function public.discard_incomplete_frame(frame_id text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  removed_rows integer;
begin
  if frame_id !~ '^[a-z0-9]{8}$' then
    return false;
  end if;

  delete from public.generated_frames as frame
  where frame.id = frame_id
    and frame.created_at > pg_catalog.now() - interval '10 minutes'
    and not exists (
      select 1
      from storage.objects as object
      where object.bucket_id = 'generated-frames'
        and object.name in (frame_id || '.png', frame_id || '.jpg')
    );

  get diagnostics removed_rows = row_count;
  return removed_rows > 0;
end;
$$;

revoke all on function public.discard_incomplete_frame(text) from public;
grant execute on function public.discard_incomplete_frame(text)
  to anon, authenticated;

comment on table public.generated_frames is
  'Public links for user-initiated uploads of finished HH Goa card images only.';
comment on function public.discard_incomplete_frame(text) is
  'Removes a recent share record only if its final generated image was not uploaded.';
