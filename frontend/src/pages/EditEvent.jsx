/**
 * EditEvent.jsx  (NEW file)
 * CloudWave Events Platform — Edit Event Page (Admin only)
 *
 * Route: /events/edit/:id
 * Loads event data, pre-fills form, submits PUT /events/{id}
 */

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getIdToken, isAdmin } from '../utils/auth';

const API_BASE =
  process.env.REACT_APP_API_URL ||
  'https://d307hyj1i7.execute-api.ap-southeast-1.amazonaws.com/dev';

const S3_PRESIGN_URL = `${API_BASE}/uploads/presigned-url`;

// ── Date formatter for datetime-local input ───────────────────────────────────
function toDatetimeLocal(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  // Format: YYYY-MM-DDTHH:MM
  return d.toISOString().slice(0, 16);
}

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    bannerUrl: '',
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fileInputRef = useRef();

  // ── Guard: redirect non-admins ────────────────────────────────────────────
  useEffect(() => {
    if (!isAdmin()) {
      navigate('/events', { replace: true });
    }
  }, [navigate]);

  // ── Load event data ───────────────────────────────────────────────────────
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = getIdToken();
        const res = await fetch(`${API_BASE}/events/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Support both direct event object or { event: {} } wrapper
        const ev = data.event || data;

        setForm({
          title: ev.title || '',
          description: ev.description || '',
          date: toDatetimeLocal(ev.date),
          bannerUrl: ev.bannerUrl || '',
        });
      } catch (err) {
        setError('Failed to load event. Please go back and try again.');
        console.error('[EditEvent] load error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchEvent();
  }, [id]);

  // ── Handle input change ───────────────────────────────────────────────────
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ── Handle image upload via pre-signed URL ────────────────────────────────
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const token = getIdToken();

      // 1. Get pre-signed URL from our Lambda
      const presignRes = await fetch(
        `${S3_PRESIGN_URL}?filename=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!presignRes.ok) throw new Error('Failed to get upload URL');
      const { uploadUrl, fileUrl } = await presignRes.json();

      // 2. Upload file directly to S3
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!uploadRes.ok) throw new Error('S3 upload failed');

      // 3. Store the CloudFront / S3 URL
      setForm((prev) => ({ ...prev, bannerUrl: fileUrl }));
    } catch (err) {
      console.error('[EditEvent] image upload error:', err);
      setError('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // ── Handle form submit ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.title.trim()) {
      setError('Event title is required.');
      return;
    }
    if (!form.date) {
      setError('Event date is required.');
      return;
    }

    setSubmitting(true);

    try {
      const token = getIdToken();
      const body = {
        title: form.title.trim(),
        description: form.description.trim(),
        date: new Date(form.date).toISOString(),
        bannerUrl: form.bannerUrl,
      };

      const res = await fetch(`${API_BASE}/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.status === 403) {
        setError('Access denied. Only admins can edit events.');
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setSuccess('Event updated successfully! Redirecting…');
      setTimeout(() => navigate('/events'), 1800);
    } catch (err) {
      console.error('[EditEvent] submit error:', err);
      setError('Update failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={styles.page}>
        <p style={styles.status}>Loading event details…</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <button style={styles.backBtn} onClick={() => navigate('/events')}>
          ← Back to Events
        </button>

        <h1 style={styles.title}>✏️ Edit Event</h1>

        {error && <div style={styles.alertError}>{error}</div>}
        {success && <div style={styles.alertSuccess}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Title */}
          <div style={styles.field}>
            <label style={styles.label} htmlFor="title">Event Title *</label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter event title"
              style={styles.input}
              required
            />
          </div>

          {/* Description */}
          <div style={styles.field}>
            <label style={styles.label} htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter event description"
              rows={4}
              style={{ ...styles.input, resize: 'vertical' }}
            />
          </div>

          {/* Date & Time */}
          <div style={styles.field}>
            <label style={styles.label} htmlFor="date">Date & Time *</label>
            <input
              id="date"
              name="date"
              type="datetime-local"
              value={form.date}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          {/* Banner Image */}
          <div style={styles.field}>
            <label style={styles.label}>Banner Image</label>

            {form.bannerUrl && (
              <div style={styles.previewWrap}>
                <img
                  src={form.bannerUrl}
                  alt="Banner preview"
                  style={styles.previewImg}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <button
                  type="button"
                  style={styles.removeBanner}
                  onClick={() => setForm((p) => ({ ...p, bannerUrl: '' }))}
                >
                  Remove
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              style={styles.uploadBtn}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Uploading…' : '📁 Upload New Image'}
            </button>

            {/* Or paste URL directly */}
            <input
              name="bannerUrl"
              type="url"
              value={form.bannerUrl}
              onChange={handleChange}
              placeholder="Or paste image URL directly"
              style={{ ...styles.input, marginTop: '0.5rem' }}
            />
          </div>

          {/* Submit */}
          <div style={styles.actions}>
            <button
              type="button"
              style={{ ...styles.btn, ...styles.btnCancel }}
              onClick={() => navigate('/events')}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ ...styles.btn, ...styles.btnSave }}
              disabled={submitting || uploading}
            >
              {submitting ? 'Saving…' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  page: {
    maxWidth: '680px',
    margin: '2rem auto',
    padding: '0 1rem',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  status: {
    textAlign: 'center',
    color: '#64748b',
    padding: '3rem 0',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#2563eb',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
    padding: '0 0 1rem',
    display: 'block',
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: 700,
    color: '#0f172a',
    marginTop: 0,
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  label: {
    fontWeight: 600,
    fontSize: '0.875rem',
    color: '#374151',
  },
  input: {
    border: '1.5px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.65rem 0.9rem',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    color: '#0f172a',
  },
  previewWrap: {
    position: 'relative',
    marginBottom: '0.5rem',
  },
  previewImg: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '1.5px solid #e2e8f0',
    display: 'block',
  },
  removeBanner: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.3rem 0.7rem',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  uploadBtn: {
    background: '#f1f5f9',
    border: '1.5px dashed #94a3b8',
    borderRadius: '8px',
    padding: '0.6rem 1.2rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#475569',
    width: '100%',
    textAlign: 'center',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
  btn: {
    flex: 1,
    padding: '0.7rem',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '0.95rem',
    transition: 'opacity 0.2s',
  },
  btnCancel: {
    background: '#e2e8f0',
    color: '#374151',
  },
  btnSave: {
    background: '#2563eb',
    color: '#fff',
  },
  alertError: {
    background: '#fef2f2',
    border: '1px solid #fca5a5',
    color: '#dc2626',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    marginBottom: '0.5rem',
  },
  alertSuccess: {
    background: '#f0fdf4',
    border: '1px solid #86efac',
    color: '#16a34a',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    marginBottom: '0.5rem',
  },
};
