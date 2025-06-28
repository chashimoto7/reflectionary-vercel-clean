// src/components/history/tabs/FoldersTab.jsx
import React, { useState } from "react";
import AudioButton from "../../AudioButton";
import AudioPlayer from "../../AudioPlayer";
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
  const [audioEntry, setAudioEntry] = useState(null);

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

      const { error } = await supabase.from("folders").insert({
        user_id: user.id,
        name: encryptedName,
        description: encryptedDescription,
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
        .from("folders")
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
        "Are you sure you want to delete this folder? Entries will be kept but unorganized."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("folders")
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

  const FolderCard = ({ folder, stats }) => (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:border-purple-500/50 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-600/20 rounded-lg">
            <Folder className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{folder.decryptedName}</h3>
            {folder.decryptedDescription && (
              <p className="text-sm text-gray-400 mt-1">
                {folder.decryptedDescription}
              </p>
            )}
          </div>
        </div>

        <div className="relative">
          <button className="text-gray-400 hover:text-white">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/5 p-3 rounded">
          <p className="text-xs text-gray-400">Entries</p>
          <p className="text-lg font-semibold text-white">{stats.entryCount}</p>
        </div>
        <div className="bg-white/5 p-3 rounded">
          <p className="text-xs text-gray-400">Total Words</p>
          <p className="text-lg font-semibold text-white">
            {stats.totalWords.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-gray-400">
          {stats.starredCount > 0 && (
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-400" />
              {stats.starredCount}
            </span>
          )}
          {stats.pinnedCount > 0 && (
            <span className="flex items-center gap-1">
              <Pin className="h-3 w-3 text-blue-400" />
              {stats.pinnedCount}
            </span>
          )}
        </div>

        <button
          onClick={() => setSelectedFolder(folder)}
          className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
        >
          <Eye className="h-3 w-3" />
          View
        </button>
      </div>

      {stats.lastEntry && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-xs text-gray-400">
            Last entry:{" "}
            <span className="text-gray-300">
              {new Date(stats.lastEntry.created_at).toLocaleDateString()}
            </span>
          </p>
        </div>
      )}
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
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:border-gray-500/50 transition-all">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gray-600/20 rounded-lg">
              <Archive className="h-6 w-6 text-gray-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Unorganized</h3>
              <p className="text-sm text-gray-400 mt-1">
                Entries without a folder
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/5 p-3 rounded">
            <p className="text-xs text-gray-400">Entries</p>
            <p className="text-lg font-semibold text-white">
              {stats.entryCount}
            </p>
          </div>
          <div className="bg-white/5 p-3 rounded">
            <p className="text-xs text-gray-400">Total Words</p>
            <p className="text-lg font-semibold text-white">
              {stats.totalWords.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const FolderEntries = ({ folder }) => {
    const folderEntries = entries.filter(
      (entry) => entry.folder_id === folder.id
    );

    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            Entries in "{folder.decryptedName}"
          </h3>
          <button
            onClick={() => setSelectedFolder(null)}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {folderEntries.map((entry) => (
            <div
              key={entry.id}
              className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-300">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                    {entry.starred && (
                      <Star className="h-3 w-3 text-yellow-400" />
                    )}
                    {entry.pinned && <Pin className="h-3 w-3 text-blue-400" />}
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {entry.decryptedContent}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <AudioButton
                    onClick={() => setAudioEntry(entry)}
                    size="small"
                  />
                  <button className="text-xs text-purple-400 hover:text-purple-300">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const CreateFolderModal = () => (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={() => setShowCreateModal(false)}
    >
      <div
        className="bg-slate-800 border border-white/20 rounded-lg p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold text-white mb-4">
          Create New Folder
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Folder Name
            </label>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Enter folder name..."
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={newFolderDescription}
              onChange={(e) => setNewFolderDescription(e.target.value)}
              placeholder="What will you store in this folder?"
              rows={3}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={() => setShowCreateModal(false)}
            className="px-4 py-2 text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={createFolder}
            disabled={!newFolderName.trim() || loading}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Creating..." : "Create Folder"}
          </button>
        </div>
      </div>
    </div>
  );

  const EditFolderModal = () => (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={() => setShowEditModal(false)}
    >
      <div
        className="bg-slate-800 border border-white/20 rounded-lg p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold text-white mb-4">Edit Folder</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Folder Name
            </label>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Enter folder name..."
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={newFolderDescription}
              onChange={(e) => setNewFolderDescription(e.target.value)}
              placeholder="What will you store in this folder?"
              rows={3}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => deleteFolder(editingFolder.id)}
            className="px-4 py-2 text-red-400 hover:text-red-300"
          >
            Delete Folder
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={updateFolder}
              disabled={!newFolderName.trim() || loading}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Folders & Organization
          </h2>
          <p className="text-gray-400 mt-1">
            Organize your entries into folders for easy access
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
          className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
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

      {/* Empty State */}
      {folders.length === 0 && unorganizedEntries.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">
            No folders yet
          </h3>
          <p className="text-gray-500">
            Create your first folder to start organizing your entries
          </p>
        </div>
      )}

      {/* Folder entries view */}
      {selectedFolder && <FolderEntries folder={selectedFolder} />}

      {/* Modals */}
      {showCreateModal && <CreateFolderModal />}
      {showEditModal && <EditFolderModal />}
    </div>
  );
};
{
  audioEntry && (
    <AudioPlayer
      entry={audioEntry}
      onClose={() => setAudioEntry(null)}
      position="bottom-right"
    />
  );
}

export default FoldersTab;
