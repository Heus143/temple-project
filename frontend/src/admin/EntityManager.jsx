import { useState } from "react";
import api from "../lib/api";
import { useFetch, formatApiErrorDetail } from "../lib/hooks";
import { AButton, AInput, ATextarea, ASelect, ALabel, AToggle, Badge, Modal, ConfirmDialog } from "./ui";
import { ImageUploader, MultiImageUploader } from "./ImageUploader";
import { Loader } from "../components/common";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

function FieldInput({ field, value, onChange, categories }) {
  const common = { id: `f-${field.key}`, "data-testid": `field-${field.key}` };
  if (field.type === "textarea")
    return <ATextarea rows={field.rows || 4} value={value || ""} onChange={(e) => onChange(e.target.value)} {...common} />;
  if (field.type === "number")
    return <AInput type="number" value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))} {...common} />;
  if (field.type === "date")
    return <AInput type="date" value={value || ""} onChange={(e) => onChange(e.target.value)} {...common} />;
  if (field.type === "time")
    return <AInput type="time" value={value || ""} onChange={(e) => onChange(e.target.value)} {...common} />;
  if (field.type === "select") {
    const opts = field.optionsSource === "categories" ? (categories || []).map((c) => c.name) : field.options || [];
    return (
      <ASelect value={value || ""} onChange={(e) => onChange(e.target.value)} {...common}>
        <option value="">— Select —</option>
        {opts.map((o) => <option key={o} value={o}>{o}</option>)}
      </ASelect>
    );
  }
  if (field.type === "image")
    return <ImageUploader value={value} onChange={onChange} testId={`field-${field.key}`} />;
  if (field.type === "images")
    return <MultiImageUploader value={value} onChange={onChange} testId={`field-${field.key}`} />;
  return <AInput value={value || ""} onChange={(e) => onChange(e.target.value)} {...common} />;
}

