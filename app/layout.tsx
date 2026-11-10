import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Copywrk — PPF Lead Conversion Demo",
  description: "Interactive WhatsApp lead conversion demo by Copywrk."
};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}