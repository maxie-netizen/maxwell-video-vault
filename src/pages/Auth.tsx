
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        return;
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        return;
      }
    }
    navigate("/");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950">
      <form className="bg-neutral-900 p-6 rounded-2xl shadow-lg w-full max-w-xs flex flex-col gap-4" onSubmit={handleSubmit}>
        <h2 className="text-xl font-bold text-white mb-2">{isLogin ? "Login" : "Sign Up"}</h2>
        <input
          type="email"
          required
          value={email}
          autoFocus
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          className="bg-neutral-800 px-4 py-2 rounded text-white"
        />
        <input
          type="password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          className="bg-neutral-800 px-4 py-2 rounded text-white"
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">{isLogin ? "Login" : "Sign Up"}</Button>
        <button
          type="button"
          className="text-sm text-gray-400 underline"
          onClick={() => setIsLogin(l => !l)}
        >
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
        </button>
      </form>
    </div>
  );
}
