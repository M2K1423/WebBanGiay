"use client";

import Link from "next/link";
import { useAuthLogic } from "@/features/auth/hooks";
import { isFirebaseConfigured } from "@/lib/firebase";

export default function AuthClient() {
  const {
    mode,
    setMode,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    user,
    status,
    error,
    loading,
    handleSubmit,
    handleSocialLogin,
    handleSignOut
  } = useAuthLogic();

  return (
    <main className="page-shell auth-shell-center">
      <section className="auth-card">
        <div className="auth-card-top">
          <div>
            <p className="eyebrow">Account</p>
            <h2>{mode === "login" ? "Dang nhap" : mode === "forgot-password" ? "Quen mat khau" : "Dang ky"}</h2>
          </div>
          <span className="auth-badge">Firebase UI</span>
        </div>

        {mode !== "forgot-password" && (
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
        )}

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
        ) : isFirebaseConfigured() ? (
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

            {mode !== "forgot-password" && (
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
            )}

            {mode === "login" && (
              <div className="text-right -mt-2">
                <button
                  type="button"
                  onClick={() => setMode("forgot-password")}
                  className="text-xs text-[#0d3a6b] hover:underline font-bold"
                >
                  Quên mật khẩu?
                </button>
              </div>
            )}

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
              {loading ? "Dang xu ly..." : mode === "login" ? "Dang nhap" : mode === "forgot-password" ? "Gửi link reset mật khẩu" : "Tao tai khoan"}
            </button>

            {mode === "forgot-password" && (
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-xs text-center text-[#0d3a6b] hover:underline font-bold mt-2"
              >
                Quay lại Đăng nhập
              </button>
            )}

            {mode !== "forgot-password" && (
              <>
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
              </>
            )}
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
