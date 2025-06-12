// src/pages/Welcome.jsx
import React from "react";
import logo from "../assets/ReflectionaryLogoWelcome.png";

const QUOTES = [
  {
    text: "The unexamined life is not worth living.",
    author: "Socrates",
  },
  {
    text: "You don’t have to control your thoughts. You just have to stop letting them control you.",
    author: "Dan Millman",
  },
  {
    text: "Journaling is like whispering to one’s self and listening at the same time.",
    author: "Mina Murray",
  },
  {
    text: "Sometimes the most productive thing you can do is relax.",
    author: "Mark Black",
  },
  {
    text: "Feelings are much like waves. We can't stop them from coming but we can choose which ones to surf.",
    author: "Jonatan Mårtensson",
  },
  {
    text: "Your present circumstances don’t determine where you can go; they merely determine where you start.",
    author: "Nido Qubein",
  },
  {
    text: "The act of writing is the act of discovering what you believe.",
    author: "David Hare",
  },
  {
    text: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.",
    author: "Ralph Waldo Emerson",
  },
];

function getRandomQuote(excludeIndex) {
  let idx;
  do {
    idx = Math.floor(Math.random() * QUOTES.length);
  } while (idx === excludeIndex);
  return { ...QUOTES[idx], idx };
}

export default function Welcome() {
  const [quote, setQuote] = React.useState(() => getRandomQuote(-1));

  // Auto-rotate quote every 15 seconds (15000ms)
  React.useEffect(() => {
    const interval = setInterval(() => {
      setQuote((q) => getRandomQuote(q.idx));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-purple-50 to-purple-100 relative">
      {/* Logo floating on top of the white box */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <img
          src={logo}
          alt="Reflectionary logo"
          className="mx-auto w-24 h-24 md:w-32 md:h-32 shadow-lg rounded-full bg-white p-2"
          style={{
            border: "5px solid white",
          }}
        />
      </div>
      <div className="max-w-2xl bg-white rounded-xl shadow-lg p-8 pt-20 mt-12 relative z-0">
        <h1 className="text-4xl md:text-5xl font-extrabold text-purple-700 mb-2 mt-2">
          Welcome to Reflectionary
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-4">
          Say what you feel. Discover what it means.
        </p>
        {/* QUOTE BLOCK */}
        <div className="mb-6 mt-8">
          <blockquote className="italic text-xl text-gray-700 transition-opacity duration-500 ease-in-out">
            “{quote.text}”
          </blockquote>
          <div className="mt-2 text-purple-500 font-semibold">
            — {quote.author}
          </div>
        </div>
        <hr className="my-6" />
        {/* Announcements/Updates */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Reflectionary Updates</h2>
          <ul className="text-gray-600 text-left list-disc list-inside">
            <li>New analytics features coming soon!</li>
            <li>Stay tuned for Deep Dive modules this fall.</li>
            <li>Have feedback? Share it in app settings!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
