import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "CareConnect – Personalizing Childcare",
  description: "Find verified, background-checked babysitters in your neighborhood. Smart matching, real-time communication, and trusted care for your little ones.",
  keywords: ["babysitter", "childcare", "nanny", "babysitting platform", "smart matching", "CareConnect"],
  openGraph: {
    title: "CareConnect – Personalizing Childcare",
    description: "Find verified, background-checked babysitters near you. Powered by Smart Match™ technology.",
    siteName: "CareConnect",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "CareConnect – Personalizing Childcare",
    description: "Find verified, background-checked babysitters near you. Powered by Smart Match™ technology.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${outfit.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
