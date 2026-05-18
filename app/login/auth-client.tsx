"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from "firebase/auth";
import {
  getFirebaseAuth,
  isFirebaseConfigured,
  getGoogleProvider,
  getFacebookProvider,
  getGithubProvider
} from "@/lib/firebase";

type AuthMode = "login" | "register";

function getFriendlyErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Co loi xay ra. Vui long thu lai.";
}

export default function AuthClient() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState("Nhap email va mat khau de tiep tuc.");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const auth = getFirebaseAuth();

    if (!auth) {
      setStatus("Firebase chua duoc cau hinh trong .env.local.");
      return;
    }

    return onAuthStateChanged(auth, setUser);
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const auth = getFirebaseAuth();

    setError("");
    setStatus("");

    if (!auth) {
      setError("Firebase chua duoc cau hinh. Hay dien cac bien NEXT_PUBLIC_FIREBASE_*.");
      return;
    }

    if (mode === "register" && password !== confirmPassword) {
      setError("Mat khau xac nhan khong khop.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "register") {
        await createUserWithEmailAndPassword(auth, email, password);
        setStatus("Dang ky thanh cong. Tai khoan da duoc luu trong Firebase Auth.");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setStatus("Dang nhap thanh cong.");
      }
    } catch (submitError) {
      setError(getFriendlyErrorMessage(submitError));
    } finally {
      setLoading(false);
    }
  }

  async function handleSocialLogin(providerName: "google" | "facebook" | "github") {
    const auth = getFirebaseAuth();

    if (!auth) {
      setError("Firebase chua duoc cau hinh.");
      return;
    }

    setError("");
    setStatus("Dang mo cua so dang nhap...");
    setLoading(true);

    try {
      const provider =
        providerName === "google"
          ? getGoogleProvider()
          : providerName === "facebook"
            ? getFacebookProvider()
            : getGithubProvider();

      await signInWithPopup(auth, provider);
      setStatus(`Dang nhap bang ${providerName} thanh cong.`);
    } catch (socialError) {
      setError(getFriendlyErrorMessage(socialError));
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    const auth = getFirebaseAuth();

    if (!auth) {
      return;
    }

    setError("");
    setStatus("Dang dang xuat...");
    await signOut(auth);
    setStatus("Da dang xuat.");
  }

  const configured = isFirebaseConfigured();

  return (
    <main className="page-shell auth-shell-center">
      <section className="auth-card">
        <div className="auth-card-top">
          <div>
            <p className="eyebrow">Account</p>
            <h2>{mode === "login" ? "Dang nhap" : "Dang ky"}</h2>
          </div>
          <span className="auth-badge">Firebase UI</span>
        </div>

        <div className="auth-switch" role="tablist" aria-label="Chuyen doi dang nhap va dang ky">
          <button
            type="button"
            data-active={mode === "login"}
            onClick={() => setMode("login")}
          >
            Dang nhap
          </button>
          <button
            type="button"
            data-active={mode === "register"}
            onClick={() => setMode("register")}
          >
            Dang ky
          </button>
        </div>

        {user ? (
          <div className="auth-state">
            <div>
              <p className="auth-badge">Da xac thuc</p>
              <h3>{user.email ?? "Tai khoan Firebase"}</h3>
              <p>
                Firebase Auth dang luu session cua ban. Ban co the dang xuat hoac
                quay lai trang chu de xem san pham.
              </p>
            </div>
            <button className="auth-signout" type="button" onClick={handleSignOut}>
              Dang xuat
            </button>
            <Link className="secondary-action" href="/">
              Ve trang chu
            </Link>
          </div>
        ) : configured ? (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password">Mat khau</label>
              <input
                id="password"
                type="password"
                autoComplete={mode === "register" ? "new-password" : "current-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Nhap mat khau"
                required
              />
            </div>

            {mode === "register" ? (
              <div className="auth-field">
                <label htmlFor="confirmPassword">Xac nhan mat khau</label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Nhap lai mat khau"
                  required
                />
              </div>
            ) : null}

            {error ? <p className="auth-error">{error}</p> : null}
            {status ? <p className="auth-status">{status}</p> : null}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Dang xu ly..." : mode === "login" ? "Dang nhap" : "Tao tai khoan"}
            </button>

            <div className="auth-divider">
              <span>hoac</span>
            </div>

            <div className="auth-social">
              <button
                type="button"
                className="auth-social-btn auth-social-google"
                onClick={() => handleSocialLogin("google")}
                disabled={loading}
                title="Dang nhap voi Google"
              >
                🔍 Google
              </button>
              <button
                type="button"
                className="auth-social-btn auth-social-facebook"
                onClick={() => handleSocialLogin("facebook")}
                disabled={loading}
                title="Dang nhap voi Facebook"
              >
                f Facebook
              </button>
              <button
                type="button"
                className="auth-social-btn auth-social-github"
                onClick={() => handleSocialLogin("github")}
                disabled={loading}
                title="Dang nhap voi GitHub"
              >
                ⚙ GitHub
              </button>
            </div>
          </form>
        ) : (
          <div className="auth-setup">
            <p className="eyebrow">Can cau hinh Firebase</p>
            <p>
              Dien cac bien sau trong <strong>web-shoes/.env.local</strong> de bat
              dau dang nhap/ dang ky:
            </p>
            <ul>
              <li>NEXT_PUBLIC_FIREBASE_API_KEY</li>
              <li>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</li>
              <li>NEXT_PUBLIC_FIREBASE_PROJECT_ID</li>
              <li>NEXT_PUBLIC_FIREBASE_APP_ID</li>
            </ul>
          </div>
        )}

        {/* auth-note removed as requested */}
      </section>
    </main>
  );
}