import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface Seat {
  id: string;
  seatNumber: string;
  row: string;
  section: string;
  status: 'available' | 'booked' | 'reserved';
  price: number;
  type: string;
}

interface SeatSelectionProps {
  eventId: string;
  onSeatsSelected: (seats: Seat[], totalAmount: number) => void;
  selectedSeats: Seat[];
}

const SeatSelection: React.FC<SeatSelectionProps> = ({
  eventId,
  onSeatsSelected,
  selectedSeats
}) => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [eventInfo, setEventInfo] = useState<any>(null);

  useEffect(() => {
    fetchSeats();
  }, [eventId]);

  const fetchSeats = async () => {
    try {
      setLoading(true);
      const response = await api.getSeats(eventId);
      setSeats(response.data.flatMap((group: any) => group.seats));
      setEventInfo(response.event);
    } catch (err) {
      setError('Failed to load seats');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.status !== 'available') return;

    const isSelected = selectedSeats.some(s => s.id === seat.id);
    let newSelectedSeats: Seat[];

    if (isSelected) {
      newSelectedSeats = selectedSeats.filter(s => s.id !== seat.id);
    } else {
      newSelectedSeats = [...selectedSeats, seat];
    }

    const totalAmount = newSelectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    onSeatsSelected(newSelectedSeats, totalAmount);
  };

  const getSeatColor = (seat: Seat) => {
    if (selectedSeats.some(s => s.id === seat.id)) return 'bg-blue-500 text-white';
    if (seat.status === 'booked') return 'bg-red-500 text-white cursor-not-allowed';
    if (seat.status === 'reserved') return 'bg-yellow-500 text-white cursor-not-allowed';
    return 'bg-green-500 hover:bg-green-600 text-white cursor-pointer';
  };

  const groupSeatsByRow = () => {
    const grouped = seats.reduce((acc, seat) => {
      const key = `${seat.section}-${seat.row}`;
      if (!acc[key]) {
        acc[key] = {
          section: seat.section,
          row: seat.row,
          seats: []
        };
      }
      acc[key].seats.push(seat);
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).sort((a, b) => {
      if (a.section !== b.section) return a.section.localeCompare(b.section);
      return a.row.localeCompare(b.row);
    });
  };

  if (loading) return <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
  </div>;

  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  if (!eventInfo?.hasSeatSelection) {
    return <div className="text-center p-4 text-gray-500">This event does not support seat selection</div>;
  }

  const groupedSeats = groupSeatsByRow();

  return (
    <div className="bg-gray-900 p-6 rounded-lg">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-2">Select Your Seats</h3>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-300">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-gray-300">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-300">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-gray-300">Reserved</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {groupedSeats.map((group) => (
          <div key={`${group.section}-${group.row}`} className="border border-gray-700 rounded p-4">
            <div className="text-sm text-gray-400 mb-2">
              {group.section} - Row {group.row}
            </div>
            <div className="flex flex-wrap gap-2">
              {group.seats.map((seat:any) => (
                <button
                  key={seat.id}
                  onClick={() => handleSeatClick(seat)}
                  disabled={seat.status !== 'available' && !selectedSeats.some(s => s.id === seat.id)}
                  className={`w-10 h-10 rounded text-xs font-bold transition-all ${
                    getSeatColor(seat)
                  }`}
                >
                  {seat.seatNumber}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedSeats.length > 0 && (
        <div className="mt-4 p-4 bg-gray-800 rounded">
          <h4 className="text-white font-semibold mb-2">Selected Seats:</h4>
          <div className="text-gray-300 text-sm">
            {selectedSeats.map(seat => (
              <div key={seat.id}>
                {seat.section} - Row {seat.row} - Seat {seat.seatNumber} (${seat.price})
              </div>
            ))}
          </div>
          <div className="text-white font-bold mt-2">
            Total: ${selectedSeats.reduce((sum, seat) => sum + seat.price, 0)}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatSelection;
