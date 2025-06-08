import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSecurity } from "../contexts/SecurityContext";
import encryptionService from "../services/encryptionService";
import { supabase } from "../lib/supabase";

export default function History() {
  const { user, loading: authLoading } = useAuth();
  const { isLocked, masterKey } = useSecurity(); // Updated to use new SecurityContext

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const page = parseInt(searchParams.get("page") || "1", 10);

  // Function to decrypt journal entry using the new system
  const decryptJournalEntry = async (entry) => {
    try {
      let key = masterKey;

      // Load the static master key if not already available
      if (!key) {
        console.log("🔑 No masterKey found — loading static key manually");
        key = await encryptionService.getStaticMasterKey();
      }

      // First decrypt the data key
      const dataKey = await encryptionService.decryptKey(
        {
          encryptedData: entry.encrypted_data_key,
          iv: entry.data_key_iv,
        },
        key
      );

      // Decrypt the content
      const decryptedContent = await encryptionService.decryptText(
        entry.encrypted_content,
        entry.content_iv,
        dataKey
      );

      // Decrypt the prompt if it exists
      let decryptedPrompt = null;
      if (entry.encrypted_prompt && entry.prompt_iv) {
        decryptedPrompt = await encryptionService.decryptText(
          entry.encrypted_prompt,
          entry.prompt_iv,
          dataKey
        );
      }

      return {
        ...entry,
        content: decryptedContent,
        html_content: decryptedContent, // For display
        prompt: decryptedPrompt,
      };
    } catch (error) {
      console.error("Decryption failed for entry:", entry.id, error);
      throw error;
    }
  };

  const fetchEntries = async () => {
    if (!user?.id) {
      console.log("No user ID available");
      return;
    }

    if (isLocked) {
      console.log("App is locked, cannot fetch entries");
      setError("Please unlock your journal to view entries");
      return;
    }

    console.log("📬 Fetching entries for user ID:", user.id, "page:", page);
    console.log("🔑 Encryption status:", {
      isLocked: isLocked,
      hasMasterKey: !!masterKey,
    });
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
      isLocked,
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

    if (isLocked) {
      console.log("App is locked, waiting for unlock");
      setLoading(false);
      setError("Please unlock your journal to view entries");
      return;
    }

    // All conditions met, fetch entries
    console.log("All conditions met, fetching entries");
    fetchEntries();
  }, [page, authLoading, user?.id, isLocked]);

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

  // Show message if locked - the unlock modal is handled by the main app
  if (isLocked) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">Journal History</h1>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            Your journal is locked for security. Please unlock it to view your
            entries.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">Journal History</h1>
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
          <p>Loading and decrypting journal entries...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">Journal History</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800">{error}</p>
        </div>
        <button
          onClick={fetchEntries}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Journal History</h1>
        <div className="flex items-center text-sm text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Entries Decrypted
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No journal entries found for page {page}.
          </p>
          {page > 1 && (
            <button
              onClick={() => setSearchParams({ page: 1 })}
              className="mt-4 text-blue-500 hover:text-blue-700"
            >
              Go to first page
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white p-6 border rounded-lg shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <p className="text-sm text-gray-500">
                  {new Date(entry.created_at).toLocaleString()}
                </p>
                {entry.is_follow_up && (
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                    Follow-up
                  </span>
                )}
              </div>

              {entry.prompt && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium text-green-800 mb-1">
                    Prompt:
                  </p>
                  <p className="text-green-700">{entry.prompt}</p>
                </div>
              )}

              <div className="mb-4">
                <h2 className="font-semibold text-gray-900 mb-2">
                  Journal Entry:
                </h2>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: entry.html_content || entry.content,
                  }}
                />
              </div>

              {entry.followups?.map((fup, index) => (
                <div
                  key={index}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-gray-500">
                      {new Date(fup.created_at).toLocaleString()}
                    </p>
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                      Follow-up Response
                    </span>
                  </div>

                  {fup.prompt && (
                    <div className="bg-purple-50 border border-purple-200 rounded p-3 mb-3">
                      <p className="text-sm font-medium text-purple-800 mb-1">
                        Prompt:
                      </p>
                      <p className="text-purple-700">{fup.prompt}</p>
                    </div>
                  )}

                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: fup.html_content || fup.content,
                    }}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t">
        <button
          disabled={page <= 1}
          onClick={() => setSearchParams({ page: page - 1 })}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <span className="text-gray-600">Page {page}</span>

        <button
          onClick={() => setSearchParams({ page: page + 1 })}
          disabled={entries.length === 0}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
