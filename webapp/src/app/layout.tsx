import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "EduInsight - Global Education Analytics Platform",
  description: "Transform complex global education data into actionable insights through machine learning predictions and interactive visualizations.",
  keywords: "education, analytics, machine learning, policy, global education, data visualization",
  authors: [{ name: "EduInsight Team" }],
  openGraph: {
    title: "EduInsight - Global Education Analytics Platform",
    description: "Evidence-based educational policy decisions through reliable ML predictions",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800/50 dark:to-indigo-950/20 text-slate-900 dark:text-slate-100`}
      >
        <div className="min-h-screen">
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
