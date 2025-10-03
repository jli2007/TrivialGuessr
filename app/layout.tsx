import type { Metadata } from "next";
import "./globals.css";
import { GoogleAnalytics } from '@next/third-parties/google';

export const metadata: Metadata = {
  title: "TrivialGuessr",
  description: "TrivialGuessr — A GeoGuessr📍 styled trivia💡 game.",
  keywords: [
    "TrivialGuessr",
    "TrivialGuessr Game",
    "GeoGuessr trivia",
    "trivia game",
    "map trivia game",
    "online trivia challenge",
    "quiz game",
  ],

  openGraph: {
    title: "TrivialGuessr",
    description: "Play TrivialGuessr, the GeoGuessr📍 inspired trivia💡 game.",
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
    description: "Play TrivialGuessr, a GeoGuessr-style trivia game. Compete and learn while having fun!",
    images: ["https://trivialguessr.com/banner.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="icon" href="/marker.svg" />
      <body
        className={`antialiased font-quicksand`}
      >
        {children}
        <GoogleAnalytics gaId="G-968C85GP1X" />
      </body>
    </html>
  );
}
