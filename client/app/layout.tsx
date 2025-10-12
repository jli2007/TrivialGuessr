import type { Metadata } from "next";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";

export const metadataBase = new URL("https://trivialguessr.com");

export const metadata: Metadata = {
  title: "TrivialGuessr",
  description: "TrivialGuessr — A GeoGuessr📍 styled trivia💡 game.",
  keywords: [
    "TrivialGuessr",
    "TrivialGuesser",
    "Trivia Guessr",
    "Trivia Guesser",
    "Trivial Guessr",
    "Trivial Guesser",
    "GeoGuessr trivia",
    "map trivia game",
    "quiz game",
    "online trivia challenge",
  ],
  alternates: {
    canonical: "https://trivialguessr.com",
  },
  openGraph: {
    title: "TrivialGuessr",
    description:
      "Play TrivialGuessr, the GeoGuessr📍 inspired trivia💡 game.",
    url: "https://trivialguessr.com",
    siteName: "TrivialGuessr",
    images: [
      {
        url: "https://trivialguessr.com/banner.png",
        width: 1200,
        height: 630,
        alt: "TrivialGuessr — GeoGuessr Trivia Game",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TrivialGuessr",
    description:
      "Play TrivialGuessr, the GeoGuessr📍 inspired trivia💡 game.",
    images: ["https://trivialguessr.com/banner.png"],
    creator: "@_jamesli",
  },
  icons: {
    icon: "/marker.svg",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="twitter:url" content="https://trivialguessr.com" />
      </head>
      <body className="antialiased font-quicksand">
        {children}
        <GoogleAnalytics gaId="G-968C85GP1X" />
      </body>
    </html>
  );
}
