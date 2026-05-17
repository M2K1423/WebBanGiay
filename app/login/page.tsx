import type { Metadata } from "next";
import AuthClient from "./auth-client";

export const metadata: Metadata = {
  title: "Dang nhap | Solelane Shoes",
  description: "Dang nhap va dang ky voi Firebase Auth cho Solelane Shoes"
};

export default function LoginPage() {
  return <AuthClient />;
}