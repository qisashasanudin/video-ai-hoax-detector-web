import "./globals.css";

export const metadata = {
  title: "AI Hoax Video Platform",
  description: "Decision-support indicators for short-form videos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
