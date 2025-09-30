import React, { useState, useEffect } from "react";
import { Event, Seat } from "../types";

interface EventFormProps {
  event?: Event | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ event, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Event, 'id' | 'available_seats' | 'total_seats' | 'booking_count'>>({
    name: "",
    date: "",
    location: "",
    description: "",
    pricing: {
      gold: { price: 0, available: true },
      silver: { price: 0, available: true },
      platinum: { price: 0, available: true },
    },
    seating_layout: {
      rows: 0,
      columns: 0,
      seats: [],
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTier, setSelectedTier] = useState<'gold' | 'silver' | 'platinum' | 'blocked' | null>(null);
  const hasBookings = event ? (event.booking_count ?? 0) > 0 : false;

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name,
        date: new Date(event.date).toISOString().slice(0, 16),
        location: event.location,
        description: event.description || "",
        pricing: event.pricing || {
          gold: { price: 0, available: true },
          silver: { price: 0, available: true },
          platinum: { price: 0, available: true },
        },
        seating_layout: event.seating_layout || {
          rows: 0,
          columns: 0,
          seats: [],
        },
      });
    } else {
      setFormData({
        name: "",
        date: "",
        location: "",
        description: "",
        pricing: {
          gold: { price: 0, available: true },
          silver: { price: 0, available: true },
          platinum: { price: 0, available: true },
        },
        seating_layout: {
          rows: 0,
          columns: 0,
          seats: [],
        },
      });
    }
  }, [event]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePricingChange = (tier: 'gold' | 'silver' | 'platinum', field: 'price' | 'available', value: number | boolean) => {
    setFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [tier]: {
          ...prev.pricing[tier],
          [field]: value,
        },
      },
    }));
  };

  const handleSeatingLayoutChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      seating_layout: {
        ...prev.seating_layout,
        [field]: value,
      },
    }));
  };

  const generateSeats = () => {
    const { rows, columns } = formData.seating_layout;
    if (rows <= 0 || columns <= 0) return;

    const seats: Seat[] = [];
    for (let row = 1; row <= rows; row++) {
      for (let col = 1; col <= columns; col++) {
        seats.push({
          id: `${row}-${col}`,
          row,
          column: col,
          tier: 'blocked' as 'gold' | 'silver' | 'platinum' | 'blocked',
          available: false,
          price: 0,
        });
      }
    }

    setFormData(prev => ({
      ...prev,
      seating_layout: {
        ...prev.seating_layout,
        seats,
      },
    }));
  };

  const updateSeatTier = (seatId: string, tier: 'gold' | 'silver' | 'platinum' | 'blocked') => {
    const price = tier === 'gold' ? formData.pricing.gold.price :
      tier === 'silver' ? formData.pricing.silver.price :
        tier === 'platinum' ? formData.pricing.platinum.price : 0;

    const available = tier !== 'blocked';

    setFormData(prev => ({
      ...prev,
      seating_layout: {
        ...prev.seating_layout,
        seats: prev.seating_layout.seats.map(seat =>
          seat.id === seatId
            ? { ...seat, tier, price, available }
            : seat
        ),
      },
    }));
  };

  const handleSeatClick = (seatId: string) => {
    if (selectedTier) {
      updateSeatTier(seatId, selectedTier);
    } else {
      // Original click behavior - cycle through tiers
      const seat = formData.seating_layout.seats.find(s => s.id === seatId);
      if (seat) {
        const tiers: ('gold' | 'silver' | 'platinum' | 'blocked')[] = ['gold', 'silver', 'platinum', 'blocked'];
        const currentIndex = tiers.indexOf(seat.tier);
        const nextTier = tiers[(currentIndex + 1) % tiers.length];
        updateSeatTier(seatId, nextTier);
      }
    }
  };

  const applyTierToAll = (tier: 'gold' | 'silver' | 'platinum' | 'blocked') => {
    setFormData(prev => ({
      ...prev,
      seating_layout: {
        ...prev.seating_layout,
        seats: prev.seating_layout.seats.map(seat => {
          const price = tier === 'gold' ? formData.pricing.gold.price :
            tier === 'silver' ? formData.pricing.silver.price :
              tier === 'platinum' ? formData.pricing.platinum.price : 0;
          return {
            ...seat,
            tier,
            price,
            available: tier !== 'blocked'
          };
        }),
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation for seating layout
    if (formData.seating_layout.seats.length > 0) {
      const availableSeats = formData.seating_layout.seats.filter(seat => seat.tier !== 'blocked');
      if (availableSeats.length === 0) {
        setError("Please select at least some seats (not all blocked)");
        setLoading(false);
        return;
      }
    }

    // Validation for existing bookings
    if (event && hasBookings) {
      setError("Cannot modify pricing or seating layout as bookings already exist for this event");
      setLoading(false);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || "Failed to save event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
          Event Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Enter event name"
        />
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">
          Date & Time *
        </label>
        <input
          type="datetime-local"
          id="date"
          name="date"
          required
          value={formData.date}
          onChange={handleChange}
          min={new Date().toISOString().slice(0, 16)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-1">
          Location *
        </label>
        <input
          type="text"
          id="location"
          name="location"
          required
          value={formData.location}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Enter event location"
        />
      </div>

      {/* Tiered Pricing Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-300">Seat Pricing Tiers</h3>
          {hasBookings && (
            <div className="text-xs text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded">
              🔒 Bookings exist - pricing locked
            </div>
          )}
        </div>

        {hasBookings && (
          <div className="text-sm text-gray-400 bg-gray-700 p-3 rounded">
            <p>⚠️ Cannot modify pricing or seating layout as bookings already exist for this event.</p>
            <p className="text-xs mt-1">Current bookings: {event?.booking_count}</p>
          </div>
        )}

        {/* Platinum Tier */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-700 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-blue-400 mb-1">
              Platinum Tier Price (₹)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.pricing.platinum.price}
              onChange={(e) => handlePricingChange('platinum', 'price', parseFloat(e.target.value) || 0)}
              disabled={hasBookings}
              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="0.00"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.pricing.platinum.available}
                onChange={(e) => handlePricingChange('platinum', 'available', e.target.checked)}
                disabled={hasBookings}
                className="rounded border-gray-500 text-blue-500 focus:ring-blue-500 disabled:opacity-50"
              />
              <span className="text-sm text-gray-300">Available</span>
            </label>
          </div>
        </div>

        {/* Gold Tier */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-700 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-yellow-400 mb-1">
              Gold Tier Price (₹)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.pricing.gold.price}
              onChange={(e) => handlePricingChange('gold', 'price', parseFloat(e.target.value) || 0)}
              disabled={hasBookings}
              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="0.00"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.pricing.gold.available}
                onChange={(e) => handlePricingChange('gold', 'available', e.target.checked)}
                disabled={hasBookings}
                className="rounded border-gray-500 text-yellow-500 focus:ring-yellow-500 disabled:opacity-50"
              />
              <span className="text-sm text-gray-300">Available</span>
            </label>
          </div>
        </div>

        {/* Silver Tier */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-700 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Silver Tier Price (₹)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.pricing.silver.price}
              onChange={(e) => handlePricingChange('silver', 'price', parseFloat(e.target.value) || 0)}
              disabled={hasBookings}
              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="0.00"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.pricing.silver.available}
                onChange={(e) => handlePricingChange('silver', 'available', e.target.checked)}
                disabled={hasBookings}
                className="rounded border-gray-500 text-gray-400 focus:ring-gray-400 disabled:opacity-50"
              />
              <span className="text-sm text-gray-300">Available</span>
            </label>
          </div>
        </div>
      </div>

      {/* Seating Layout Configuration */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-300">Seating Layout Configuration</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Rows
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={formData.seating_layout.rows}
              onChange={(e) => handleSeatingLayoutChange('rows', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Number of rows"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Columns
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={formData.seating_layout.columns}
              onChange={(e) => handleSeatingLayoutChange('columns', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Number of columns"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={generateSeats}
              disabled={formData.seating_layout.rows <= 0 || formData.seating_layout.columns <= 0}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Generate Seats
            </button>
          </div>
        </div>

        {formData.seating_layout.seats.length > 0 && (
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-md font-medium text-gray-300">Seating Preview & Configuration</h4>
              {selectedTier && (
                <button
                  type="button"
                  onClick={() => setSelectedTier(null)}
                  className="text-xs bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded cursor-pointer"
                >
                  Clear Selection
                </button>
              )}
            </div>

            {/* Tier Selection Chips */}
            <div className="mb-3 flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedTier('platinum')}
                disabled={hasBookings}
                className={`px-3 py-1.5 text-xs rounded-full font-medium transition-all cursor-pointer ${selectedTier === 'platinum'
                  ? 'bg-blue-600 text-blue-100 ring-2 ring-blue-400'
                  : 'bg-blue-800 text-blue-200 hover:bg-blue-700'
                  } ${hasBookings ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                🥇 Platinum
              </button>
              <button
                type="button"
                onClick={() => setSelectedTier('gold')}
                disabled={hasBookings}
                className={`px-3 py-1.5 text-xs rounded-full font-medium transition-all cursor-pointer ${selectedTier === 'gold'
                  ? 'bg-yellow-600 text-yellow-100 ring-2 ring-yellow-400'
                  : 'bg-yellow-800 text-yellow-200 hover:bg-yellow-700'
                  } ${hasBookings ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                🥈 Gold
              </button>
              <button
                type="button"
                onClick={() => setSelectedTier('silver')}
                disabled={hasBookings}
                className={`px-3 py-1.5 text-xs rounded-full font-medium transition-all cursor-pointer ${selectedTier === 'silver'
                  ? 'bg-gray-500 text-gray-100 ring-2 ring-gray-300'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  } ${hasBookings ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                🥉 Silver
              </button>
              <button
                type="button"
                onClick={() => setSelectedTier('blocked')}
                disabled={hasBookings}
                className={`px-3 py-1.5 text-xs rounded-full font-medium transition-all cursor-pointer ${selectedTier === 'blocked'
                  ? 'bg-red-600 text-red-100 ring-2 ring-red-400'
                  : 'bg-red-800 text-red-200 hover:bg-red-700'
                  } ${hasBookings ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                ❌ Blocked
              </button>
            </div>

            {/* Bulk Apply Buttons */}
            {selectedTier && !hasBookings && (
              <div className="mb-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => applyTierToAll(selectedTier)}
                  disabled={hasBookings}
                  className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply {selectedTier.toUpperCase()} to All
                </button>
                <span className="text-xs text-gray-400 self-center">
                  Click seats to set as {selectedTier}
                </span>
              </div>
            )}

            {/* Seating Grid */}
            <div className="grid gap-1 overflow-auto" style={{ gridTemplateColumns: `repeat(${formData.seating_layout.columns}, 1fr)` }}>
              {formData.seating_layout.seats.map((seat) => (
                <div
                  key={seat.id}
                  className={`p-1.5 text-xs text-center rounded border-2 transition-all ${hasBookings ? 'cursor-not-allowed' : 'cursor-pointer'} ${selectedTier === 'platinum' && seat.tier !== 'platinum' ? 'border-blue-400' :
                    selectedTier === 'gold' && seat.tier !== 'gold' ? 'border-yellow-400' :
                      selectedTier === 'silver' && seat.tier !== 'silver' ? 'border-gray-400' :
                        selectedTier === 'blocked' && seat.tier !== 'blocked' ? 'border-red-400' :
                          'border-transparent'
                    } ${seat.tier === 'platinum' ? 'bg-blue-600 border-blue-500 text-blue-100' :
                      seat.tier === 'gold' ? 'bg-yellow-600 border-yellow-500 text-yellow-100' :
                        seat.tier === 'silver' ? 'bg-gray-500 border-gray-400 text-gray-100' :
                          'bg-red-800 border-red-700 text-red-100'
                    } ${hasBookings ? 'opacity-75' : 'hover:bg-opacity-80'}`}
                  onClick={() => !hasBookings && handleSeatClick(seat.id)}
                  title={`${hasBookings ? 'Cannot modify - bookings exist' : `Seat ${seat.row}-${seat.column} - ${selectedTier ? 'Click to set as ' + selectedTier : 'Click to cycle tiers'}`}`}
                >
                  {seat.row}-{seat.column}
                  <div className="text-xxs mt-0.5">
                    {seat.tier === 'blocked' ? '❌' :
                      seat.tier === 'platinum' ? '🥇' :
                        seat.tier === 'gold' ? '🥈' : '🥉'}
                  </div>
                </div>
              ))}
            </div>

            {/* Instructions */}
            <div className="mt-3 text-xs text-gray-400">
              {selectedTier ? (
                <span>Selected: {selectedTier.toUpperCase()} - Click seats to apply</span>
              ) : (
                <span>Click seats to cycle through tiers, or select a tier above to paint seats</span>
              )}
            </div>

            <div className="mt-2 text-sm text-gray-400">
              <div>Total Seats: {formData.seating_layout.seats.length}</div>
              <div className="grid grid-cols-4 gap-1 text-xs">
                <div className="text-blue-400">🥇 Platinum: {formData.seating_layout.seats.filter(s => s.tier === 'platinum').length}</div>
                <div className="text-yellow-400">🥈 Gold: {formData.seating_layout.seats.filter(s => s.tier === 'gold').length}</div>
                <div className="text-gray-400">🥉 Silver: {formData.seating_layout.seats.filter(s => s.tier === 'silver').length}</div>
                <div className="text-red-400">❌ Blocked: {formData.seating_layout.seats.filter(s => s.tier === 'blocked').length}</div>
              </div>
              {formData.seating_layout.seats.length > 0 && formData.seating_layout.seats.filter(s => s.tier !== 'blocked').length === 0 && (
                <div className="mt-2 text-xs text-red-400">
                  ⚠️ All seats are blocked. Please select at least some seats.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Enter event description (optional)"
        />
      </div>



      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          {loading ? "Saving..." : event ? "Update Event" : "Create Event"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EventForm;
