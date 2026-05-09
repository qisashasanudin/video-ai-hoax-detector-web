import "./globals.css";

export const metadata = {
  title: "Video Misinfo Platform",
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
