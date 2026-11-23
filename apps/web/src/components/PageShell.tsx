import type { ReactNode } from "react";
import NavBar from "./NavBar";
import Footer from "./Footer";

const PageShell = ({ children }: { children: ReactNode }) => (
  <main className="min-h-screen bg-background text-foreground">
    <NavBar />
    <div className="pt-24 pb-32">{children}</div>
    <Footer />
  </main>
);

export default PageShell;
