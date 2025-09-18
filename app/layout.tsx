import type { Metadata } from "next";
import "./globals.css";

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
      </body>
    </html>
  );
}
