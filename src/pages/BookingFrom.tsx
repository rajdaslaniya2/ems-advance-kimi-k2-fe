// src/pages/BookingForm.tsx  (whole file)
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { getTokenPayload } from '../utils/jwt';
import { Event } from '../types';
import { formatDate } from '../utils/date';

const BookingForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const payload = getTokenPayload();

  const [event, setEvent] = useState<Event | null>(null);
  const [form, setForm] = useState({
    userName: payload.name || '',
    userEmail: payload.email || '',
    tickets: 1,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      api.getEvent(id)
        .then(setEvent)
        .catch(() => setError('Event not found'));
    }
  }, [id]);

  if (!event) return <Skeleton />;

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (!id) throw new Error('Event ID is missing');
      await api.createBooking(id, {
        userName: form.userName,
        userEmail: form.userEmail,
        tickets: form.tickets,
      });
      nav('/my-bookings');
    } catch (err: any) {
      let errorMessage = 'Booking failed';
      
      // Handle validation errors with specific messages
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const validationErrors = err.response.data.errors;
        if (validationErrors.length > 0) {
          errorMessage = validationErrors[0].msg;
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response?.data?.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response?.data?.error;
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">

      <main className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-start">
        {/*  LEFT – event card  */}
        <div className="sticky top-24">
          <div className="relative bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10 shadow-lg overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity" />
            <div className="relative z-10">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-2xl mb-4">
                {event.name.slice(0, 2).toUpperCase()}
              </div>
              <h2 className="text-2xl font-bold mb-2">{event.name}</h2>
              <p className="text-sm text-gray-300">{formatDate(event.date)} · {event.location}</p>
              <p className="text-sm mt-3 text-green-400">{event.available_seats} seats left</p>
              <Link to="/" className="inline-flex items-center gap-2 text-xs text-purple-300 hover:text-white transition mt-4">
                ← Back to events
              </Link>
            </div>
          </div>
        </div>

        {/*  RIGHT – form  */}
        <div className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10 shadow-lg">
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 mb-6">
            Reserve Tickets
          </h1>

          <form onSubmit={handle} className="space-y-5">
            <Input label="Your name" value={form.userName} onChange={(v) => setForm({ ...form, userName: v })} required />
            <Input label="Email" type="email" value={form.userEmail} onChange={(v) => setForm({ ...form, userEmail: v })} required />
            <Input label="Tickets" type="number" min={1} max={event.available_seats} value={form.tickets} onChange={(v) => setForm({ ...form, tickets: Math.min(Number(v), event.available_seats) })} required />

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={submitting || event.available_seats === 0}
              className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Reserving…' : 'Confirm Reservation'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

/* ----------  sub-components  ---------- */
const GlassHeader: React.FC = () => (
  <header className="sticky top-0 z-10 bg-black/30 backdrop-blur-lg border-b border-white/10">
    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">Eventify</Link>
    </div>
  </header>
);

const Input: React.FC<{ label: string; value: string | number; type?: string; min?: number; max?: number; required?: boolean; onChange: (v: string) => void }> =
  ({ label, value, type = 'text', min, max, required, onChange }) => (
    <div>
      <label className="block text-sm font-medium mb-2 text-gray-300">{label}</label>
      <input
        type={type}
        min={min}
        max={max}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
      />
    </div>
  );

const Skeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
  </div>
);

export default BookingForm;