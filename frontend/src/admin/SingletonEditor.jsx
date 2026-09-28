import { useState, useEffect } from "react";
import api from "../lib/api";
import { useFetch, formatApiErrorDetail } from "../lib/hooks";
import { AButton, AInput, ATextarea, ALabel } from "./ui";
import { ImageUploader, MultiImageUploader } from "./ImageUploader";
import { Loader } from "../components/common";
import { toast } from "sonner";

export default function SingletonEditor({ contentKey, title, fields, description }) {
  const { data, loading } = useFetch(`/content/${contentKey}`, [contentKey]);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/content/${contentKey}`, form);
      toast.success("Saved successfully");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  if (loading) return <Loader />;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-2xl" style={{ color: "var(--deep-maroon)" }}>{title}</h1>
          {description ? <p className="font-body mt-1" style={{ color: "var(--text-muted)" }}>{description}</p> : null}
        </div>
        <AButton onClick={save} disabled={saving} data-testid="save-singleton-btn">{saving ? "Saving..." : "Save Changes"}</AButton>
      </div>

      <div className="rounded-xl p-6 space-y-5" style={{ background: "#fff", border: "1px solid var(--antique-gold)" }}>
        {fields.map((f) => (
          <div key={f.key}>
            <ALabel htmlFor={`s-${f.key}`}>{f.label}</ALabel>
            {f.type === "textarea" ? (
              <ATextarea id={`s-${f.key}`} rows={f.rows || 4} value={form[f.key] || ""} onChange={(e) => set(f.key, e.target.value)} data-testid={`singleton-${f.key}`} />
            ) : f.type === "image" ? (
              <ImageUploader value={form[f.key]} onChange={(v) => set(f.key, v)} testId={`singleton-${f.key}`} />
            ) : f.type === "images" ? (
              <MultiImageUploader value={form[f.key]} onChange={(v) => set(f.key, v)} testId={`singleton-${f.key}`} />
            ) : (
              <AInput id={`s-${f.key}`} value={form[f.key] || ""} onChange={(e) => set(f.key, e.target.value)} data-testid={`singleton-${f.key}`} />
            )}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <AButton onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</AButton>
      </div>
    </div>
  );
}
