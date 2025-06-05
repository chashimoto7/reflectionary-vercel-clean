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

  const fetchEntries = async () => {
    if (!user?.id) {
      console.log("No user ID available");
      return;
    }

    if (!isUnlocked) {
      console.log("Encryption not unlocked, cannot fetch entries");
      setError("Please unlock encryption first");
      return;
    }

    console.log("📬 Fetching entries for user ID:", user.id, "page:", page);
    console.log("🔑 Encryption status:", { isUnlocked });
    setLoading(true);
    setError(null);

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
      console.log("📋 Raw entries data:", data);
      console.log(
        "📋 First entry fields:",
        data[0] ? Object.keys(data[0]) : "No entries"
      );

      if (!Array.isArray(data)) {
        setError("Invalid data format received.");
        return;
      }

      if (data.length === 0) {
        console.log("No entries found for this page");
        setEntries([]);
        return;
      }

      console.log("🔓 Starting decryption of", data.length, "entries");

      // Try to decrypt entries one by one to see which ones fail
      const decrypted = [];
      for (let i = 0; i < data.length; i++) {
        const entry = data[i];
        try {
          console.log(`Decrypting entry ${i + 1}/${data.length}:`, entry.id);
          const decryptedEntry = await decryptJournalEntry(entry);
          console.log(`✅ Successfully decrypted entry ${i + 1}`);
          decrypted.push(decryptedEntry);
        } catch (decryptError) {
          console.error(`❌ Failed to decrypt entry ${entry.id}:`, {
            error: decryptError.message,
            entryCreatedAt: entry.created_at,
            entryIndex: i + 1,
          });
          // Continue with other entries instead of failing completely
          console.log(
            `⏭️ Skipping entry ${entry.id} and continuing with others...`
          );
        }
      }

      console.log(
        `📊 Decryption summary: ${decrypted.length}/${data.length} entries decrypted successfully`
      );
      setEntries(decrypted);
    } catch (err) {
      console.error("❌ Failed to load history:", err);
      setError(`Failed to load journal entries: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("useEffect triggered:", {
      authLoading,
      userId: user?.id,
      isUnlocked,
      page,
    });

    if (authLoading) {
      console.log("Auth still loading, waiting...");
      return;
    }

    if (!user?.id) {
      console.log("No user found after auth completed");
      setLoading(false);
      setError("Please log in to view your journal history");
      return;
    }

    if (!isUnlocked) {
      console.log("Encryption not unlocked, showing modal");
      setShowUnlockModal(true);
      setLoading(false);
      return;
    }

    // All conditions met, fetch entries
    console.log("All conditions met, fetching entries");
    setShowUnlockModal(false);
    fetchEntries();
  }, [page, authLoading, user?.id, isUnlocked]);

  if (authLoading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">Journal History</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">Journal History</h1>
        <p>Please log in to view your journal history</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">Journal History</h1>
        <p>Loading journal entries...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">Journal History</h1>
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchEntries}
          className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Try Again
        </button>
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
