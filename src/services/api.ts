import axios from 'axios';
import { Event, Booking } from '../types';

const BASE = 'http://localhost:5001'; // Local development
// const BASE = 'https://event-booking-hjef.onrender.com';  // Deployed
// const BASE = `https://dozens-point-absolute-approx.trycloudflare.com`

const axiosInstance = axios.create({
  baseURL: BASE,
});

// attach JWT automatically
axiosInstance.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export const api = {
  getEvents: () =>
    axiosInstance
      .get<{ data: Event[] }>(`${BASE}/api/events`)
      .then((r) => r.data.data),

  createBooking: (
    eventId: string,
    {
      userName: name,
      userEmail: email,
      tickets,
    }: Omit<Booking, 'id' | 'status' | 'eventId'>
  ) =>
    axiosInstance
      .post<{ id: string }>(`/api/events/${eventId}/book`, {
        name,
        email,
        tickets,
      })
      .then((r) => r.data),
  getBookings: () =>
    axiosInstance
      .get<{ data: Booking[] }>(`${BASE}/api/bookings`)
      .then((r) => r.data.data),
  cancelBooking: (id: string) =>
    axiosInstance
      .post<{ success: boolean }>(`${BASE}/api/bookings/${id}/cancel`)
      .then((r) => r.data),

  getEvent: (id: string) =>
    axiosInstance
      .get<{ data: Event }>(`/api/events/${id}`)
      .then((r) => r.data.data),

  // generic helpers for auth
  post: (url: string, data?: any) => axios.post(`${BASE}${url}`, data),

  register: (payload: { name: string; email: string; password: string }) =>
    axios
      .post<{
        token: string;
        user: { id: string; name: string; email: string; role: string };
      }>(`${BASE}/register`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((r) => r.data),

  login: (payload: { email: string; password: string }) =>
    axios
      .post<{
        token: string;
        user: { id: string; name: string; email: string; role: string };
      }>(`${BASE}/login`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((r) => r.data),

  adminLogin: (payload: { email: string; password: string }) =>
    axios
      .post<{
        token: string;
        user: { id: string; name: string; email: string; role: string };
      }>(`${BASE}/admin/login`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((r) => r.data),

  // Admin event CRUD operations
  createEvent: (eventData: {
    name: string;
    date: string;
    location: string;
    total_seats: number;
    description?: string;
  }) =>
    axiosInstance
      .post<{ data: Event }>(`/api/events`, eventData)
      .then((r) => r.data.data),

  updateEvent: (
    id: string,
    eventData: {
      name?: string;
      date?: string;
      location?: string;
      total_seats?: number;
      description?: string;
    }
  ) =>
    axiosInstance
      .put<{ data: Event }>(`/api/events/${id}`, eventData)
      .then((r) => r.data.data),

  deleteEvent: (id: string) =>
    axiosInstance
      .delete<{ message: string }>(`/api/events/${id}`)
      .then((r) => r.data),
};
//
