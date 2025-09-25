export interface Event {
  id: number;
  name: string;
  date: string;          // ISO-8601
  location: string;
  available_seats: number;
}

export interface Booking {
  id: number;
  eventId: number;
  event_name?: string;    // joined for display
  date?: string;
  eventDate?: string;
  location?:string;
  userName: string;
  userEmail: string;
  tickets: number;
  status: 'Confirmed' | 'Cancelled';
}