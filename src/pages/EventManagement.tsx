import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { Event } from "../types";
import EventForm from "../components/EventForm";

const EventManagement: React.FC = () => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/admin/login");
      return;
    }

    if (id) {
      // Editing existing event
      fetchEvent();
    } else {
      // Creating new event
      setLoading(false);
    }
  }, [user, navigate, id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const events = await api.getEvents();
      const foundEvent = events.find((e: Event) => e.id === id!);
      if (foundEvent) {
        setEvent(foundEvent);
      } else {
        setError("Event not found");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch event");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (eventData: any) => {
    try {
      if (id && event) {
        // Update existing event
        await api.updateEvent(event.id, eventData);
      } else {
        // Create new event
        await api.createEvent(eventData);
      }
      navigate("/admin/dashboard");
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Failed to save event");
    }
  };

  const handleCancel = () => {
    navigate("/admin/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">
            {id ? "Edit Event" : "Create New Event"}
          </h1>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
          >
            Back to Dashboard
          </button>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <EventForm
            event={event}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
};

export default EventManagement;
