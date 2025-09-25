import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import EventList from "./pages/EventList";
import BookingForm from "./pages/BookingFrom";
import MyBookings from "./pages/MyBookings";
import Login from "./pages/Login";
import { Link } from "react-router-dom";
import Register from "./pages/Register";
import { getTokenPayload } from "./utils/jwt";

/* ----------  tiny guard  ---------- */
const Private: React.FC<{ children: React.JSX.Element }> = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
};

/* ----------  layout with dynamic nav  ---------- */
const Layout: React.FC = () => {
  const { token, logout } = useAuth();
  const payload = getTokenPayload();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <header className="sticky top-0 z-10 bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a
            href="/"
            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400"
          >
            Eventify
          </a>
          <nav className="flex items-center gap-6 text-sm text-gray-300">
            <Link to="/" className="hover:text-white transition">
              Explore
            </Link>

            {token ? (
              <>
                {/* user info */}
                

                <Link to="/my-bookings" className="hover:text-white transition">
                  My Tickets
                </Link>
                <button
                  onClick={logout}
                  className="hover:text-white transition"
                >
                  Logout
                </button>
                {/* user info */}
                <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                    {payload?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-sm">
                    <p className="text-white font-medium">{payload?.name}</p>
                    <p className="text-white font-small">{payload?.email}</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-white transition">
                  Login
                </Link>
                <Link to="/register" className="hover:text-white transition">
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<EventList />} />
          <Route
            path="/login"
            element={!token ? <Login /> : <Navigate to="/" replace />}
          />
          <Route
            path="/register"
            element={!token ? <Register /> : <Navigate to="/" replace />}
          />

          {/* private sections */}
          <Route
            path="/book/:id"
            element={
              <Private>
                <BookingForm />
              </Private>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <Private>
                <MyBookings />
              </Private>
            }
          />
        </Routes>
      </main>
    </div>
  );
};

/* ----------  root component  ---------- */
const App: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <Layout />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
