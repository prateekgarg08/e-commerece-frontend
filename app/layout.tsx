import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { CartProvider } from "@/contexts/cart-context";
import { MerchantProvider } from "@/contexts/merchant-context";
import { Toaster } from "@/components/ui/toaster";
// import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { WishlistProvider } from "@/contexts/wishlist-context";
import "@livekit/components-styles";
import VoiceAgent from "@/components/ui/VoiceAgent";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "E-Commerce Platform",
  description: "A full-featured e-commerce platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange> */}
        <AuthProvider>
          <MerchantProvider>
            <CartProvider>
              <WishlistProvider>
                <div className="flex min-h-screen flex-col">
                  <Navbar />
                  <main className="flex-1 px-10">{children}</main>
                  <Footer />
                  <VoiceAgent />
                </div>
                <Toaster />
              </WishlistProvider>
            </CartProvider>
          </MerchantProvider>
        </AuthProvider>
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}
