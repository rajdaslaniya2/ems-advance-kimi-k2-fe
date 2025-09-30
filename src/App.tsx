import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import EventList from "./pages/EventList";
import BookingForm from "./pages/BookingFrom";
import MyBookings from "./pages/MyBookings";
import Login from "./pages/Login";
import { Link } from "react-router-dom";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import EventManagement from "./pages/EventManagement";
import { getTokenPayload } from "./utils/jwt";

/* ----------  tiny guard  ---------- */
const Private: React.FC<{ children: React.JSX.Element }> = ({ children }) => {
  const { token, user } = useAuth();
  return token && user?.role !== 'admin' ? children : user?.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/login" replace />;
};

const PrivateAdmin: React.FC<{ children: React.JSX.Element }> = ({ children }) => {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/admin/login" replace />;
  return children;
};

const RedirectIfLoggedIn: React.FC<{ children: React.JSX.Element }> = ({ children }) => {
  const { token } = useAuth();
  return token ? <Navigate to="/" replace /> : children;
};

/* ----------  layout with dynamic nav  ---------- */
const Layout: React.FC = () => {
  const { token, user, logout } = useAuth();
  const payload = getTokenPayload();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <header className="sticky top-0 z-10 bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {user?.role !== 'admin' && <Link
            to="/"
            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400"
          >
            Eventify
          </Link>}
          {user?.role === 'admin' && (
            <Link to="/admin/dashboard" className="hover:text-white transition">
              Admin Dashboard
            </Link>
          )}
          <nav className="flex items-center gap-6 text-sm text-gray-300">
            {user?.role !== 'admin' && <Link to="/" className="hover:text-white transition">
              Explore
            </Link>}

            {token ? (
              <>
                {/* user info */}


                {user?.role !== 'admin' && <Link to="/my-bookings" className="hover:text-white transition">
                  My Tickets
                </Link>}
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
            element={
              <RedirectIfLoggedIn>
                <Login />
              </RedirectIfLoggedIn>
            }
          />
          <Route
            path="/register"
            element={
              <RedirectIfLoggedIn>
                <Register />
              </RedirectIfLoggedIn>
            }
          />
          <Route
            path="/admin/login"
            element={
              <RedirectIfLoggedIn>
                <AdminLogin />
              </RedirectIfLoggedIn>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <PrivateAdmin>
                <AdminDashboard />
              </PrivateAdmin>
            }
          />
          <Route
            path="/admin/events/new"
            element={
              <PrivateAdmin>
                <EventManagement />
              </PrivateAdmin>
            }
          />
          <Route
            path="/admin/events/:id/edit"
            element={
              <PrivateAdmin>
                <EventManagement />
              </PrivateAdmin>
            }
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
