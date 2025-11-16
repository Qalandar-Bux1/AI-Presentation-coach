import "./globals.css";

export const metadata = {
  title: "AI Presentation Coach",
  description: "FYP Project - Landing Page",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
