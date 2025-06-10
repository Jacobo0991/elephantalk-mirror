import { Inter } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/providers/session.provider";
import ThemeProvider from "@/providers/theme.provider";
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Moderation | ElephanTalk",
  description: "Moderation tools for ElephanTalk",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.svg" />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
