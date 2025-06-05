import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEncryption } from "../contexts/EncryptionContext";
import EncryptionUnlockModal from "../components/EncryptionUnlockModal"; // Updated filename
import supabase from "../supabaseClient";

export default function History() {
  const { user, loading: authLoading } = useAuth();
  const {
    decryptJournalEntry,
    isUnlocked,
    showUnlockModal,
    setShowUnlockModal,
  } = useEncryption();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const page = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    if (!authLoading && !user) {
      console.warn("🚪 No user found — redirecting");
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    async function fetchEntries() {
      if (!user?.id) return;

      console.log("📬 Fetching entries for user ID:", user.id, "page:", page);

      try {
        const res = await fetch(
          `https://reflectionary-api.vercel.app/api/history?user_id=${encodeURIComponent(
            user.id
          )}&page=${page}`
        );

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
          setError("Invalid data format received.");
          return;
        }

        const decrypted = await Promise.all(
          data.map((entry) => decryptJournalEntry(entry))
        );

        setEntries(decrypted);
      } catch (err) {
        console.error("❌ Failed to load history:", err);
        setError(`Failed to load journal entries: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading && user?.id && isUnlocked) {
      fetchEntries();
    } else if (!isUnlocked) {
      setShowUnlockModal(true);
    }
  }, [
    page,
    authLoading,
    user,
    isUnlocked,
    decryptJournalEntry,
    setShowUnlockModal,
  ]);

  if (authLoading || loading) {
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
      {showUnlockModal && (
        <EncryptionUnlockModal
          onClose={() => setShowUnlockModal(false)}
          message="To protect your privacy, all journal entries are encrypted. Please enter your password to unlock and view your entries."
        />
      )}

      <h1 className="text-2xl font-semibold mb-4">Journal History</h1>

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
            {entry.prompt && (
              <p className="italic text-purple-600 mb-2">
                Prompt: {entry.prompt}
              </p>
            )}
            <h2 className="font-bold mb-2">Journal Entry:</h2>
            <div
              className="prose mb-4"
              dangerouslySetInnerHTML={{
                __html: entry.html_content || entry.content,
              }}
            />
            {entry.followups?.map((fup, index) => (
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
                {fup.prompt && (
                  <p className="italic text-purple-600 mb-2">
                    Prompt: {fup.prompt}
                  </p>
                )}
                <div
                  className="prose"
                  dangerouslySetInnerHTML={{
                    __html: fup.html_content || fup.content,
                  }}
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
