// src/pages/Welcome.jsx
import React from "react";
import logo from "../assets/reflectionary-square.png"; // Replace with transparent version when ready

export default function Welcome() {
  return (
    <div className="welcome-background min-h-screen flex items-center justify-center text-center px-4">
      <div className="max-w-2xl">
        <img
          src={logo}
          alt="Reflectionary logo"
          className="mx-auto mb-6 w-32 h-32 md:w-40 md:h-40"
        />
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
          Welcome back to Reflectionary
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-8">
          Say what you feel. Discover what it means.
        </p>
        <p className="text-md text-gray-600">
          Ready to reflect? Your journal is waiting when you are.
          <br />
          Use the sidebar to start a new entry or revisit your past reflections.
        </p>
      </div>
    </div>
  );
}
