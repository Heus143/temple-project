import { useState } from "react";
import api from "../lib/api";
import { useFetch } from "../lib/hooks";
import SingletonEditor from "./SingletonEditor";
import { AButton, Badge, ConfirmDialog } from "./ui";
import { Loader } from "../components/common";
import { Mail, Trash2, MailOpen } from "lucide-react";
import { toast } from "sonner";

function Messages() {
  const { data, loading, reload } = useFetch("/admin/contact-messages", []);
  const [confirm, setConfirm] = useState(null);
  const items = data || [];

  const toggleRead = async (m) => {
    await api.put(`/admin/contact-messages/${m.id}`, { read: !m.read });
    reload();
  };
  const doDelete = async () => {
    try {
      await api.delete(`/admin/contact-messages/${confirm.id}`);
      toast.success("Deleted");
      setConfirm(null);
      reload();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="mt-12">
      <h2 className="font-heading font-bold text-xl mb-4" style={{ color: "var(--deep-maroon)" }}>Contact Messages</h2>
      {loading ? (
        <Loader />
      ) : !items.length ? (
        <div className="text-center py-12 rounded-xl border-2 border-dashed font-body" style={{ borderColor: "var(--antique-gold)", background: "#fff", color: "var(--text-muted)" }}>
          No messages received yet.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((m) => (
            <div key={m.id} className="rounded-lg p-4" style={{ background: "#fff", border: "1px solid var(--antique-gold)", opacity: m.read ? 0.75 : 1 }} data-testid={`message-${m.id}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-heading font-semibold" style={{ color: "var(--deep-maroon)" }}>{m.name}</span>
                    {m.read ? <Badge tone="gray">Read</Badge> : <Badge tone="green">New</Badge>}
                  </div>
                  <p className="font-ui text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {[m.email, m.phone].filter(Boolean).join(" · ")} · {(m.created_at || "").slice(0, 16).replace("T", " ")}
                  </p>
                  {m.subject ? <p className="font-body mt-2 font-semibold" style={{ color: "var(--text-primary)" }}>{m.subject}</p> : null}
                  <p className="font-body mt-1 whitespace-pre-line" style={{ color: "var(--text-primary)" }}>{m.message}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => toggleRead(m)} className="p-2 rounded hover:bg-black/5" aria-label="Toggle read" data-testid={`message-read-${m.id}`}>
                    {m.read ? <Mail size={16} /> : <MailOpen size={16} />}
                  </button>
                  <button onClick={() => setConfirm(m)} className="p-2 rounded hover:bg-black/5" style={{ color: "#7a1414" }} aria-label="Delete" data-testid={`message-delete-${m.id}`}><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog open={!!confirm} title="Delete message?" message="This cannot be undone." onConfirm={doDelete} onCancel={() => setConfirm(null)} />
    </div>
  );
}

export default function AdminContact() {
  return (
    <div>
      <SingletonEditor
        contentKey="contact_info"
        title="Contact Information"
        fields={[
          { key: "phone", label: "Phone" },
          { key: "email", label: "Email" },
          { key: "address", label: "Address", type: "textarea", rows: 3 },
          { key: "timings", label: "Temple Timings", type: "textarea", rows: 3 },
          { key: "note", label: "Additional Note", type: "textarea", rows: 2 },
        ]}
      />
      <Messages />
    </div>
  );
}
