import { Metadata } from "next";


export const metadata: Metadata = {
  title: "Lana Line Admin Panel",
  description: "Lana Line Admin Panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
