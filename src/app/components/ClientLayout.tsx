"use client";

import { Inter } from "next/font/google";
import Script from "next/script";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Box } from "@mui/material";

import { useThemeContext } from "../context/ThemeContext";
import Footer from "./layout/footer";
import Navbar from "./layout/navbar";

const inter = Inter({ subsets: ["latin"] });

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isDarkMode } = useThemeContext();

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={inter.className}
        style={{
          backgroundColor: isDarkMode ? "#121212" : "#f3f4f6",
          color: isDarkMode ? "#fff" : "#000",
          minHeight: "100vh",
        }}
      >
        <Box
          sx={{
            minHeight: "100vh",
            backgroundColor: isDarkMode ? "#121212" : "#f3f4f6",
            color: isDarkMode ? "#fff" : "#000",
            transition: "all 0.3s ease",
          }}
        >
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
        </Box>
      </body>
    </html>
  );
}
