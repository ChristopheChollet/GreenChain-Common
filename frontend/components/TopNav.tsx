"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/vault", label: "Vault" },
  { href: "/market", label: "Market" },
  { href: "/registry", label: "Registry" },
  { href: "/governance", label: "Governance" }
];

export function TopNav() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="topnav">
      <div className="topnav-inner">
        <Link href="/" className="brand">
          GreenChain Common
        </Link>
        <nav className="nav-links">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        {mounted ? <ConnectButton /> : <div style={{ width: 220, height: 40 }} />}
      </div>
    </header>
  );
}
