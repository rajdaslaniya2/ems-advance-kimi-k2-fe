// src/pages/EventList.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useEvents } from "../hooks/useEvents";
import { formatDate } from "../utils/date";

const EventList: React.FC = () => {
  const { events, loading, error } = useEvents();
  const nav = useNavigate();

  if (loading) return <Skeleton />;
  if (error) return <ErrorState msg={error} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* <GlassHeader /> */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 mb-10">
          Upcoming Events
        </h1>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <div
              key={e.id}
              className="group relative bg-white/5 backdrop-blur rounded-2xl overflow-hidden shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="h-48 w-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
                <span className="text-5xl font-black tracking-tight text-white/90">
                  {e.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold mb-2">{e.name}</h3>
                <p className="text-sm text-gray-300">
                  {formatDate(e.date)} · {e.location}
                </p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-green-400 font-medium">
                    {e.available_seats} seats left
                  </span>
                  <button
                    onClick={() => nav(`/book/${e.id}`)}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm font-semibold transition"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

/* ----------  sub-components  ---------- */
const GlassHeader: React.FC = () => (
  <header className="sticky top-0 z-10 bg-black/30 backdrop-blur-lg border-b border-white/10">
    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
        Eventify
      </span>
      <nav className="flex gap-6 text-sm text-gray-300">
        <a href="/" className="hover:text-white transition">
          Explore
        </a>
        <a href="/my-bookings" className="hover:text-white transition">
          My Tickets
        </a>
      </nav>
    </div>
  </header>
);

const Skeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
  </div>
);

const ErrorState: React.FC<{ msg?: string }> = ({ msg }) => (
  <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
    <p className="text-red-400">{msg || "Something went wrong"}</p>
  </div>
);

export default EventList;
