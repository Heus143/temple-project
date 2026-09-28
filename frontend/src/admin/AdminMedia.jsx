import { useRef, useState } from "react";
import api from "../lib/api";
import { useFetch, formatApiErrorDetail } from "../lib/hooks";
import { AButton, AInput } from "./ui";
import { Loader } from "../components/common";
import { Upload, Search, Copy } from "lucide-react";
import { toast } from "sonner";

async function fileToDataUrl(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

export default function AdminMedia() {
  const { data, loading, reload } = useFetch("/admin/collection/media_library", []);
  const inputRef = useRef();
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");

  const items = (data || []).filter((m) => (m.filename || "").toLowerCase().includes(q.toLowerCase()));

  const handle = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setBusy(true);
    try {
      for (const f of files) {
        const dataUrl = await fileToDataUrl(f);
        await api.post("/admin/media", { data_url: dataUrl, filename: f.name, size: f.size });
      }
      toast.success(`${files.length} file(s) uploaded`);
      reload();
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const copy = (url) => {
    navigator.clipboard?.writeText(url);
    toast.success("Image reference copied");
  };

  return (
    <div data-testid="admin-media">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-heading font-bold text-2xl" style={{ color: "var(--deep-maroon)" }}>Media Library</h1>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handle} data-testid="media-input" />
        <AButton onClick={() => inputRef.current?.click()} disabled={busy} data-testid="media-upload-btn">
          <span className="inline-flex items-center gap-2"><Upload size={16} /> {busy ? "Uploading..." : "Upload Images"}</span>
        </AButton>
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
        <AInput placeholder="Search by file name" value={q} onChange={(e) => setQ(e.target.value)} style={{ paddingLeft: 34 }} data-testid="media-search" />
      </div>

      {loading ? (
        <Loader />
      ) : !items.length ? (
        <div className="text-center py-16 rounded-xl border-2 border-dashed font-body" style={{ borderColor: "var(--antique-gold)", background: "#fff", color: "var(--text-muted)" }}>
          No media uploaded yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((m) => (
            <div key={m.id} className="rounded-lg overflow-hidden" style={{ background: "#fff", border: "1px solid var(--antique-gold)" }} data-testid={`media-${m.id}`}>
              <img src={m.data_url} alt={m.filename} className="w-full h-32 object-cover" />
              <div className="p-2">
                <p className="font-ui text-xs truncate" style={{ color: "var(--text-primary)" }}>{m.filename}</p>
                <p className="font-ui text-[11px]" style={{ color: "var(--text-muted)" }}>{(m.created_at || "").slice(0, 10)}</p>
                <button onClick={() => copy(m.data_url)} className="mt-2 inline-flex items-center gap-1 text-xs px-2 py-1 rounded" style={{ border: "1px solid var(--antique-gold)", color: "var(--royal-maroon)" }} data-testid={`media-copy-${m.id}`}>
                  <Copy size={12} /> Copy
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
