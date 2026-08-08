import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";

export interface GeneratedFrameRecord {
  id: string;
  image_url: string;
  created_at: string;
}

export type GeneratedFrameLookup =
  | { status: "found"; frame: GeneratedFrameRecord }
  | { status: "not-found" }
  | { status: "unavailable" };

let serverClient: SupabaseClient | null | undefined;

function hasTrustedImageUrl(imageUrl: string, shareId: string): boolean {
  const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!configuredUrl) {
    return false;
  }

  try {
    const projectUrl = new URL(configuredUrl);
    const image = new URL(imageUrl);
    const expectedPath = new RegExp(
      `^/storage/v1/object/public/generated-frames/${shareId}\\.(?:png|jpg)$`,
    );

    return (
      image.origin === projectUrl.origin &&
      expectedPath.test(image.pathname) &&
      image.search === "" &&
      image.hash === ""
    );
  } catch {
    return false;
  }
}

export function getSupabaseServerClient(): SupabaseClient | null {
  if (serverClient !== undefined) {
    return serverClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    serverClient = null;
    return serverClient;
  }

  serverClient = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: {
      headers: { "X-Client-Info": "hh-goa-2026-frame-generator-server" },
    },
  });

  return serverClient;
}

/**
 * Shared by the route and generateMetadata. React cache deduplicates both
 * lookups within a single server render without making frame pages stale.
 */
export const lookupGeneratedFrame = cache(
  async (shareId: string): Promise<GeneratedFrameLookup> => {
    if (!/^[a-z0-9]{8}$/.test(shareId)) {
      return { status: "not-found" };
    }

    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return { status: "unavailable" };
    }

    const { data, error } = await supabase
      .from("generated_frames")
      .select("id,image_url,created_at")
      .eq("id", shareId)
      .maybeSingle<GeneratedFrameRecord>();

    if (error) {
      console.error("Unable to load generated frame:", error.message);
      return { status: "unavailable" };
    }

    if (!data) {
      return { status: "not-found" };
    }

    if (!hasTrustedImageUrl(data.image_url, shareId)) {
      console.error("Rejected an untrusted generated frame image URL.");
      return { status: "unavailable" };
    }

    return { status: "found", frame: data };
  },
);
