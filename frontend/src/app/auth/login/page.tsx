"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input"; // UI primitive örneği
import { Button } from "@/components/ui/button"; // UI primitive örneği

import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, user } = require("@/context/auth-context").useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Giriş başarısız oldu.");
      }
      const data = await res.json();
      login({ accessToken: data.tokens.accessToken, refreshToken: data.tokens.refreshToken, user: data.user });
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20 p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">Giriş Yap</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={e => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Şifre"
          value={password}
          required
          onChange={e => setPassword(e.target.value)}
        />
        <Button type="submit" className="w-full">
          Giriş Yap
        </Button>
      </form>
      <p className="mt-4 text-sm">
        Hesabınız yok mu?{" "}
        <a href="/auth/register" className="underline text-blue-600">
          Kayıt Ol
        </a>
      </p>
    </div>
  );
}