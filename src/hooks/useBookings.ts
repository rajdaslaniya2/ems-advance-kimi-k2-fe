

// src/hooks/useBookings.ts
// import { useEffect, useState } from 'react';
// import { Booking } from '../types';

// const DUMMY: Booking[] = [
//   { id: 1, eventId: 1, eventName: 'Summer Synthwave', eventDate: '2025-07-15T19:00:00', userName: 'Alice', userEmail: 'alice@mail.com', tickets: 2, status: 'Confirmed' },
//   { id: 2, eventId: 2, eventName: 'Jazz Under Stars', eventDate: '2025-07-22T20:30:00', userName: 'Bob', userEmail: 'bob@mail.com', tickets: 1, status: 'Confirmed' },
//   { id: 3, eventId: 3, eventName: 'Indie Rock Night', eventDate: '2025-08-01T21:00:00', userName: 'Charlie', userEmail: 'charlie@mail.com', tickets: 3, status: 'Cancelled' },
// ];

// export const useBookings = () => {
//   const [bookings, setBookings] = useState<Booking[]>([]);
//   const [loading, setLoading] = useState(true);

//   const refetch = () => {
//     setLoading(true);
//     // TODO: replace with api.getBookings() when endpoint ready
//     setTimeout(() => {
//       setBookings(DUMMY);
//       setLoading(false);
//     }, 400);
//   };

//   useEffect(() => { refetch(); }, []);

//   const cancel = async (id: number) => {
//     // TODO: await api.cancelBooking(id);
//     setBookings(prev => prev.map(b => (b.id === id ? { ...b, status: 'Cancelled' } : b)));
//   };

//   return { bookings, loading, refetch, cancel };
// };

//-----------------------------------------------------

import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Booking } from '../types';

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = () => {
    setLoading(true);
    api.getBookings()
      .then(setBookings)
      .finally(() => setLoading(false));
  };

  useEffect(() => { refetch(); }, []);

  const cancel = async (id: string) => {
    await api.cancelBooking(id);
    refetch();
  };

  return { bookings, loading, refetch, cancel };
};