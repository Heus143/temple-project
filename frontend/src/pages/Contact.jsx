import { useState } from "react";
import { useFetch, formatApiErrorDetail } from "../lib/hooks";
import api from "../lib/api";
import { PageTitle } from "../components/common";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";

export default function Contact() {
  const { data } = useFetch("/content/contact_info", []);
  const c = data || {};
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) {
      toast.error("Please enter your name and message.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (!payload.email) delete payload.email;
      await api.post("/contact-messages", payload);
      toast.success("Your message has been sent. Thank you.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Failed to send message.");
    } finally {
      setSubmitting(false);
    }
  };

  const Row = ({ icon: Icon, label, value }) =>
    value ? (
      <div className="flex items-start gap-3">
        <Icon className="shrink-0 mt-1" size={18} style={{ color: "var(--royal-maroon)" }} />
        <div>
          <p className="font-ui text-xs uppercase tracking-wide" style={{ color: "var(--antique-gold-dark)" }}>{label}</p>
          <p className="font-body whitespace-pre-line" style={{ color: "var(--text-primary)", fontSize: "1.05rem" }}>{value}</p>
        </div>
      </div>
    ) : null;

  const inputStyle = { background: "var(--beige)", border: "1px solid var(--antique-gold)", color: "var(--text-primary)" };

  return (
    <div className="max-w-5xl mx-auto px-4 pb-8" data-testid="contact-page">
      <PageTitle>Contact</PageTitle>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl p-6 md:p-8 space-y-5" style={{ background: "var(--ivory)", border: "1px solid var(--antique-gold)" }}>
          <h3 className="font-heading font-semibold text-xl" style={{ color: "var(--deep-maroon)" }}>Get in Touch</h3>
          <Row icon={Phone} label="Phone" value={c.phone} />
          <Row icon={Mail} label="Email" value={c.email} />
          <Row icon={MapPin} label="Address" value={c.address || "Avvaru Vari Street, Chirala, Bapatla District, Andhra Pradesh – 523155"} />
          <Row icon={Clock} label="Temple Timings" value={c.timings} />
          {c.note ? <p className="font-body" style={{ color: "var(--text-muted)" }}>{c.note}</p> : null}
        </div>

        <form onSubmit={submit} className="rounded-xl p-6 md:p-8" style={{ background: "var(--ivory)", border: "1px solid var(--antique-gold)" }} data-testid="contact-form">
          <h3 className="font-heading font-semibold text-xl mb-4" style={{ color: "var(--deep-maroon)" }}>Send a Message</h3>
          <div className="space-y-3">
            <div>
              <label className="font-ui text-sm" htmlFor="c-name">Name *</label>
              <input id="c-name" className="w-full mt-1 px-3 py-2 rounded-md font-body" style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="contact-name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-ui text-sm" htmlFor="c-email">Email</label>
                <input id="c-email" type="email" className="w-full mt-1 px-3 py-2 rounded-md font-body" style={inputStyle} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="contact-email" />
              </div>
              <div>
                <label className="font-ui text-sm" htmlFor="c-phone">Phone</label>
                <input id="c-phone" className="w-full mt-1 px-3 py-2 rounded-md font-body" style={inputStyle} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} data-testid="contact-phone" />
              </div>
            </div>
            <div>
              <label className="font-ui text-sm" htmlFor="c-subject">Subject</label>
              <input id="c-subject" className="w-full mt-1 px-3 py-2 rounded-md font-body" style={inputStyle} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} data-testid="contact-subject" />
            </div>
            <div>
              <label className="font-ui text-sm" htmlFor="c-message">Message *</label>
              <textarea id="c-message" rows={4} className="w-full mt-1 px-3 py-2 rounded-md font-body" style={inputStyle} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} data-testid="contact-message" />
            </div>
            <button type="submit" disabled={submitting} className="w-full font-heading font-semibold py-3 rounded-full disabled:opacity-60" style={{ background: "var(--deep-maroon)", color: "var(--ivory)" }} data-testid="contact-submit">
              {submitting ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
