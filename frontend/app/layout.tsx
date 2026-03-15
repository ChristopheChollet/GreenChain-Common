import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { AppProviders } from "@/components/AppProviders";
import { TopNav } from "@/components/TopNav";

export const metadata: Metadata = {
  title: "GreenChain Common",
  description: "Flagship V1 MVP++"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <TopNav />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
