import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hackathon Starter",
  description: "Simple Next.js + Clerk + Supabase boilerplate for hackathons.",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
