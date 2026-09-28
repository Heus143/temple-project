import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import MantraTicker from "./MantraTicker";
import Header from "./Header";
import BoxNav from "./BoxNav";
import SacredHero from "./SacredHero";
import Footer from "./Footer";

export default function PublicLayout({ children }) {
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="App min-h-screen flex flex-col" style={{ background: "var(--beige)" }}>
      <Header />
      <MantraTicker />
      {isHome && <SacredHero />}
      <BoxNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
