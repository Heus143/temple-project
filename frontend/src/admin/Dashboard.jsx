import { Link } from "react-router-dom";
import { useFetch } from "../lib/hooks";
import { useAuth } from "../context/AuthContext";
import { Loader } from "../components/common";
import { CalendarDays, History, Images, Users, GitBranch, Megaphone, FolderOpen, Mail } from "lucide-react";

const CARDS = [
  { key: "events", label: "Events", icon: CalendarDays, to: "/admin/events" },
  { key: "previous_years", label: "Previous Years", icon: History, to: "/admin/previous-years" },
  { key: "gallery", label: "Gallery Images", icon: Images, to: "/admin/gallery" },
  { key: "committee_members", label: "Committee", icon: Users, to: "/admin/committee" },
  { key: "vamshavali", label: "Vamshavali", icon: GitBranch, to: "/admin/vamshavali" },
  { key: "announcements", label: "Announcements", icon: Megaphone, to: "/admin/announcements" },
  { key: "media_library", label: "Media Files", icon: FolderOpen, to: "/admin/media" },
  { key: "unread_messages", label: "Unread Messages", icon: Mail, to: "/admin/contact" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { data, loading } = useFetch("/admin/stats", []);

  return (
    <div data-testid="admin-dashboard">
      <h1 className="font-heading font-bold text-2xl mb-1" style={{ color: "var(--deep-maroon)" }}>Dashboard</h1>
      <p className="font-body mb-6" style={{ color: "var(--text-muted)" }}>
        Welcome back{user && user.name ? `, ${user.name}` : ""}. Manage all temple content from here.
      </p>
      {loading ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CARDS.map((c) => (
            <Link key={c.key} to={c.to} className="rounded-xl p-5 transition-transform hover:-translate-y-1" style={{ background: "#fff", border: "1px solid var(--antique-gold)" }} data-testid={`stat-${c.key}`}>
              <c.icon style={{ color: "var(--antique-gold-dark)" }} />
              <p className="font-heading font-bold text-3xl mt-3" style={{ color: "var(--deep-maroon)" }}>{(data && data[c.key]) ?? 0}</p>
              <p className="font-ui text-sm" style={{ color: "var(--text-muted)" }}>{c.label}</p>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 rounded-xl p-6" style={{ background: "var(--cream)", border: "1px solid var(--antique-gold)" }}>
        <h2 className="font-heading font-semibold text-lg mb-2" style={{ color: "var(--deep-maroon)" }}>Quick guide</h2>
        <ul className="font-body space-y-1" style={{ color: "var(--text-muted)" }}>
          <li>• Add a new temple event any time from <Link className="underline" to="/admin/events">Events</Link> — publish it to show it on the public site.</li>
          <li>• Add a new year (2026, 2027, …) under <Link className="underline" to="/admin/previous-years">Previous Years</Link>.</li>
          <li>• Fill in committee member names and positions under <Link className="underline" to="/admin/committee">Committee</Link>.</li>
          <li>• Nothing is shown publicly until you mark it <strong>Published</strong>.</li>
        </ul>
      </div>
    </div>
  );
}
