import type { Metadata } from "next";
import { Inter as interFont } from "next/font/google";
import Script from "next/script";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/nextjs";

import "./globals.css";

import Footer from "./components/layout/footer";
import Navbar from "./components/layout/navbar";

const inter = interFont({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Traveller - Personalized Travel Planner",
  description:
    "Plan your next adventure with AI Traveller. Get personalized itineraries based on your preferences, budget, and companions.",
  openGraph: {
    title: "AI Traveller - Personalized Travel Planner",
    description:
      "Plan your next adventure with AI Traveller. Get personalized itineraries based on your preferences, budget, and companions.",
    url: "https://aitraveller.com",
    siteName: "AI Traveller",
    images: [
      {
        url: "https://aitraveller.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AI Traveller - Plan Your Next Adventure",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@aitraveller",
    title: "AI Traveller - Personalized Travel Planner",
    description:
      "Plan your next adventure with AI Traveller. Get personalized itineraries based on your preferences, budget, and companions.",
    images: ["https://aitraveller.com/twitter-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: "width=device-width, initial-scale=1.0",
};

export default async function RootLayout({ children }: { children: React.ReactNode }): Promise<JSX.Element> {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="icon" href="/favicon.ico" />
        </head>
        <body className={inter.className}>
          <header>
            <SignedOut>
              <Navbar />
            </SignedOut>
            <SignedIn>
              <Navbar />
              <Footer />
            </SignedIn>
          </header>
          <main>{children}</main>
          <Script
            src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places`}
            strategy="afterInteractive"
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
