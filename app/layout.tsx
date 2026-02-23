import type { Metadata } from "next";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";

export const metadata: Metadata = {
  title: "Naliya Mandwi Junagadh Muslim Welfare Jamat - Karachi Chapter",
  description: "Community Database Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionWrapper>
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}