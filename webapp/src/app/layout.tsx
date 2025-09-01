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
        className={`${inter.variable} font-sans antialiased bg-gray-50`}
      >
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
