import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";

export default function History() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const page = parseInt(searchParams.get("page") || "1", 10);
  const masterKeyHex =
    import.meta.env.VITE_MASTER_DECRYPTION_KEY ||
    import.meta.env.MASTER_DECRYPTION_KEY;

  // Debug environment variable
  console.log("🔑 Environment check:");
  console.log("- Master key present:", !!masterKeyHex);
  console.log("- Master key length:", masterKeyHex?.length || 0);
  console.log(
    "- Master key first 10 chars:",
    masterKeyHex?.substring(0, 10) || "N/A"
  );
  console.log(
    "- All VITE env vars:",
    Object.keys(import.meta.env).filter((key) => key.startsWith("VITE_"))
  );

  useEffect(() => {
    const handleAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        console.log("✅ User from getSession:", session.user.id);
        setUserId(session.user.id);
      } else {
        // Listen for delayed session via auth change
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log("📡 Auth event:", event);
            if (session?.user) {
              console.log("✅ User from onAuthStateChange:", session.user.id);
              setUserId(session.user.id);
            } else {
              console.warn("🚪 No session — redirecting");
              navigate("/login");
            }
          }
        );

        // Give it 4 seconds max to update
        setTimeout(() => {
          console.warn("⏰ Timeout — still no session after delay");
          navigate("/login");
        }, 4000);

        // Clean up
        return () => {
          authListener?.subscription?.unsubscribe();
        };
      }
    };

    handleAuth();
  }, [navigate]);

  useEffect(() => {
    async function fetchEntries() {
      if (!userId) {
        console.log("⏳ No userId yet, skipping fetch");
        return;
      }

      console.log("📬 Fetching entries for user ID:", userId, "page:", page);

      try {
        const res = await fetch(
          `https://reflectionary-api.vercel.app/api/history?user_id=${encodeURIComponent(
            userId
          )}&page=${page}`
        );

        console.log("📡 Response status:", res.status);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        console.log("🔍 Raw fetched data:", data);

        if (!Array.isArray(data)) {
          console.error("❌ Expected array but got:", typeof data, data);
          setError("Invalid data format received.");
          return;
        }

        const decrypted = await Promise.all(
          data.map(async (entry) => await decryptEntry(entry))
        );
        console.log("🧩 Decrypted entries:", decrypted);
        setEntries(decrypted);
      } catch (err) {
        console.error("❌ Failed to load history:", err);
        setError(`Failed to load journal entries: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchEntries();
  }, [page, userId]);

  async function decryptEntry(entry) {
    const textDecoder = new TextDecoder();

    function base64ToBytes(str) {
      if (!str) throw new Error("Base64 string is undefined or empty");
      return Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
    }

    function hexToBytes(hex) {
      if (!hex) throw new Error("Hex string is undefined or empty");
      if (typeof hex !== "string")
        throw new Error(`Hex must be a string, got ${typeof hex}`);
      return Uint8Array.from(hex.match(/.{1,2}/g).map((b) => parseInt(b, 16)));
    }

    async function decryptAES(encryptedBase64, keyBytes, ivBase64) {
      const iv = base64ToBytes(ivBase64);
      const encrypted = base64ToBytes(encryptedBase64);
      const cryptoKey = await window.crypto.subtle.importKey(
        "raw",
        keyBytes,
        { name: "AES-CBC" },
        false,
        ["decrypt"]
      );
      const decrypted = await window.crypto.subtle.decrypt(
        { name: "AES-CBC", iv },
        cryptoKey,
        encrypted
      );
      return textDecoder.decode(decrypted);
    }

    try {
      console.log("🔑 Master key hex:", masterKeyHex ? "Present" : "MISSING!");
      console.log("🔍 Entry structure:", Object.keys(entry));

      if (!masterKeyHex) {
        throw new Error(
          "VITE_MASTER_DECRYPTION_KEY environment variable is not set"
        );
      }

      const masterKeyBytes = hexToBytes(masterKeyHex);
      const decryptedDataKeyBase64 = await decryptAES(
        entry.encrypted_data_key,
        masterKeyBytes,
        entry.data_key_iv
      );
      const dataKey = base64ToBytes(decryptedDataKeyBase64);

      const decryptedContent = await decryptAES(
        entry.encrypted_content,
        dataKey,
        entry.content_iv
      );

      const decryptedPrompt = entry.encrypted_prompt
        ? await decryptAES(entry.encrypted_prompt, dataKey, entry.prompt_iv)
        : null;

      const decryptedFollowups = await Promise.all(
        (entry.followups || []).map(async (fup) => {
          const fupContent = await decryptAES(
            fup.encrypted_content,
            dataKey,
            fup.content_iv
          );
          const fupPrompt = fup.encrypted_prompt
            ? await decryptAES(fup.encrypted_prompt, dataKey, fup.prompt_iv)
            : null;
          return {
            ...fup,
            decrypted_content: fupContent,
            decrypted_prompt: fupPrompt,
          };
        })
      );

      return {
        ...entry,
        decrypted_content: decryptedContent,
        decrypted_prompt: decryptedPrompt,
        decrypted_followups: decryptedFollowups,
      };
    } catch (err) {
      console.error("Decryption failed for entry:", entry.id, err);
      return {
        ...entry,
        decrypted_content: "[Decryption failed]",
      };
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">Journal History</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">Journal History</h1>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Render Journal History</h1>

      {entries.length === 0 ? (
        <p className="text-gray-500">
          No journal entries found for page {page}.
        </p>
      ) : (
        entries.map((entry) => (
          <div key={entry.id} className="mb-6 p-4 border rounded shadow">
            <p className="text-sm text-gray-500 mb-2">
              {new Date(entry.created_at).toLocaleString()}
            </p>
            {entry.decrypted_prompt && (
              <p className="italic text-purple-600 mb-2">
                Prompt: {entry.decrypted_prompt}
              </p>
            )}
            <h2 className="font-bold mb-2">Journal Entry:</h2>
            <div
              className="prose mb-4"
              dangerouslySetInnerHTML={{ __html: entry.decrypted_content }}
            />
            {entry.decrypted_followups?.map((fup, index) => (
              <div
                key={index}
                className="bg-gray-100 p-4 rounded-md mb-2 border"
              >
                <p className="text-sm text-gray-500 mb-1">
                  {new Date(fup.created_at).toLocaleString()}
                  <br />
                  <span className="text-xs uppercase font-semibold text-gray-500">
                    Follow-up Response
                  </span>
                </p>
                {fup.decrypted_prompt && (
                  <p className="italic text-purple-600 mb-2">
                    Prompt: {fup.decrypted_prompt}
                  </p>
                )}
                <div
                  className="prose"
                  dangerouslySetInnerHTML={{ __html: fup.decrypted_content }}
                />
              </div>
            ))}
          </div>
        ))
      )}

      <div className="flex justify-between mt-6">
        <button
          disabled={page <= 1}
          onClick={() => setSearchParams({ page: page - 1 })}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="self-center">Page {page}</span>
        <button
          onClick={() => setSearchParams({ page: page + 1 })}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}
