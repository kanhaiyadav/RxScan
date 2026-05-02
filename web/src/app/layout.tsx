import type { Metadata } from "next";
import { Righteous, MuseoModerno } from "next/font/google";
import { StoreProvider } from "@/store/provider";
import "./globals.css";

const righteous = Righteous({
  weight: "400",
  variable: "--font-righteous",
  subsets: ["latin"],
});

const museoModerno = MuseoModerno({
    weight: "400",
    variable: "--font-museo-moderno",
    subsets: ["latin"],
    });

export const metadata: Metadata = {
  title: "RxScan",
  description: "Prescription understanding and medication management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${museoModerno.variable} ${righteous.variable} antialiased`}
      >
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
