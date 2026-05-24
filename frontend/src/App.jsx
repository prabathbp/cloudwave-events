import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import Login from './pages/Login';
import RegisterPage from './pages/RegisterPage';
import EventListPage from './pages/EventListPage';
import EventDetail from './pages/EventDetail';
import CreateEventPage from './pages/CreateEventPage';
import EditEvent from './pages/EditEvent';
import AppNavbar from './components/AppNavbar';
import { isAuthenticated, isAdmin } from './utils/auth';

function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (!isAdmin()) return <Navigate to="/events" replace />;
  return children;
}

function RedirectEdit() {
  const { id } = useParams();
  return <Navigate to={`/events/${id}/edit`} replace />;
}

function HomeRedirect() {
  return <Navigate to={isAuthenticated() ? '/events' : '/login'} replace />;
}

function AppRoutes() {
  const location = useLocation();
  const hideNav =
    location.pathname === '/login' || location.pathname === '/register';

  return (
    <>
      {!hideNav && <AppNavbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/events/create"
          element={<AdminRoute><CreateEventPage /></AdminRoute>}
        />
        <Route
          path="/events/:id/edit"
          element={<AdminRoute><EditEvent /></AdminRoute>}
        />
        <Route
          path="/events/:id"
          element={<PrivateRoute><EventDetail /></PrivateRoute>}
        />
        <Route
          path="/events"
          element={<PrivateRoute><EventListPage /></PrivateRoute>}
        />

        <Route path="/create" element={<Navigate to="/events/create" replace />} />
        <Route
          path="/events/edit/:id"
          element={<RedirectEdit />}
        />
        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
