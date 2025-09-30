// src/pages/BookingForm.tsx  (whole file)
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { getTokenPayload } from '../utils/jwt';
import { Event } from '../types';
import { formatDate } from '../utils/date';
import StripePayment from '../components/StripePayment';

const BookingForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const payload = getTokenPayload();

  const [event, setEvent] = useState<Event | null>(null);
  const [form, setForm] = useState({
    userName: payload.name || '',
    userEmail: payload.email || '',
    selectedSeats: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    if (id) {
      api.getEvent(id)
        .then(setEvent)
        .catch(() => setError('Event not found'));
    }
  }, [id]);

  const handleSeatClick = (seatId: string) => {
    if (!event) return;

    const seat = event.seating_layout.seats.find(s => s.id === seatId);
    const isBooked = event.seating_layout.booked_seats?.includes(seatId) || false;
    if (!seat || !seat.available || seat.tier === 'blocked' || isBooked) return;

    setForm(prev => ({
      ...prev,
      selectedSeats: prev.selectedSeats.includes(seatId)
        ? prev.selectedSeats.filter(id => id !== seatId)
        : [...prev.selectedSeats, seatId]
    }));
  };

  const getSeatPrice = (seatId: string) => {
    if (!event) return 0;
    const seat = event.seating_layout.seats.find(s => s.id === seatId);
    const isBooked = event.seating_layout.booked_seats?.includes(seatId) || false;
    if (!seat || isBooked) return 0;

    switch (seat.tier) {
      case 'platinum': return event.pricing.platinum.price;
      case 'gold': return event.pricing.gold.price;
      case 'silver': return event.pricing.silver.price;
      default: return 0;
    }
  };

  const getTotalPrice = () => {
    return form.selectedSeats.reduce((total, seatId) => total + getSeatPrice(seatId), 0);
  };

  if (!event) return <Skeleton />;

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!id) {
      setError('Event ID is missing');
      setSubmitting(false);
      return;
    }

    if (form.selectedSeats.length === 0) {
      setError('Please select at least one seat');
      setSubmitting(false);
      return;
    }

    setShowPayment(true);
  };

  const handlePaymentSuccess = async (bookingId: string) => {
    setSubmitting(false);
    nav('/my-bookings');
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
    setSubmitting(false);
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

          {!showPayment ? (
            <form onSubmit={handle} className="space-y-5">
              <Input label="Your name" value={form.userName} onChange={(v) => setForm({ ...form, userName: v })} required />
              <Input label="Email" type="email" value={form.userEmail} onChange={(v) => setForm({ ...form, userEmail: v })} required />

              {event.seating_layout.seats.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-300">Select Seats</h3>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="grid gap-1 overflow-auto max-h-96 bg-gray-800 p-2 rounded" style={{ gridTemplateColumns: `repeat(${event.seating_layout.columns}, 1fr)` }}>
                      {event.seating_layout.seats.map((seat) => (
                        <div
                          key={seat.id}
                          className={`p-2 text-xs text-center rounded transition-all min-w-0 ${
                            seat.tier === 'platinum' ? 'bg-blue-600 text-blue-100' :
                            seat.tier === 'gold' ? 'bg-yellow-600 text-yellow-100' :
                            seat.tier === 'silver' ? 'bg-gray-500 text-gray-100' :
                            'bg-red-800 text-red-100'
                          } ${
                            !seat.available || seat.tier === 'blocked' || (event.seating_layout.booked_seats?.includes(seat.id) || false) ? 'opacity-50 cursor-not-allowed' :
                            form.selectedSeats.includes(seat.id) ? 'ring-2 ring-white ring-offset-1 ring-offset-gray-800' :
                            'cursor-pointer hover:opacity-80 hover:scale-105'
                          }`}
                          onClick={() => handleSeatClick(seat.id)}
                          title={`Seat ${seat.row}-${seat.column} - ${seat.tier.toUpperCase()}${(event.seating_layout.booked_seats?.includes(seat.id) || false) ? ' (BOOKED)' : ` - ₹${getSeatPrice(seat.id)}`}`}
                        >
                          {seat.row}-{seat.column}
                          <div className="text-xxs mt-0.5 leading-none">
                            {seat.tier === 'blocked' ? '❌' :
                             (event.seating_layout.booked_seats?.includes(seat.id) || false) ? '🔒' :
                             seat.tier === 'platinum' ? '🥇' :
                             seat.tier === 'gold' ? '🥈' : '🥉'}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 grid grid-cols-4 gap-2 text-xs text-center">
                      <div className="bg-blue-600 text-blue-100 p-1 rounded">🥇 Platinum</div>
                      <div className="bg-yellow-600 text-yellow-100 p-1 rounded">🥈 Gold</div>
                      <div className="bg-gray-500 text-gray-100 p-1 rounded">🥉 Silver</div>
                      <div className="bg-red-800 text-red-100 p-1 rounded">🔒 Booked</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    Selected seats: {form.selectedSeats.length}
                  </div>
                </div>
              )}

              {form.selectedSeats.length > 0 && (
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="space-y-2">
                    {form.selectedSeats.map(seatId => {
                      const seat = event.seating_layout.seats.find(s => s.id === seatId);
                      if (!seat) return null;
                      return (
                        <div key={seatId} className="flex justify-between items-center text-sm">
                          <span>Seat {seat.row}-{seat.column} ({seat.tier.toUpperCase()})</span>
                          <span>₹{getSeatPrice(seatId)}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10">
                    <span className="text-sm text-gray-300">Total:</span>
                    <span className="text-lg font-bold">₹{getTotalPrice()}</span>
                  </div>
                </div>
              )}

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={submitting || form.selectedSeats.length === 0}
                className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Processing…' : `Proceed to Payment (₹${getTotalPrice()})`}
              </button>
            </form>
          ) : (
            <div>
              <h3 className="text-xl font-semibold mb-4">Complete Payment</h3>
              <p className="text-gray-300 mb-4">
                Total amount: ₹{getTotalPrice()} for {form.selectedSeats.length} seat{form.selectedSeats.length > 1 ? 's' : ''}
              </p>
              <StripePayment
                eventId={id!}
                tickets={form.selectedSeats.length}
                totalPrice={getTotalPrice()}
                userName={form.userName}
                userEmail={form.userEmail}
                selectedSeats={form.selectedSeats}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentCancel={handlePaymentCancel}
              />
            </div>
          )}
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