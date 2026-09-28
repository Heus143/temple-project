import { NavLink, useNavigate, Navigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Loader } from "../components/common";
import {
  LayoutDashboard, Info, Home as HomeIcon, BookOpen, Images, CalendarDays,
  History, Users, GitBranch, Megaphone, MapPin, Mail, FolderOpen, Settings, LogOut, Menu, X,
} from "lucide-react";

const LINKS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/temple", label: "Temple Information", icon: Info },
  { to: "/admin/home", label: "Home Content", icon: HomeIcon },
  { to: "/admin/about", label: "About", icon: BookOpen },
  { to: "/admin/gallery", label: "Gallery", icon: Images },
  { to: "/admin/events", label: "Events", icon: CalendarDays },
  { to: "/admin/previous-years", label: "Previous Years", icon: History },
  { to: "/admin/committee", label: "Committee", icon: Users },
  { to: "/admin/vamshavali", label: "Vamshavali", icon: GitBranch },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { to: "/admin/location", label: "Location", icon: MapPin },
  { to: "/admin/contact", label: "Contact", icon: Mail },
  { to: "/admin/media", label: "Media Library", icon: FolderOpen },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (user === null) return <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--beige)" }}><Loader /></div>;
  if (user === false) return <Navigate to="/admin/login" replace />;

  const doLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5" style={{ borderBottom: "1px solid rgba(197,160,89,0.25)" }}>
        <p className="font-telugu text-sm" style={{ color: "var(--light-gold)" }}>శ్రీ అన్నపూర్ణమ్మ</p>
        <p className="font-heading font-bold tracking-wide" style={{ color: "var(--ivory)" }}>ADMIN PANEL</p>
      </div>
      <nav className="flex-1 overflow-y-auto py-3">
        {LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            onClick={() => setMobileOpen(false)}
            data-testid={`admin-nav-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
            className="flex items-center gap-3 px-5 py-2.5 font-ui text-sm transition-colors"
            style={({ isActive }) => ({
              color: isActive ? "var(--warm-brown)" : "var(--beige)",
              background: isActive ? "var(--light-gold)" : "transparent",
              fontWeight: isActive ? 600 : 400,
            })}
          >
            <l.icon size={17} /> {l.label}
          </NavLink>
        ))}
      </nav>
      <button onClick={doLogout} className="flex items-center gap-3 px-5 py-4 font-ui text-sm" style={{ borderTop: "1px solid rgba(197,160,89,0.25)", color: "var(--light-gold)" }} data-testid="admin-logout">
        <LogOut size={17} /> Logout
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: "var(--beige)" }}>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col fixed inset-y-0" style={{ background: "var(--warm-brown)" }}>
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <aside className="w-64 flex flex-col" style={{ background: "var(--warm-brown)" }}>
            <SidebarContent />
          </aside>
          <div className="flex-1" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setMobileOpen(false)} />
        </div>
      )}

      <div className="flex-1 md:ml-64 min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-40" style={{ background: "var(--warm-brown)" }}>
          <button onClick={() => setMobileOpen(true)} style={{ color: "var(--ivory)" }} aria-label="Open menu" data-testid="admin-mobile-menu"><Menu /></button>
          <span className="font-heading font-bold" style={{ color: "var(--ivory)" }}>ADMIN</span>
          <a href="/" target="_blank" rel="noreferrer" className="font-ui text-xs underline" style={{ color: "var(--light-gold)" }}>View site</a>
        </header>
        <main className="p-5 md:p-8 max-w-6xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
