import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSecurity } from "../contexts/SecurityContext";
import encryptionService from "../services/encryptionService";

export default function History() {
  const { user, loading: authLoading } = useAuth();
  const { isLocked, masterKey } = useSecurity();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);

  const decryptEntry = async (rawEntry, key) => {
    const dataKey = await encryptionService.decryptKey(
      {
        encryptedData: rawEntry.encrypted_data_key,
        iv: rawEntry.data_key_iv,
      },
      key
    );

    const decryptedContent = await encryptionService.decryptText(
      rawEntry.encrypted_content,
      rawEntry.content_iv,
      dataKey
    );

    let decryptedPrompt = null;
    if (rawEntry.encrypted_prompt && rawEntry.prompt_iv) {
      decryptedPrompt = await encryptionService.decryptText(
        rawEntry.encrypted_prompt,
        rawEntry.prompt_iv,
        dataKey
      );
    }

    return {
      ...rawEntry,
      content: decryptedContent,
      html_content: decryptedContent,
      prompt: decryptedPrompt,
    };
  };

  const buildThreadTree = (entries, parentId) => {
    return entries
      .filter((e) => e.parent_entry_id === parentId)
      .map((e) => ({
        ...e,
        follow_ups: buildThreadTree(entries, e.id),
      }));
  };

  const fetchEntries = async () => {
    if (!user?.id || isLocked) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `https://reflectionary-api.vercel.app/api/threads?user_id=${encodeURIComponent(
          user.id
        )}&page=${page}`
      );
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      const key = masterKey || (await encryptionService.getStaticMasterKey());
      const decryptedParent = await decryptEntry(data.parent, key);
      const decryptedEntries = await Promise.all(
        data.entries.map((e) => decryptEntry(e, key))
      );

      decryptedParent.follow_ups = buildThreadTree(
        decryptedEntries,
        decryptedParent.id
      );
      setEntry(decryptedParent);
    } catch (err) {
      setError(`Failed to load journal entry: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.id && !isLocked) fetchEntries();
  }, [page, authLoading, user?.id, isLocked]);

  const renderFollowUps = (followUps, level = 1) => {
    return followUps.map((f) => (
      <div
        key={f.id}
        className={`pl-${
          level * 4
        } mt-4 border-l-2 border-gray-200 ml-2 space-y-2`}
      >
        <p className="text-sm text-gray-500">
          {new Date(f.created_at).toLocaleString()}
        </p>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Follow-up response
        </p>
        {f.prompt && (
          <p className="text-base text-purple-600 italic mb-1">
            Prompt: {f.prompt}
          </p>
        )}
        <div
          dangerouslySetInnerHTML={{
            __html: f.html_content || `<p>${f.content}</p>`,
          }}
        />
        {f.follow_ups?.length > 0 && renderFollowUps(f.follow_ups, level + 1)}
      </div>
    ));
  };

  const handleNext = () => setSearchParams({ page: page + 1 });
  const handlePrevious = () => setSearchParams({ page: Math.max(1, page - 1) });

  if (loading) return <div className="p-4">Loading journal history...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div className="text-2xl font-bold text-indigo-700 tracking-tight">
          Reflectionary
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handlePrevious}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Previous Entry
        </button>

        <div className="flex flex-col items-center">
          <span className="text-gray-500 mb-1">Page {page}</span>
          <button
            onClick={() => setSearchParams({ page: 1 })}
            className="text-sm text-blue-600 underline hover:text-blue-800"
          >
            Start Over
          </button>
        </div>

        <button
          onClick={handleNext}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Next Entry
        </button>
      </div>

      {!entry ? (
        <p>No journal entry found for this page.</p>
      ) : (
        <div className="border p-6 rounded-2xl shadow-md bg-white space-y-4">
          <p className="text-sm text-gray-500">
            {new Date(entry.created_at).toLocaleString()}
          </p>
          {entry.prompt && (
            <p className="text-base text-purple-600 italic mb-1">
              Prompt: {entry.prompt}
            </p>
          )}
          <p className="font-semibold">Journal Entry:</p>
          <div
            className="text-base leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: entry.html_content || `<p>${entry.content}</p>`,
            }}
          />

          {entry.follow_ups?.length > 0 && renderFollowUps(entry.follow_ups)}

          <div className="mt-6 text-right">
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Next Entry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
