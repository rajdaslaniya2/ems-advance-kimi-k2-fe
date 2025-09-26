import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SeatSelection from '../components/SeatSelection';

interface Seat {
  id: string;
  seatNumber: string;
  row: string;
  section: string;
  status: 'available' | 'booked' | 'reserved';
  price: number;
  type: string;
}

const SeatBooking: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSeatsSelected = (seats: Seat[], amount: number) => {
    setSelectedSeats(seats);
    setTotalAmount(amount);
  };

  const handleBooking = async () => {
    if (!user || selectedSeats.length === 0) return;

    try {
      setLoading(true);
      setError('');

      const response = await api.bookSeats(
        eventId!,
        selectedSeats.map(seat => seat.id),
        user.name,
        user.email
      );

      alert(`Booking successful! Total: $${response.totalAmount}`);
      navigate('/my-bookings');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Book Your Seats</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SeatSelection
                eventId={eventId!}
                onSeatsSelected={handleSeatsSelected}
                selectedSeats={selectedSeats}
              />
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-4 sticky top-4">
                <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
                
                {selectedSeats.length > 0 ? (
                  <>
                    <div className="space-y-2 mb-4">
                      <h3 className="font-medium">Selected Seats:</h3>
                      {selectedSeats.map(seat => (
                        <div key={seat.id} className="text-sm text-gray-600">
                          {seat.section} - Row {seat.row} - Seat {seat.seatNumber} (${seat.price})
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>${totalAmount}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleBooking}
                      disabled={loading || selectedSeats.length === 0}
                      className="w-full mt-4 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Processing...' : `Book ${selectedSeats.length} Seat${selectedSeats.length > 1 ? 's' : ''}`}
                    </button>
                  </>
                ) : (
                  <p className="text-gray-500 text-center">Select seats to see booking summary</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatBooking;
