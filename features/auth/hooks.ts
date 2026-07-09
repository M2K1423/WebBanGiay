"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { User } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail
} from "firebase/auth";
import {
  getFirebaseAuth,
  isFirebaseConfigured,
  getGoogleProvider,
  getFacebookProvider,
  getGithubProvider
} from "@/lib/firebase";
import { getFriendlyErrorMessage, syncUserProfile, type AuthMode, getApiBaseUrl } from "./utils";

export function useAuthLogic() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState("Nhap email va mat khau de tiep tuc.");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const syncedUserUidRef = useRef<string | null>(null);

  const syncActiveUser = useCallback(async (activeUser: User | null) => {
    if (!activeUser) {
      return;
    }

    if (syncedUserUidRef.current === activeUser.uid) {
      return;
    }

    await syncUserProfile(activeUser);
    syncedUserUidRef.current = activeUser.uid;
  }, []);

  // Initialize auth state listener
  useEffect(() => {
    const auth = getFirebaseAuth();

    if (!auth) {
      setStatus("Firebase chua duoc cau hinh trong .env.local.");
      return;
    }

    return onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        // Clear token from cookies on signout
        document.cookie = "firebase_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax; Secure";
      }
    });
  }, []);

  // Redirect on successful login
  useEffect(() => {
    if (user) {
      void (async () => {
        try {
          const token = await user.getIdToken();
          
          // Save token to cookies for server-side use or easy retrieval
          document.cookie = `firebase_token=${token}; path=/; max-age=3600; SameSite=Lax; Secure`;

          console.log("%c=== FIREBASE ID TOKEN FOR POSTMAN ===", "color: #0070f3; font-weight: bold; font-size: 14px;");
          console.log(token);
          console.log("%c=====================================", "color: #0070f3; font-weight: bold;");
        } catch (e) {
          console.error("Failed to fetch Firebase ID token for console logging:", e);
        }

        await syncActiveUser(user).catch((syncError) => {
          console.error("Failed to sync authenticated user:", syncError);
        });

        // After syncing, check backend if the user is admin and redirect accordingly
        try {
          const token = await user.getIdToken();
          const res = await fetch(`${getApiBaseUrl()}/users/${user.uid}`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.isAdmin) {
              router.push("/admin");
              return;
            }
          }
        } catch (err) {
          // ignore and fallthrough to home
        }

        router.push("/");
      })();
    }
  }, [user, router, syncActiveUser]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
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
          const credential = await createUserWithEmailAndPassword(auth, email, password);
          await syncActiveUser(credential.user);
          setStatus("Dang ky thanh cong. Tai khoan da duoc luu trong Firebase Auth.");
        } else if (mode === "login") {
          const credential = await signInWithEmailAndPassword(auth, email, password);
          await syncActiveUser(credential.user);
          setStatus("Dang nhap thanh cong.");
        } else if (mode === "forgot-password") {
          await sendPasswordResetEmail(auth, email);
          setStatus("Link dat lai mat khau da duoc gui qua email. Vui long kiem tra hop thu den.");
        }
      } catch (submitError) {
        setError(getFriendlyErrorMessage(submitError));
      } finally {
        setLoading(false);
      }
    },
    [mode, email, password, confirmPassword, syncActiveUser]
  );

  const handleSocialLogin = useCallback(
    async (providerName: "google" | "facebook" | "github") => {
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

        const credential = await signInWithPopup(auth, provider);
        await syncActiveUser(credential.user);
        setStatus(`Dang nhap bang ${providerName} thanh cong.`);
      } catch (socialError) {
        setError(getFriendlyErrorMessage(socialError));
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleSignOut = useCallback(async () => {
    const auth = getFirebaseAuth();

    if (!auth) {
      return;
    }

    setError("");
    setStatus("Dang dang xuat...");
    await signOut(auth);
    // Explicitly clear cookie on signout
    document.cookie = "firebase_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax; Secure";
    setStatus("Da dang xuat.");
  }, []);

  return {
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
  };
}
