export interface Event {
  id: string;
  name: string;
  date: string;          // ISO-8601
  location: string;
  available_seats: number;
  total_seats: number;
  description?: string;
  booking_count?: number;
}

export interface Booking {
  id: string;
  eventId: string;
  event_name?: string;    // joined for display
  date?: string;
  eventDate?: string;
  location?:string;
  userName: string;
  userEmail: string;
  tickets: number;
  status: 'Confirmed' | 'Cancelled';
  eventDeleted?: boolean;
}