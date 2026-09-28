import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatApiErrorDetail } from "../lib/hooks";
import { AButton, AInput, ALabel } from "./ui";

export default function AdminLogin() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user && user !== false) navigate("/admin", { replace: true });
  }, [user, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email.trim(), password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(160deg, var(--deep-maroon), var(--warm-brown))" }}>
      <div className="w-full max-w-md rounded-2xl p-8" style={{ background: "var(--ivory)", border: "2px solid var(--antique-gold)", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex items-center justify-center rounded-full" style={{ width: 60, height: 60, background: "var(--deep-maroon)", color: "var(--light-gold)" }}>
            <span className="font-telugu" style={{ fontSize: 30 }}>ॐ</span>
          </div>
          <h1 className="font-heading font-bold text-2xl" style={{ color: "var(--deep-maroon)" }}>Admin Login</h1>
          <p className="font-telugu text-sm mt-1" style={{ color: "var(--text-muted)" }}>శ్రీ అన్నపూర్ణమ్మ అమ్మ వారి దేవర మందిరము</p>
        </div>
        <form onSubmit={submit} className="space-y-4" data-testid="admin-login-form">
          <div>
            <ALabel htmlFor="email">Email</ALabel>
            <AInput id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required data-testid="login-email" />
          </div>
          <div>
            <ALabel htmlFor="password">Password</ALabel>
            <AInput id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required data-testid="login-password" />
          </div>
          {error ? <p className="font-ui text-sm" style={{ color: "#7a1414" }} data-testid="login-error">{error}</p> : null}
          <AButton type="submit" disabled={busy} className="w-full" data-testid="login-submit">{busy ? "Signing in..." : "Sign In"}</AButton>
        </form>
        <div className="flex justify-between mt-4 font-ui text-sm">
          <Link to="/forgot-password" className="underline" style={{ color: "var(--royal-maroon)" }} data-testid="forgot-link">Forgot password?</Link>
          <Link to="/" className="underline" style={{ color: "var(--text-muted)" }}>Back to site</Link>
        </div>
      </div>
    </div>
  );
}
