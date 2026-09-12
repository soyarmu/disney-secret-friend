import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Amigo Secreto - Disney Bailarín",
  description: "Un sorteo mágico de amigo secreto con personajes Disney bailarines",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
