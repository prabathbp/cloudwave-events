import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getIdToken, isAdmin } from '../utils/auth';
import { getEventById, updateEvent, getPresignedUrl } from '../utils/api';

function toDatetimeLocal(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toISOString().slice(0, 16);
}

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    dateTime: '',
    mediaUrl: '',
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef();

  useEffect(() => {
    if (!isAdmin()) navigate('/events', { replace: true });
  }, [navigate]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await getEventById(id);
        const ev = res.data.event || res.data;
        setForm({
          title: ev.title || '',
          description: ev.description || '',
          dateTime: toDatetimeLocal(ev.dateTime || ev.date),
          mediaUrl: ev.mediaUrl || ev.bannerUrl || '',
        });
      } catch (err) {
        setError('Failed to load event. Please go back and try again.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const presignRes = await getPresignedUrl({ filename: file.name, contentType: file.type });
      const { uploadUrl, fileUrl } = presignRes.data;
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      setForm((prev) => ({ ...prev, mediaUrl: fileUrl }));
    } catch (err) {
      setError('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.title.trim()) { setError('Event title is required.'); return; }
    if (!form.dateTime) { setError('Event date is required.'); return; }
    setSubmitting(true);
    try {
      await updateEvent(id, {
        title: form.title.trim(),
        description: form.description.trim(),
        dateTime: new Date(form.dateTime).toISOString(),
        mediaUrl: form.mediaUrl,
      });
      setSuccess('Event updated successfully! Redirecting…');
      setTimeout(() => navigate('/events'), 1800);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Access denied. Only admins can edit events.');
      } else {
        setError('Update failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={styles.page}><p style={styles.status}>Loading event details…</p></div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <button style={styles.backBtn} onClick={() => navigate('/events')}>← Back to Events</button>
        <h1 style={styles.title}>Edit Event</h1>

        {error && <div style={styles.alertError}>{error}</div>}
        {success && <div style={styles.alertSuccess}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Event Title *</label>
            <input name="title" type="text" value={form.title} onChange={handleChange} style={styles.input} required />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} style={{ ...styles.input, resize: 'vertical' }} />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Date & Time *</label>
            <input name="dateTime" type="datetime-local" value={form.dateTime} onChange={handleChange} style={styles.input} required />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Banner Image</label>
            {form.mediaUrl && (
              <div style={styles.previewWrap}>
                <img src={form.mediaUrl} alt="Banner" style={styles.previewImg} onError={(e) => { e.target.style.display = 'none'; }} />
                <button type="button" style={styles.removeBanner} onClick={() => setForm((p) => ({ ...p, mediaUrl: '' }))}>Remove</button>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            <button type="button" style={styles.uploadBtn} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? 'Uploading…' : 'Upload New Image'}
            </button>
            <input name="mediaUrl" type="url" value={form.mediaUrl} onChange={handleChange} placeholder="Or paste image URL directly" style={{ ...styles.input, marginTop: '0.5rem' }} />
          </div>

          <div style={styles.actions}>
            <button type="button" style={{ ...styles.btn, ...styles.btnCancel }} onClick={() => navigate('/events')} disabled={submitting}>Cancel</button>
            <button type="submit" style={{ ...styles.btn, ...styles.btnSave }} disabled={submitting || uploading}>{submitting ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: '680px', margin: '2rem auto', padding: '0 1rem', fontFamily: "'Segoe UI', system-ui, sans-serif" },
  status: { textAlign: 'center', color: '#64748b', padding: '3rem 0' },
  card: { background: '#fff', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  backBtn: { background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', padding: '0 0 1rem', display: 'block' },
  title: { fontSize: '1.6rem', fontWeight: 700, color: '#0f172a', marginTop: 0, marginBottom: '1.5rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontWeight: 600, fontSize: '0.875rem', color: '#374151' },
  input: { border: '1.5px solid #e2e8f0', borderRadius: '8px', padding: '0.65rem 0.9rem', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', color: '#0f172a' },
  previewWrap: { position: 'relative', marginBottom: '0.5rem' },
  previewImg: { width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', border: '1.5px solid #e2e8f0', display: 'block' },
  removeBanner: { position: 'absolute', top: '8px', right: '8px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.3rem 0.7rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 },
  uploadBtn: { background: '#f1f5f9', border: '1.5px dashed #94a3b8', borderRadius: '8px', padding: '0.6rem 1.2rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: '#475569', width: '100%', textAlign: 'center' },
  actions: { display: 'flex', gap: '0.75rem', marginTop: '0.5rem' },
  btn: { flex: 1, padding: '0.7rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem' },
  btnCancel: { background: '#e2e8f0', color: '#374151' },
  btnSave: { background: '#2563eb', color: '#fff' },
  alertError: { background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.875rem', marginBottom: '0.5rem' },
  alertSuccess: { background: '#f0fdf4', border: '1px solid #86efac', color: '#16a34a', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.875rem', marginBottom: '0.5rem' },
};
