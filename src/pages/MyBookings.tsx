// src/pages/MyBookings.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookings } from '../hooks/useBookings';
import { formatDate } from '../utils/date';

const MyBookings: React.FC = () => {
  const { bookings, loading, cancel } = useBookings();
  const nav = useNavigate();

  if (loading) return <Skeleton />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* <GlassHeader /> */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 mb-10">
          My Tickets
        </h1>

        {bookings.length === 0 ? (
          <p className="text-gray-400">No bookings yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map(b => (
              <div
                key={b.id}
                className={`bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10 shadow-lg flex flex-col justify-between ${
                  b.eventDeleted ? 'opacity-75 border-red-500/30' : ''
                }`}
              >
                <div>
                  <p className="text-lg font-bold mb-1">
                    {b.event_name} 
                    {b.eventDeleted && (
                      <span className="text-red-400 text-sm ml-2">(Deleted)</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-300">{b.tickets} ticket(s)</p>
                  {!b.eventDeleted && (
                    <p className="text-sm text-gray-400 mt-2">
                      {b.location}
                    </p>
                  )}
                  <p className="text-sm text-gray-400 mt-2">
                    {b.userName} · {formatDate(b.date!)}
                  </p>
                  <p className={`text-sm mt-3 ${b.status === 'Confirmed' ? 'text-green-400' : 'text-red-400'}`}>
                    {b.status}
                    {b.eventDeleted && b.status === 'Confirmed' && (
                      <span className="text-yellow-400 block text-xs mt-1">
                        Event no longer available
                      </span>
                    )}
                  </p>
                </div>

                {b.status === 'Confirmed' && !b.eventDeleted && (
                  <button
                    onClick={() => cancel(b.id)}
                    className="mt-4 ml-auto px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white text-sm font-semibold transition"
                  >
                    Cancel
                  </button>
                )}
                {b.eventDeleted && (
                  <div className="mt-4 text-xs text-yellow-400">
                    This event has been removed by the organizer
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

/* ----------  reused pieces  ---------- */
const GlassHeader: React.FC = () => (
  <header className="sticky top-0 z-10 bg-black/30 backdrop-blur-lg border-b border-white/10">
    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">Eventify</span>
      <nav className="flex gap-6 text-sm text-gray-300">
        <button onClick={() => window.history.back()} className="hover:text-white transition">← Back</button>
      </nav>
    </div>
  </header>
);

const Skeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
  </div>
);

export default MyBookings;