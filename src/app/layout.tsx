import "./globals.css";

import { dmSerifDisplay, inter } from "@/lib/fonts";
import { HardReloadListener } from "@/components/dev/HardReloadListener";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSerifDisplay.variable} ${inter.variable}`}>
      <body className="font-sans bg-warm text-ink">
        {process.env.NODE_ENV === "development" && <HardReloadListener />}
        {children}
      </body>
    </html>
  );
}
