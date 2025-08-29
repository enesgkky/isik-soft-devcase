"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [parentId, setParentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { login } = require("@/context/auth-context").useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("http://localhost:4000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name,
          password,
          parentId: parentId ? parentId : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Kayıt başarısız oldu.");
      }
      const data = await res.json();
      // API: { user, accessToken, refreshToken }
      login({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user });
      setSuccess(true);
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20 p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">Kayıt Ol</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={e => setEmail(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Adınız"
          value={name}
          required
          onChange={e => setName(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Şifre (min 8 karakter)"
          value={password}
          required
          minLength={8}
          onChange={e => setPassword(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Parent ID (opsiyonel)"
          value={parentId}
          onChange={e => setParentId(e.target.value)}
        />
        <Button type="submit" className="w-full">
          Kayıt Ol
        </Button>
      </form>
      <p className="mt-4 text-sm">
        Zaten hesabınız var mı?{" "}
        <a href="/auth/login" className="underline text-blue-600">
          Giriş Yap
        </a>
      </p>
    </div>
  );
}