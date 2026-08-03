import "./globals.css";

import { dmSerifDisplay, inter } from "@/lib/fonts";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSerifDisplay.variable} ${inter.variable}`}>
      <body className="font-sans bg-warm text-ink">{children}</body>
    </html>
  );
}
