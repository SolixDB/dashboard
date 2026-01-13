import { Inter, JetBrains_Mono } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import { Providers } from "@/components/Providers";
import { siteConfig } from "@/config/siteConfig";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata = siteConfig;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en" className="dark">
        <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
          <Providers>{children}</Providers>
        </body>
      </html>
    </ViewTransitions>
  );
}
