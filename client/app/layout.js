import "./globals.css";

export const metadata = {
  title: "AI Presentation Coach",
  description: "FYP Project - Landing Page",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
