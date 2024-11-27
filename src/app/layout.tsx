import type { Metadata } from "next";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/nextjs";

import "./globals.css";

import Navbar from "./components/layout/navbar";

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
          {/* Primary Meta Tags */}
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="robots" content="index, follow" />
          <meta
            name="description"
            content="Plan your next adventure with AI Traveller. Get personalized itineraries based on your preferences, budget, and companions."
          />
          <link rel="canonical" href="https://aitraveller.com" />

          {/* Open Graph Meta Tags */}
          <meta property="og:title" content="AI Traveller - Personalized Travel Planner" />
          <meta
            property="og:description"
            content="Plan your next adventure with AI Traveller. Get personalized itineraries based on your preferences, budget, and companions."
          />
          <meta property="og:url" content="https://aitraveller.com" />
          <meta property="og:site_name" content="AI Traveller" />
          <meta property="og:image" content="https://aitraveller.com/og-image.jpg" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:type" content="website" />

          {/* Twitter Meta Tags */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@aitraveller" />
          <meta name="twitter:title" content="AI Traveller - Personalized Travel Planner" />
          <meta
            name="twitter:description"
            content="Plan your next adventure with AI Traveller. Get personalized itineraries based on your preferences, budget, and companions."
          />
          <meta name="twitter:image" content="https://aitraveller.com/twitter-image.jpg" />

          {/* Favicon */}
          <link rel="icon" href="/favicon.ico" />
        </head>
        <body>
          <header>
            <SignedOut></SignedOut>
            <Navbar />
            <SignedIn></SignedIn>
          </header>
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
