import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Navbar() {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo (2).png"
            alt="Logo"
            width={150}
            height={150}
          />
        </Link>
        <ul className="flex space-x-4">
          <li>
            <Button variant="ghost" asChild>
              <Link href="/">Home</Link>
            </Button>
          </li>
          <li>
            <Button variant="ghost" asChild>
              <Link href="/about">About</Link>
            </Button>
          </li>
          <li>
            <Button variant="ghost" asChild>
              <Link href="/contact">Contact</Link>
            </Button>
          </li>
        </ul>
      </div>
    </nav>
  );
}