"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
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
import { getFriendlyErrorMessage, syncUserProfile, type AuthMode } from "./utils";

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

    return onAuthStateChanged(auth, setUser);
  }, []);

  // Redirect on successful login
  useEffect(() => {
    if (user) {
      void syncActiveUser(user).catch((syncError) => {
        console.error("Failed to sync authenticated user:", syncError);
      });
      router.push("/");
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
        } else {
          const credential = await signInWithEmailAndPassword(auth, email, password);
          await syncActiveUser(credential.user);
          setStatus("Dang nhap thanh cong.");
        }
      } catch (submitError) {
        setError(getFriendlyErrorMessage(submitError));
      } finally {
        setLoading(false);
      }
    },
    [mode, email, password, confirmPassword]
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
