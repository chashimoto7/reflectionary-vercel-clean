// src/components/history/tabs/AudioPlaybackTab.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  RotateCcw,
  Settings,
  Download,
  Headphones,
  Mic,
  Music,
  FileAudio,
  Clock,
  Star,
  Pin,
  Filter,
  Search,
  Eye,
} from "lucide-react";

const AudioPlaybackTab = ({ entries, colors }) => {
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all"); // all, starred, pinned, hasAudio
  const [sortBy, setSortBy] = useState("date"); // date, duration, title

  // Text-to-speech settings
  const [voiceSettings, setVoiceSettings] = useState({
    voice: null,
    rate: 1,
    pitch: 1,
    volume: 0.8,
  });

  const audioRef = useRef(null);
  const speechRef = useRef(null);
  const [availableVoices, setAvailableVoices] = useState([]);

  useEffect(() => {
    // Load available voices for text-to-speech
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      setAvailableVoices(voices);
      if (voices.length > 0 && !voiceSettings.voice) {
        setVoiceSettings((prev) => ({ ...prev, voice: voices[0] }));
      }
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (speechRef.current) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  // Filter and sort entries
  const filteredEntries = entries
    .filter((entry) => {
      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesContent = entry.decryptedContent
          ?.toLowerCase()
          .includes(query);
        const matchesPrompt = entry.decryptedPrompt
          ?.toLowerCase()
          .includes(query);
        if (!matchesContent && !matchesPrompt) return false;
      }

      // Filter by type
      switch (filterBy) {
        case "starred":
          return entry.starred;
        case "pinned":
          return entry.pinned;
        case "hasAudio":
          return entry.audio_file_url; // Assuming you have audio files
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "title":
          return (
            a.decryptedPrompt || a.decryptedContent.substring(0, 50)
          ).localeCompare(
            b.decryptedPrompt || b.decryptedContent.substring(0, 50)
          );
        case "duration":
          return (
            (b.decryptedContent?.length || 0) -
            (a.decryptedContent?.length || 0)
          );
        default: // date
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

  const playTextToSpeech = (text) => {
    if (speechRef.current) {
      speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voiceSettings.voice;
    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;
    utterance.volume = voiceSettings.volume;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    speechRef.current = utterance;
    speechSynthesis.speak(utterance);
  };

  const pauseTextToSpeech = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.pause();
      setIsPlaying(false);
    }
  };

  const resumeTextToSpeech = () => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
      setIsPlaying(true);
    }
  };

  const stopTextToSpeech = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const handlePlayPause = (entry) => {
    if (selectedEntry?.id !== entry.id) {
      setSelectedEntry(entry);
      stopTextToSpeech();

      // Combine prompt and content for playback
      const textToSpeak = [
        entry.decryptedPrompt && `Prompt: ${entry.decryptedPrompt}`,
        `Entry: ${entry.decryptedContent}`,
        ...(entry.decryptedFollowUps || []).map(
          (fu, index) =>
            `Follow-up ${index + 1}: ${fu.decryptedQuestion} ${
              fu.decryptedResponse
            }`
        ),
      ]
        .filter(Boolean)
        .join(". ");

      playTextToSpeech(textToSpeak);
    } else {
      if (isPlaying) {
        pauseTextToSpeech();
      } else {
        resumeTextToSpeech();
      }
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const estimateReadingTime = (text) => {
    // Estimate reading time at average speech rate
    const wordsPerMinute = 150 * voiceSettings.rate;
    const words = text?.split(" ").length || 0;
    return Math.ceil((words / wordsPerMinute) * 60); // seconds
  };

  const EntryCard = ({ entry }) => {
    const isCurrentlyPlaying = selectedEntry?.id === entry.id && isPlaying;
    const isSelected = selectedEntry?.id === entry.id;

    const fullText = [
      entry.decryptedPrompt,
      entry.decryptedContent,
      ...(entry.decryptedFollowUps || []).map(
        (fu) => `${fu.decryptedQuestion} ${fu.decryptedResponse}`
      ),
    ]
      .filter(Boolean)
      .join(" ");

    const estimatedDuration = estimateReadingTime(fullText);

    return (
      <div
        className={`bg-white border rounded-lg p-4 transition ${
          isSelected
            ? "border-purple-500 bg-purple-50"
            : "border-gray-200 hover:border-purple-300"
        }`}
      >
        <div className="flex items-start gap-4">
          {/* Play/Pause Button */}
          <button
            onClick={() => handlePlayPause(entry)}
            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition ${
              isCurrentlyPlaying
                ? "bg-purple-600 text-white"
                : "bg-purple-100 text-purple-600 hover:bg-purple-200"
            }`}
          >
            {isCurrentlyPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </button>

          {/* Entry Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-500">
                {new Date(entry.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div className="flex items-center gap-2">
                {entry.starred && <Star className="h-4 w-4 text-yellow-500" />}
                {entry.pinned && <Pin className="h-4 w-4 text-blue-500" />}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {formatDuration(estimatedDuration)}
                </div>
              </div>
            </div>

            {/* Prompt */}
            {entry.decryptedPrompt && (
              <p className="text-sm text-purple-600 italic mb-2 line-clamp-2">
                {entry.decryptedPrompt}
              </p>
            )}

            {/* Content Preview */}
            <p className="text-sm text-gray-700 line-clamp-3 mb-2">
              {entry.decryptedContent}
            </p>

            {/* Metadata */}
            <div className="flex items-center justify-between">
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
                {entry.decryptedFollowUps &&
                  entry.decryptedFollowUps.length > 0 && (
                    <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded">
                      +{entry.decryptedFollowUps.length} follow-ups
                    </span>
                  )}
              </div>

              <div className="flex items-center gap-1">
                <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                  <Eye className="h-4 w-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar for currently playing */}
        {isSelected && (
          <div className="mt-4 w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-purple-500 h-1 rounded-full transition-all"
              style={{ width: `${(currentTime / estimatedDuration) * 100}%` }}
            />
          </div>
        )}
      </div>
    );
  };

  const VoiceControls = () => (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Voice Settings</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Voice Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Voice
          </label>
          <select
            value={availableVoices.findIndex((v) => v === voiceSettings.voice)}
            onChange={(e) =>
              setVoiceSettings((prev) => ({
                ...prev,
                voice: availableVoices[parseInt(e.target.value)],
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {availableVoices.map((voice, index) => (
              <option key={index} value={index}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </div>

        {/* Rate */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Speed: {voiceSettings.rate}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={voiceSettings.rate}
            onChange={(e) =>
              setVoiceSettings((prev) => ({
                ...prev,
                rate: parseFloat(e.target.value),
              }))
            }
            className="w-full"
          />
        </div>

        {/* Pitch */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pitch: {voiceSettings.pitch}
          </label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={voiceSettings.pitch}
            onChange={(e) =>
              setVoiceSettings((prev) => ({
                ...prev,
                pitch: parseFloat(e.target.value),
              }))
            }
            className="w-full"
          />
        </div>

        {/* Volume */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Volume: {Math.round(voiceSettings.volume * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={voiceSettings.volume}
            onChange={(e) =>
              setVoiceSettings((prev) => ({
                ...prev,
                volume: parseFloat(e.target.value),
              }))
            }
            className="w-full"
          />
        </div>
      </div>

      {/* Test Voice */}
      <div className="mt-4">
        <button
          onClick={() =>
            playTextToSpeech(
              "This is a test of the voice settings. How does it sound?"
            )
          }
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
        >
          Test Voice
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audio Features</h2>
          <p className="text-gray-600 mt-1">
            Listen to your journal entries with text-to-speech
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Headphones className="h-5 w-5 text-purple-600" />
          <span className="text-sm text-gray-600">
            {filteredEntries.length} entries available
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search and Filters */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search entries for audio playback..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Entries</option>
              <option value="starred">Starred Only</option>
              <option value="pinned">Pinned Only</option>
              <option value="hasAudio">With Audio Files</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="date">Sort by Date</option>
              <option value="title">Sort by Title</option>
              <option value="duration">Sort by Length</option>
            </select>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(
                  filteredEntries.reduce((total, entry) => {
                    const fullText = [
                      entry.decryptedPrompt,
                      entry.decryptedContent,
                      ...(entry.decryptedFollowUps || []).map(
                        (fu) =>
                          `${fu.decryptedQuestion} ${fu.decryptedResponse}`
                      ),
                    ]
                      .filter(Boolean)
                      .join(" ");
                    return total + estimateReadingTime(fullText);
                  }, 0) / 60
                )}
              </div>
              <div className="text-sm text-gray-600">Total Minutes</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredEntries
                  .reduce(
                    (total, entry) =>
                      total + (entry.decryptedContent?.split(" ").length || 0),
                    0
                  )
                  .toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Words</div>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Settings */}
      <VoiceControls />

      {/* Current Playing Entry */}
      {selectedEntry && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Now Playing</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => stopTextToSpeech()}
                className="p-2 text-gray-600 hover:text-gray-800 rounded"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 text-gray-600 hover:text-gray-800 rounded"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => handlePlayPause(selectedEntry)}
              className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center hover:bg-purple-700 transition"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </button>

            <div className="flex-1">
              <p className="font-medium text-gray-900 mb-1">
                {selectedEntry.decryptedPrompt ||
                  selectedEntry.decryptedContent.substring(0, 50) + "..."}
              </p>
              <p className="text-sm text-gray-600">
                {new Date(selectedEntry.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Entries List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Journal Entries ({filteredEntries.length})
        </h3>

        {filteredEntries.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FileAudio className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No entries found
            </h3>
            <p className="text-gray-600">
              Adjust your search or filters to find entries for audio playback.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioPlaybackTab;
