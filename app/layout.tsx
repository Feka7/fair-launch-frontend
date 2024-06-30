import { Web3Provider } from "@/components/Web3Provider";
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  title: "hippodrome",
  description: "Fair launch for your crypto project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <header>
      <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎟️</text></svg>" />
      </header>
      <body>
        <ThemeProvider
          defaultTheme="cmyk"
          enableColorScheme
          themes={["cmyk", "night"]}
        >
          <Web3Provider>
            <Navbar />
            <div className="max-w-7xl mx-auto p-2">{children}</div>
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
