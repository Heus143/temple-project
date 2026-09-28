import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { formatApiErrorDetail } from "../lib/hooks";
import { AButton, AInput, ALabel } from "../admin/ui";

function Shell({ title, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(160deg, var(--deep-maroon), var(--warm-brown))" }}>
      <div className="w-full max-w-md rounded-2xl p-8" style={{ background: "var(--ivory)", border: "2px solid var(--antique-gold)" }}>
        <h1 className="font-heading font-bold text-2xl text-center mb-4" style={{ color: "var(--deep-maroon)" }}>{title}</h1>
        {children}
      </div>
    </div>
  );
}

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/auth/forgot-password", { email: email.trim() });
    } catch (err) {
      /* generic response either way */
    } finally {
      setBusy(false);
      setDone(true);
    }
  };

  return (
    <Shell title="Forgot Password">
      {done ? (
        <p className="font-body text-center" style={{ color: "var(--text-muted)" }} data-testid="forgot-done">
          If that email is registered, a reset link has been sent. Please check your inbox.
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-4" data-testid="forgot-form">
          <div>
            <ALabel htmlFor="fp-email">Admin Email</ALabel>
            <AInput id="fp-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required data-testid="forgot-email" />
          </div>
          <AButton type="submit" disabled={busy} className="w-full" data-testid="forgot-submit">{busy ? "Sending..." : "Send Reset Link"}</AButton>
        </form>
      )}
      <div className="text-center mt-4">
        <Link to="/admin/login" className="underline font-ui text-sm" style={{ color: "var(--royal-maroon)" }}>Back to sign in</Link>
      </div>
    </Shell>
  );
}

export function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      navigate("/admin/login", { replace: true });
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || "Reset failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell title="Reset Password">
      {!token ? (
        <p className="font-body text-center" style={{ color: "#7a1414" }}>Invalid or missing reset link.</p>
      ) : (
        <form onSubmit={submit} className="space-y-4" data-testid="reset-form">
          <div>
            <ALabel htmlFor="rp-pw">New Password</ALabel>
            <AInput id="rp-pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required data-testid="reset-password" />
          </div>
          {error ? <p className="font-ui text-sm" style={{ color: "#7a1414" }} data-testid="reset-error">{error}</p> : null}
          <AButton type="submit" disabled={busy} className="w-full" data-testid="reset-submit">{busy ? "Resetting..." : "Reset Password"}</AButton>
        </form>
      )}
      <div className="text-center mt-4">
        <Link to="/admin/login" className="underline font-ui text-sm" style={{ color: "var(--royal-maroon)" }}>Back to sign in</Link>
      </div>
    </Shell>
  );
}
