import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Navbar() {
  return (
    <nav className="bg-card border-b border-border p-4 shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
          <Image
            src="/logo (2).png"
            alt="Logo"
            width={150}
            height={150}
            className="h-10 w-auto"
          />
        </Link>
        <ul className="flex space-x-2">
          <li>
            <Button variant="ghost" className="text-foreground hover:bg-accent/20 hover:text-accent-foreground" asChild>
              <Link href="/">Home</Link>
            </Button>
          </li>
          <li>
            <Button variant="ghost" className="text-foreground hover:bg-accent/20 hover:text-accent-foreground" asChild>
              <Link href="/about">About</Link>
            </Button>
          </li>
          <li>
            <Button variant="ghost" className="text-foreground hover:bg-accent/20 hover:text-accent-foreground" asChild>
              <Link href="/contact">Contact</Link>
            </Button>
          </li>
        </ul>
      </div>
    </nav>
  );
}