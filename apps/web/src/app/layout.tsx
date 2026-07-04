import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ServiceWorkerRegister } from "@/components/pwa/sw-register";
import { AppShell } from "@/components/nav/app-shell";
import { getAppMode } from "@/server/mode";
import { safeGetCurrentUser } from "@/lib/current-user";
import "./globals.css";

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const displayFont = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const numericFont = IBM_Plex_Mono({
  variable: "--font-numeric",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RPeak — cuaderno de entrenamiento",
  description: "Registra tus planes y entrenamientos como un cuaderno de entrenamiento en vivo.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RPeak",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f5f0" },
    { media: "(prefers-color-scheme: dark)", color: "#14171a" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const mode = getAppMode();
  const user = await safeGetCurrentUser();

  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${bodyFont.variable} ${displayFont.variable} ${numericFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <AppShell user={user} mode={mode}>
            {children}
          </AppShell>
        </ThemeProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
