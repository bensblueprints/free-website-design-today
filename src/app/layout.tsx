import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Free Website Design Today | Professional Web Design Services",
  description: "Get a stunning, custom website designed for FREE. Professional web design and redesign services. Book your consultation today!",
  keywords: "free website design, web design, website redesign, professional web design, custom website",
  openGraph: {
    title: "Free Website Design Today",
    description: "Get a stunning, custom website designed for FREE",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="stylesheet" href="https://assets.calendly.com/assets/external/widget.css" />
        <script src="https://assets.calendly.com/assets/external/widget.js" async></script>
      </head>
      <body className="min-h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {children}
      </body>
    </html>
  );
}
