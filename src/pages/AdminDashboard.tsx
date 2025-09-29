import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { Event } from "../types";
import EventForm from "../components/EventForm";

const AdminDashboard: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/admin/login");
      return;
    }
    fetchEvents();
  }, [user, navigate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await api.getEvents();
      setEvents(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (eventData: any) => {
    try {
      await api.createEvent(eventData);
      setShowForm(false);
      fetchEvents();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Failed to create event");
    }
  };

  const handleUpdateEvent = async (eventData: any) => {
    if (!editingEvent) return;

    try {
      await api.updateEvent(editingEvent.id, eventData);
      setEditingEvent(null);
      fetchEvents();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Failed to update event");
    }
  };

  const handleDeleteEvent = async (id: string) => {
    const event = events.find(e => e.id === id);
    if (!event) return;

    if (!window.confirm(`Are you sure you want to delete "${event.name}"?`)) return;

    try {
      await api.deleteEvent(id);
      fetchEvents();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete event");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-400 mt-1">Welcome, {user?.name}</p>
          </div>
          <button
            onClick={() => {
              setEditingEvent(null);
              setShowForm(true);
            }}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md font-medium"
          >
            Create New Event
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Event Form Modal */}
        {(showForm || editingEvent) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                {editingEvent ? "Edit Event" : "Create New Event"}
              </h2>
              <EventForm
                event={editingEvent}
                onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
                onCancel={() => {
                  setShowForm(false);
                  setEditingEvent(null);
                }}
              />
            </div>
          </div>
        )}

        {/* Events List */}
        <div className="grid gap-6">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No events found</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-purple-400 hover:text-purple-300"
              >
                Create your first event
              </button>
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
                    <p className="text-gray-400 mb-2">{event.location}</p>
                    <p className="text-gray-400 mb-2">{formatDate(event.date)}</p>
                    <p className="text-sm text-gray-500 mb-2">{event.description}</p>
                    <div className="flex gap-4 text-sm">
                      <span className="text-green-400">
                        Available: {event.available_seats}
                      </span>
                      <span className="text-blue-400">
                        Total: {event.total_seats}
                      </span>
                      <span className="text-orange-400">
                        Bookings: {event.booking_count || 0}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setEditingEvent(event)}
                      className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      disabled={(event.booking_count || 0) > 0}
                      className={`px-3 py-1 rounded text-sm ${(event.booking_count || 0) > 0
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-red-600 hover:bg-red-700'
                        }`}
                      title={
                        (event.booking_count || 0) > 0
                          ? `Cannot delete: ${event.booking_count} booking(s) exist`
                          : 'Delete event'
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
