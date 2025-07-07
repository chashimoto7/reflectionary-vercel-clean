// frontend/ src/components/AudioButton.jsx
import React from "react";
import { Volume2 } from "lucide-react";

const AudioButton = ({ onClick, size = "small", className = "" }) => {
  const sizeClasses = {
    small: "h-4 w-4",
    medium: "h-5 w-5",
    large: "h-6 w-6",
  };

  const buttonClasses = {
    small: "p-1.5",
    medium: "p-2",
    large: "p-2.5",
  };

  return (
    <button
      onClick={onClick}
      className={`${buttonClasses[size]} text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/20 rounded transition-colors ${className}`}
      title="Listen to entry"
    >
      <Volume2 className={sizeClasses[size]} />
    </button>
  );
};

export default AudioButton;
