import type { Metadata } from "next";
import "./globals.css";
import { GoogleAnalytics } from '@next/third-parties/google';

export const metadata: Metadata = {
  title: "TrivialGuessr",
  description: "A challenge of little value or importance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased font-quicksand`}
      >
        {children}
        <GoogleAnalytics gaId="G-968C85GP1X" />
      </body>
    </html>
  );
}
