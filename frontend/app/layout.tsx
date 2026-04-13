import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NHA Claims Auto-Adjudication",
  description: "Enterprise claims processing dashboard",
  icons: {
    icon: "🏥",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white m-0 p-0">
        {children}
      </body>
    </html>
  );
}
