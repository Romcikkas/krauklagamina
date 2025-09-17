import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import RotatingBg from "./components/RotatingBg";
import { AuthProvider } from "../contexts/AuthContext";

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
    <html lang="en">
      <body className="flex flex-col min-h-screen relative">
        <AuthProvider>
          <RotatingBg />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
