import axios from "axios";
import { Event, Booking } from "../types";

const BASE = 'http://localhost:5001';

const axiosInstance = axios.create({
  baseURL: BASE,
});

axiosInstance.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export const api = {
  // Events
  getEvents: () => axiosInstance.get<{ data: Event[] }>(`${BASE}/api/events`).then((r) => r.data.data),
  getEvent: (id: string) => axiosInstance.get<{ data: Event }>(`${BASE}/api/events/${id}`).then((r) => r.data.data),
  createEvent: (eventData: Omit<Event, 'id'>) => axiosInstance.post<{ data: Event }>(`${BASE}/api/events`, eventData).then((r) => r.data.data),
  updateEvent: (id: string, eventData: Partial<Event>) => axiosInstance.put<{ data: Event }>(`${BASE}/api/events/${id}`, eventData).then((r) => r.data.data),
  deleteEvent: (id: string) => axiosInstance.delete<{ message: string }>(`${BASE}/api/events/${id}`).then((r) => r.data),

  // Bookings
  createBooking: (eventId: string, { userName: name, userEmail: email, tickets }: Omit<Booking, "id" | "status" | "eventId">) =>
    axiosInstance.post<{ id: string }>(`${BASE}/api/events/${eventId}/book`, { name, email, tickets }).then((r) => r.data),

  getBookings: () => axiosInstance.get<{ data: any[] }>(`${BASE}/api/bookings`).then((r) => r.data.data),
  cancelBooking: (id: string) => axiosInstance.post<{ success: boolean }>(`${BASE}/api/bookings/${id}/cancel`).then((r) => r.data),

  // Seat selection
  getSeats: (eventId: string) => axiosInstance.get<{ data: any[], event: any }>(`${BASE}/api/events/${eventId}/seats`).then((r) => r.data),
  bookSeats: (eventId: string, seats: string[], name: string, email: string) =>
    axiosInstance.post<{ id: string; message: string; seats: any[]; totalAmount: number }>(`${BASE}/api/events/${eventId}/seats/book`, { seats, name, email }).then((r) => r.data),
  createSeats: (eventId: string, seats: any[]) => axiosInstance.post<{ message: string; data: any[] }>(`${BASE}/api/events/${eventId}/seats`, { seats }).then((r) => r.data),

  // Auth
  register: (payload: { name: string; email: string; password: string }) => axios.post(`${BASE}/register`, payload).then((r) => r.data),
  login: (payload: { email: string; password: string }) => axios.post(`${BASE}/login`, payload).then((r) => r.data),
  adminLogin: (payload: { email: string; password: string }) => axios.post(`${BASE}/admin/login`, payload).then((r) => r.data),
};
//
