import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./context/ThemeContext";
import { CssBaseline } from "@mui/material";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "./components/layout/navbar";
import Footer from "./components/layout/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Traveller - Yapay Zeka Destekli Seyahat Planlayıcı",
  description: "Yapay zeka destekli kişiselleştirilmiş seyahat planları oluşturun.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <ClerkProvider>
          <ThemeProvider>
            <CssBaseline />
            <div style={{ 
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              paddingBottom: '60px' // Footer yüksekliği kadar padding
            }}>
              <Navbar />
              <main style={{ flex: 1 }}>
                {children}
              </main>
              <Footer />
            </div>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
} 