import type { Metadata, Viewport } from "next";
import "./globals.css";

function getMetadataBase(): URL {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");
  } catch {
    return new URL("http://localhost:3000");
  }
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: "HH Goa 2026 Frame Generator",
    template: "%s · HH Goa 2026",
  },
  description:
    "Create your Hacker House Goa 2026 builder identity card, then download it or share it with #FrameInGoa.",
  applicationName: "HH Goa 2026 Frame Generator",
  keywords: ["Hacker House", "Goa", "HH Goa 2026", "builder", "frame generator"],
  openGraph: {
    title: "HH Goa 2026 Frame Generator",
    description: "Build your Goa identity. Make a slim HH Goa 2026 builder credential.",
    type: "website",
    siteName: "HH Goa 2026",
  },
  twitter: {
    card: "summary_large_image",
    title: "HH Goa 2026 Frame Generator",
    description: "Build your Goa identity with #FrameInGoa.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#005f36",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
