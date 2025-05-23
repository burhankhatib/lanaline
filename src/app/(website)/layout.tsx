import type { Metadata } from "next";
import "../globals.css";
import TopMenu from "@/components/TopMenu";
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { SanityLive } from "@/sanity/lib/live"
import { LanguageProvider } from "@/context/language";
import { CartProvider } from "@/context/cart";
import { Toaster } from "@/components/ui/toaster";
import { ClerkProvider } from '@clerk/nextjs'

export const metadata: Metadata = {
  title: "Lana Line",
  description: "Luxury in Every Drop. Care in Every Touch",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LanguageProvider>
      <ClerkProvider>

        <CartProvider>
          <header className="sticky top-0 z-50 shadow-md bg-gradient-to-r from-primary/100 via-primary/50 to-primary/70 backdrop-blur-2xl">
            <TopMenu />
            <Header />
          </header>
          <main className="flex flex-col flex-1 w-full h-full min-h-screen">
            {children}
          </main>
          <footer className="mt-10 bg-primary">
            <Footer />
          </footer>
          <SanityLive />
          <Toaster />
        </CartProvider>
      </ClerkProvider>
    </LanguageProvider>
  );
}
