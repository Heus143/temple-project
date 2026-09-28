import { useState, useRef } from "react";
import api from "../lib/api";
import { formatApiErrorDetail } from "../lib/hooks";
import { AButton } from "./ui";
import { Upload, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";

async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function uploadFile(file) {
  const dataUrl = await fileToDataUrl(file);
  const { data } = await api.post("/admin/media", {
    data_url: dataUrl,
    filename: file.name,
    size: file.size,
  });
  return data.data_url;
}

// Single image uploader. value = url string, onChange(url)
export function ImageUploader({ value, onChange, testId }) {
  const inputRef = useRef();
  const [busy, setBusy] = useState(false);

  const handle = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadFile(file);
      onChange(url);
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handle} data-testid={testId ? `${testId}-input` : undefined} />
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="preview" className="rounded-md object-cover" style={{ width: 130, height: 160, border: "1px solid var(--antique-gold)", background: "#fff" }} />
          <button type="button" onClick={() => onChange("")} className="absolute -top-2 -right-2 rounded-full p-1" style={{ background: "#7a1414", color: "#fff" }} aria-label="Remove image" data-testid={testId ? `${testId}-remove` : undefined}>
            <Trash2 size={14} />
          </button>
        </div>
      ) : (
        <AButton type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={busy} data-testid={testId ? `${testId}-btn` : undefined}>
          <span className="inline-flex items-center gap-2"><Upload size={16} /> {busy ? "Uploading..." : "Upload Image"}</span>
        </AButton>
      )}
    </div>
  );
}

// Multiple images with captions. value = array of {url, caption}, onChange(array)
export function MultiImageUploader({ value, onChange, testId }) {
  const inputRef = useRef();
  const [busy, setBusy] = useState(false);
  const list = Array.isArray(value) ? value : [];

  const handle = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setBusy(true);
    try {
      const uploaded = [];
      for (const f of files) {
        const url = await uploadFile(f);
        uploaded.push({ url, caption: "" });
      }
      onChange([...list, ...uploaded]);
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const update = (i, patch) => onChange(list.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const remove = (i) => onChange(list.filter((_, idx) => idx !== i));
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handle} data-testid={testId ? `${testId}-input` : undefined} />
      <AButton type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={busy} data-testid={testId ? `${testId}-btn` : undefined}>
        <span className="inline-flex items-center gap-2"><Upload size={16} /> {busy ? "Uploading..." : "Upload Photos"}</span>
      </AButton>
      {list.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
          {list.map((it, i) => (
            <div key={i} className="rounded-md p-2" style={{ border: "1px solid var(--antique-gold)", background: "#fff" }}>
              <img src={it.url} alt={it.caption || "photo"} className="w-full h-28 object-cover rounded" />
              <input
                className="w-full mt-2 px-2 py-1 text-sm rounded font-body"
                style={{ border: "1px solid var(--antique-gold)" }}
                placeholder="Caption (optional)"
                value={it.caption || ""}
                onChange={(e) => update(i, { caption: e.target.value })}
                data-testid={testId ? `${testId}-caption-${i}` : undefined}
              />
              <div className="flex justify-between mt-2">
                <div className="flex gap-1">
                  <button type="button" onClick={() => move(i, -1)} className="px-2 py-1 rounded text-xs" style={{ border: "1px solid var(--antique-gold)" }} aria-label="Move left"><GripVertical size={12} /></button>
                </div>
                <div className="flex gap-1">
                  <button type="button" onClick={() => move(i, -1)} className="px-2 py-1 rounded text-xs" style={{ border: "1px solid var(--antique-gold)" }}>↑</button>
                  <button type="button" onClick={() => move(i, 1)} className="px-2 py-1 rounded text-xs" style={{ border: "1px solid var(--antique-gold)" }}>↓</button>
                  <button type="button" onClick={() => remove(i)} className="px-2 py-1 rounded text-xs" style={{ background: "#7a1414", color: "#fff" }} data-testid={testId ? `${testId}-remove-${i}` : undefined}><Trash2 size={12} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
