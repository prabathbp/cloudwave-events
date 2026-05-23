/**
 * App.jsx — Updated with /events/edit/:id route
 * CloudWave Events Platform
 *
 * Add the EditEvent import and route to your existing App.jsx.
 * Only the additions are shown below with clear markers.
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// ── Existing pages (keep all your current imports) ────────────────────────────
import Login from './pages/Login';
import EventList from './pages/EventList'
//import Events from './pages/Events';//
import EventDetail from './pages/EventDetail';
import CreateEvent from './pages/CreateEvent';

// ── NEW import ────────────────────────────────────────────────────────────────
import EditEvent from './pages/EditEvent';

// ── Auth guard (adjust to match your existing implementation) ─────────────────
import { isAuthenticated, isAdmin } from './utils/auth';

function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (!isAdmin()) return <Navigate to="/events" replace />;
  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected — any logged-in user */}
        <Route
          path="/events"
          element={<PrivateRoute>Prabath</PrivateRoute>}
        />
        <Route
          path="/events/:id"
          element={<PrivateRoute><EventDetail /></PrivateRoute>}
        />

        {/* Admin only */}
        <Route
          path="/events/create"
          element={<AdminRoute><CreateEvent /></AdminRoute>}
        />
        {/* ── NEW admin route ───────────────────────────────────────────────── */}
        <Route
          path="/events/edit/:id"
          element={<AdminRoute><EditEvent /></AdminRoute>}
        />

        {/* Redirect root */}
        <Route path="/" element={<Navigate to="/events" replace />} />
        <Route path="*" element={<Navigate to="/events" replace />} />
      </Routes>
    </Router>
  );
}
