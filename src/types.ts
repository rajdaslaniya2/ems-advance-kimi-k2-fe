export interface Seat {
  id: string;
  row: number;
  column: number;
  tier: 'gold' | 'silver' | 'platinum' | 'blocked';
  available: boolean;
  price: number;
}

export interface SeatingLayout {
  rows: number;
  columns: number;
  seats: Seat[];
  booked_seats?: string[];
}

export interface Event {
  id: string;
  name: string;
  date: string;          // ISO-8601
  location: string;
  available_seats: number;
  total_seats: number;
  description?: string;
  booking_count?: number;
  pricing: {
    gold: { price: number; available: boolean };
    silver: { price: number; available: boolean };
    platinum: { price: number; available: boolean };
  };
  seating_layout: SeatingLayout;
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