// /src/pages/LoginPage.jsx
import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error.message);
      setErrorMsg(error.message);
    } else {
      console.log("Logged in as:", data.user);
      setErrorMsg("");
      window.location.href = "/new-entry"; // or redirect to history if preferred
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-purple-100 p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-purple-800 mb-2">
          Welcome to Reflectionary
        </h1>
        <p className="text-lg text-purple-600">
          Where your voice finds meaning
        </p>
      </div>
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg"
          />
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition"
          >
            Sign In
          </button>
          {errorMsg && <p className="text-red-600 mt-4">{errorMsg}</p>}
        </form>
      </div>
    </div>
  );
}
