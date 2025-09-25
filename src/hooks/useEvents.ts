// src/hooks/useEvents.ts
// import { useEffect, useState } from 'react';
// import { Event } from '../types';

// const DUMMY: Event[] = [
//   { id: 1, name: 'Summer Synthwave', date: '2025-07-15T19:00:00', location: 'Roof-top @ Downtown', availableSeats: 42 },
//   { id: 2, name: 'Jazz Under Stars', date: '2025-07-22T20:30:00', location: 'Central Park', availableSeats: 18 },
//   { id: 3, name: 'Indie Rock Night', date: '2025-08-01T21:00:00', location: 'The Cave', availableSeats: 0 },
// ];

// export const useEvents = () => {
//   const [events, setEvents] = useState<Event[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     // TODO: replace with api.getEvents() when endpoint is ready
//     setTimeout(() => {
//       setEvents(DUMMY);
//       setLoading(false);
//     }, 400); // tiny delay to keep spinner visible
//   }, []);

//   return { events, loading, error };
// };

//-----------------

import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Event } from '../types';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState< string | null>(null);

  useEffect(() => {
    api.getEvents()
      .then(setEvents)
      .catch(err => setError(err.message || 'Failed to load events'))
      .finally(() => setLoading(false));
  }, []);

  return { events, loading, error };
};