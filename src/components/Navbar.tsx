"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation"; 

export default function Navbar() {
  const pathname = usePathname();

  return (
    <motion.nav
      className="bg-card border-b border-border p-4 shadow-sm"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.4,
        delay: 0.2,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
    >
      <div className="container mx-auto flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Link href="/" className="flex-shrink-0 flex items-center hover:opacity-90 transition-opacity">
            <Image
              src="/logo (2).png"
              alt="Logo"
              width={150}
              height={150}
              className="h-10 w-auto"
            />
          </Link>
        </motion.div>
        <motion.ul
          className="flex space-x-1 sm:space-x-2 items-center"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
        
          <li className="hidden sm:block">
            <Button
              variant="ghost"
              className={`text-foreground hover:bg-accent/20 hover:text-accent-foreground ${
                pathname === "/" ? "bg-accent/50 text-accent-foreground" : ""
              }`}
              asChild
            >
              <Link href="/">Home</Link>
            </Button>
          </li>
           <li>
            <Button
              variant="ghost"
              className={`text-foreground hover:bg-accent/20 hover:text-accent-foreground ${
                pathname === "/pokedex" ? "bg-accent/50 text-accent-foreground" : "" 
              }`}
              asChild
            >
              <Link href="/pokedex">Pokédex</Link>
            </Button>
          </li>
          <li>
            <Button
              variant="ghost"
              className={`text-foreground hover:bg-accent/20 hover:text-accent-foreground ${
                pathname === "/about" ? "bg-accent/50 text-accent-foreground" : ""
              }`}
              asChild
            >
              <Link href="/about">About</Link>
            </Button>
          </li>
          <li>
            <Button
              variant="ghost"
              className={`text-foreground hover:bg-accent/20 hover:text-accent-foreground ${
                pathname === "/contact" ? "bg-accent/50 text-accent-foreground" : ""
              }`}
              asChild
            >
              <Link href="/contact">Contact</Link>
            </Button>
          </li>
        </motion.ul>
      </div>
    </motion.nav>
  );
}