import { ReactNode } from "react";
import { Navbar } from "./navigation";
import { Footer } from "./Footer";

interface LayoutProps {
  children: ReactNode;
  isAuthenticated?: boolean;
  showFooter?: boolean;
}

export function Layout({ children, isAuthenticated = false, showFooter = true }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar isAuthenticated={isAuthenticated} />
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