export default function EntityManager({ collectionName, title, fields, getTitle, getSubtitle, getImage, newDefaults = {}, reorderable = true }) {
  const { data, loading, reload } = useFetch(`/admin/collection/${collectionName}`, [collectionName]);
  const { data: categories } = useFetch("/admin/collection/gallery_categories", []);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const items = data || [];

  const openNew = () => {
    setEditing(null);
    setForm({ published: false, display_order: items.length, ...newDefaults });
    setOpen(true);
  };
  const openEdit = (item) => {
    setEditing(item);
    setForm({ ...item });
    setOpen(true);
  };

  const save = async () => {
    for (const f of fields) {
      if (f.required && (form[f.key] === undefined || form[f.key] === "" || form[f.key] === null)) {
        toast.error(`${f.label} is required.`);
        return;
      }
    }
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/admin/collection/${collectionName}/${editing.id}`, form);
        toast.success("Updated successfully");
      } else {
        await api.post(`/admin/collection/${collectionName}`, form);
        toast.success("Created successfully");
      }
      setOpen(false);
      reload();
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (item) => {
    try {
      await api.put(`/admin/collection/${collectionName}/${item.id}`, { ...item, published: !item.published });
      reload();
    } catch (err) {
      toast.error("Failed to update");
    }
  };

  const doDelete = async () => {
    try {
      await api.delete(`/admin/collection/${collectionName}/${confirm.id}`);
      toast.success("Deleted");
      setConfirm(null);
      reload();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const move = async (index, dir) => {
    const j = index + dir;
    if (j < 0 || j >= items.length) return;
    const ids = items.map((i) => i.id);
    [ids[index], ids[j]] = [ids[j], ids[index]];
    try {
      await api.post(`/admin/collection/${collectionName}/reorder`, { order: ids });
      reload();
    } catch (err) {
      toast.error("Reorder failed");
    }
  };

  const titleOf = (i) => (getTitle ? getTitle(i) : i.title || i.name || i.year || "(untitled)");
  const subOf = (i) => (getSubtitle ? getSubtitle(i) : i.event_date || i.position || i.role || i.category || "");
  const imgOf = (i) => (getImage ? getImage(i) : i.cover || i.image || i.photo || (i.images && i.images[0]?.url) || (i.photos && i.photos[0]?.url));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading font-bold text-2xl" style={{ color: "var(--deep-maroon)" }}>{title}</h1>
        <AButton onClick={openNew} data-testid={`add-${collectionName}-btn`}>
          <span className="inline-flex items-center gap-2"><Plus size={16} /> Add</span>
        </AButton>
      </div>

      {loading ? (
        <Loader />
      ) : !items.length ? (
        <div className="text-center py-16 rounded-xl border-2 border-dashed font-body" style={{ borderColor: "var(--antique-gold)", background: "#fff", color: "var(--text-muted)" }}>
          No entries yet. Click <strong>Add</strong> to create one.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-center gap-4 rounded-lg p-3" style={{ background: "#fff", border: "1px solid var(--antique-gold)" }} data-testid={`row-${collectionName}-${item.id}`}>
              {imgOf(item) ? (
                <img src={imgOf(item)} alt="" className="rounded object-cover shrink-0" style={{ width: 56, height: 56 }} />
              ) : (
                <div className="rounded shrink-0" style={{ width: 56, height: 56, background: "var(--cream)" }} />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-heading font-semibold truncate" style={{ color: "var(--deep-maroon)" }}>{titleOf(item)}</span>
                  {item.published ? <Badge tone="green">Published</Badge> : <Badge tone="gray">Draft</Badge>}
                </div>
                {subOf(item) ? <p className="font-ui text-sm truncate" style={{ color: "var(--text-muted)" }}>{subOf(item)}</p> : null}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {reorderable && (
                  <>
                    <button onClick={() => move(index, -1)} className="p-2 rounded hover:bg-black/5" aria-label="Move up" data-testid={`up-${item.id}`}><ArrowUp size={16} /></button>
                    <button onClick={() => move(index, 1)} className="p-2 rounded hover:bg-black/5" aria-label="Move down" data-testid={`down-${item.id}`}><ArrowDown size={16} /></button>
                  </>
                )}
                <button onClick={() => togglePublish(item)} className="p-2 rounded hover:bg-black/5" aria-label="Toggle publish" data-testid={`publish-${item.id}`}>
                  {item.published ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button onClick={() => openEdit(item)} className="p-2 rounded hover:bg-black/5" aria-label="Edit" data-testid={`edit-${item.id}`}><Pencil size={16} /></button>
                <button onClick={() => setConfirm(item)} className="p-2 rounded hover:bg-black/5" style={{ color: "#7a1414" }} aria-label="Delete" data-testid={`delete-${item.id}`}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? `Edit ${title}` : `Add ${title}`} wide>
        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          {fields.map((f) => (
            <div key={f.key}>
              <ALabel htmlFor={`f-${f.key}`}>{f.label}{f.required ? " *" : ""}</ALabel>
              <FieldInput field={f} value={form[f.key]} onChange={(v) => setForm((s) => ({ ...s, [f.key]: v }))} categories={categories} />
            </div>
          ))}
          <div className="flex items-center gap-3 pt-2">
            <AToggle checked={!!form.published} onChange={(v) => setForm((s) => ({ ...s, published: v }))} testId="field-published" />
            <span className="font-ui text-sm">{form.published ? "Published (visible on website)" : "Draft (hidden)"}</span>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4" style={{ borderTop: "1px solid var(--antique-gold)" }}>
          <AButton variant="outline" onClick={() => setOpen(false)}>Cancel</AButton>
          <AButton onClick={save} disabled={saving} data-testid="save-entity-btn">{saving ? "Saving..." : "Save"}</AButton>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        title="Delete entry?"
        message="This action cannot be undone."
        onConfirm={doDelete}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
