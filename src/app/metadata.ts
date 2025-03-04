import type { Metadata } from "next";

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