import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import RotatingBg from "./components/RotatingBg";
import { AuthProvider } from "../contexts/AuthContext";
import { LanguageProvider } from "../contexts/LanguageContext";

export const metadata = {
  title: "Krauk lagaminą",
  description: "",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="lt">
      <body className="flex flex-col min-h-screen relative">
        <LanguageProvider>
          <AuthProvider>
            <RotatingBg />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
