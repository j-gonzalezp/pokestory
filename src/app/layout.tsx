import type { Metadata } from "next";

import {
  Inter,
  JetBrains_Mono,
  Playfair_Display,
  Poppins,
} from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingPokedexButton from "../components/pokedex/FloatingPokedexButton";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "PokeStory",
  description: "Ai generated pokemon stories",
  icons: {
    icon: "/favicon.ico",
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

        className={`${inter.variable} ${poppins.variable} ${playfairDisplay.variable} ${jetbrainsMono.variable} antialiased flex flex-col min-h-screen relative`}
      >
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />

        <FloatingPokedexButton />
      </body>
    </html>
  );
}