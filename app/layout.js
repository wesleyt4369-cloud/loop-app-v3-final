export const metadata = {
  title: "Loop",
  description: "Appointment reminders and win-backs that send themselves",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#2F6F62",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
