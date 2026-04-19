import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";

import "../index.css";
import Providers from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "torea",
  description: "torea",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent dark mode flash: applies theme class before CSS renders.
            Mirrors next-themes internal logic (attribute="class", storageKey="theme",
            defaultTheme="system", enableSystem=true, enableColorScheme=true). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement,t=localStorage.getItem("theme")||"system",r=t==="system"?(window.matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light"):t;d.classList.remove("light","dark");d.classList.add(r);d.style.colorScheme=r}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <Script id="bfcache-reload" strategy="beforeInteractive">
          {`(function(){var n=performance.getEntriesByType("navigation")[0];if(n&&n.type==="back_forward"){location.reload()}})()`}
        </Script>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
