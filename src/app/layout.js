import "../App.css";

export const metadata = {
  title: "Mystic AI - Tarot Readings",
  description: "AI-powered Tarot reading application",
  themeColor: "#6a0dad",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
