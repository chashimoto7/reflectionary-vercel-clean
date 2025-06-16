// src/components/history/tabs/FoldersTab.jsx
import React, { useState } from "react";
import {
  FolderOpen,
  Folder,
  Plus,
  Edit3,
  Trash2,
  X,
  Search,
  Calendar,
  FileText,
  Star,
  Pin,
  Eye,
  MoreHorizontal,
  Archive,
  Download,
  Share2,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import encryptionService from "../../../services/encryptionService";
import { useAuth } from "../../../contexts/AuthContext";

const FoldersTab = ({ entries, folders, colors, onRefresh }) => {
  const { user } = useAuth();
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Get entries for each folder
  const getFolderStats = (folderId) => {
    const folderEntries = entries.filter(
      (entry) => entry.folder_id === folderId
    );
    const totalWords = folderEntries.reduce(
      (total, entry) =>
        total + (entry.decryptedContent?.split(" ").length || 0),
      0
    );
    const starredCount = folderEntries.filter((e) => e.starred).length;
    const pinnedCount = folderEntries.filter((e) => e.pinned).length;

    return {
      entryCount: folderEntries.length,
      totalWords,
      starredCount,
      pinnedCount,
      lastEntry: folderEntries.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      )[0],
    };
  };

  // Get unorganized entries (no folder)
  const unorganizedEntries = entries.filter((entry) => !entry.folder_id);

  const createFolder = async () => {
    if (!newFolderName.trim()) return;

    setLoading(true);
    try {
      const encryptedName = await encryptionService.encrypt(newFolderName);
      const encryptedDescription = newFolderDescription.trim()
        ? await encryptionService.encrypt(newFolderDescription)
        : null;

      const { error } = await supabase.from("journal_folders").insert({
        user_id: user.id,
        name: encryptedName,
        description: encryptedDescription,
        color: colors.primary,
      });

      if (error) throw error;

      setNewFolderName("");
      setNewFolderDescription("");
      setShowCreateModal(false);
      onRefresh && onRefresh();
    } catch (error) {
      console.error("Error creating folder:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateFolder = async () => {
    if (!editingFolder || !newFolderName.trim()) return;

    setLoading(true);
    try {
      const encryptedName = await encryptionService.encrypt(newFolderName);
      const encryptedDescription = newFolderDescription.trim()
        ? await encryptionService.encrypt(newFolderDescription)
        : null;

      const { error } = await supabase
        .from("journal_folders")
        .update({
          name: encryptedName,
          description: encryptedDescription,
        })
        .eq("id", editingFolder.id);

      if (error) throw error;

      setEditingFolder(null);
      setNewFolderName("");
      setNewFolderDescription("");
      setShowEditModal(false);
      onRefresh && onRefresh();
    } catch (error) {
      console.error("Error updating folder:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteFolder = async (folderId) => {
    if (
      !confirm(
        "Are you sure you want to delete this folder? Entries will not be deleted, just unorganized."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      // First, remove folder assignment from entries
      await supabase
        .from("journal_entries")
        .update({ folder_id: null })
        .eq("folder_id", folderId);

      // Then delete the folder
      const { error } = await supabase
        .from("journal_folders")
        .delete()
        .eq("id", folderId);

      if (error) throw error;
      onRefresh && onRefresh();
    } catch (error) {
      console.error("Error deleting folder:", error);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (folder) => {
    setEditingFolder(folder);
    setNewFolderName(folder.decryptedName);
    setNewFolderDescription(folder.decryptedDescription || "");
    setShowEditModal(true);
  };

  const FolderCard = ({ folder, stats }) => (
    <div
      className={`bg-white border-2 rounded-xl p-6 transition cursor-pointer ${
        selectedFolder?.id === folder.id
          ? "border-purple-500 bg-purple-50"
          : "border-gray-200 hover:border-purple-300"
      }`}
      onClick={() =>
        setSelectedFolder(selectedFolder?.id === folder.id ? null : folder)
      }
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 rounded-lg">
            <FolderOpen className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {folder.decryptedName}
            </h3>
            {folder.decryptedDescription && (
              <p className="text-sm text-gray-600 mt-1">
                {folder.decryptedDescription}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(folder);
            }}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteFolder(folder.id);
            }}
            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">
            {stats.entryCount}
          </div>
          <div className="text-xs text-gray-600">Entries</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">
            {stats.totalWords > 999
              ? `${(stats.totalWords / 1000).toFixed(1)}k`
              : stats.totalWords}
          </div>
          <div className="text-xs text-gray-600">Words</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {stats.starredCount > 0 && (
            <span className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
              <Star className="h-3 w-3" />
              {stats.starredCount}
            </span>
          )}
          {stats.pinnedCount > 0 && (
            <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              <Pin className="h-3 w-3" />
              {stats.pinnedCount}
            </span>
          )}
        </div>

        {stats.lastEntry && (
          <span className="text-xs text-gray-500">
            {new Date(stats.lastEntry.created_at).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );

  const UnorganizedCard = () => {
    const stats = {
      entryCount: unorganizedEntries.length,
      totalWords: unorganizedEntries.reduce(
        (total, entry) =>
          total + (entry.decryptedContent?.split(" ").length || 0),
        0
      ),
      starredCount: unorganizedEntries.filter((e) => e.starred).length,
      pinnedCount: unorganizedEntries.filter((e) => e.pinned).length,
    };

    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gray-200 rounded-lg">
            <Archive className="h-6 w-6 text-gray-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Unorganized Entries</h3>
            <p className="text-sm text-gray-600">
              Entries not assigned to any folder
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-white rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {stats.entryCount}
            </div>
            <div className="text-xs text-gray-600">Entries</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalWords > 999
                ? `${(stats.totalWords / 1000).toFixed(1)}k`
                : stats.totalWords}
            </div>
            <div className="text-xs text-gray-600">Words</div>
          </div>
        </div>

        {stats.entryCount > 0 && (
          <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
            Organize These Entries
          </button>
        )}
      </div>
    );
  };

  const CreateFolderModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Create New Folder
          </h3>
          <button
            onClick={() => setShowCreateModal(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Folder Name
            </label>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="e.g., Personal Growth, Work Reflections"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              value={newFolderDescription}
              onChange={(e) => setNewFolderDescription(e.target.value)}
              placeholder="Describe what kind of entries belong in this folder"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={() => setShowCreateModal(false)}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={createFolder}
            disabled={!newFolderName.trim() || loading}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
          >
            {loading ? "Creating..." : "Create Folder"}
          </button>
        </div>
      </div>
    </div>
  );

  const EditFolderModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Edit Folder</h3>
          <button
            onClick={() => setShowEditModal(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Folder Name
            </label>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              value={newFolderDescription}
              onChange={(e) => setNewFolderDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={() => setShowEditModal(false)}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={updateFolder}
            disabled={!newFolderName.trim() || loading}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );

  const FolderEntries = ({ folder }) => {
    const folderEntries = entries
      .filter((entry) => entry.folder_id === folder.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return (
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900">
            Entries in "{folder.decryptedName}"
          </h4>
          <div className="text-sm text-gray-500">
            {folderEntries.length} entries
          </div>
        </div>

        <div className="space-y-3">
          {folderEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">
                  {new Date(entry.created_at).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  {entry.starred && (
                    <Star className="h-4 w-4 text-yellow-500" />
                  )}
                  {entry.pinned && <Pin className="h-4 w-4 text-blue-500" />}
                  <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {entry.decryptedPrompt && (
                <p className="text-sm text-purple-600 italic mb-2">
                  {entry.decryptedPrompt.length > 100
                    ? `${entry.decryptedPrompt.substring(0, 100)}...`
                    : entry.decryptedPrompt}
                </p>
              )}

              <p className="text-sm text-gray-700 line-clamp-2">
                {entry.decryptedContent.length > 150
                  ? `${entry.decryptedContent.substring(0, 150)}...`
                  : entry.decryptedContent}
              </p>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  {entry.mood && (
                    <span className="text-xs px-2 py-1 bg-pink-100 text-pink-700 rounded">
                      {entry.mood}
                    </span>
                  )}
                  {entry.theme && (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {entry.theme}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {entry.decryptedContent.split(" ").length} words
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Folder Organization
          </h2>
          <p className="text-gray-600 mt-1">
            Organize your journal entries into meaningful collections
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          <Plus className="h-4 w-4" />
          New Folder
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search folders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Folders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Unorganized entries */}
        {unorganizedEntries.length > 0 && <UnorganizedCard />}

        {/* Folders */}
        {folders
          .filter(
            (folder) =>
              !searchQuery ||
              folder.decryptedName
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              folder.decryptedDescription
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase())
          )
          .map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              stats={getFolderStats(folder.id)}
            />
          ))}
      </div>

      {/* Folder entries view */}
      {selectedFolder && <FolderEntries folder={selectedFolder} />}

      {/* Modals */}
      {showCreateModal && <CreateFolderModal />}
      {showEditModal && <EditFolderModal />}
    </div>
  );
};

export default FoldersTab;
