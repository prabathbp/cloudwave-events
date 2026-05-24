
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getEvents, deleteEvent } from "../utils/apiClient";

export default function EventListPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await getEvents();
      const data = response.data;
      if (Array.isArray(data)) {
        setEvents(data);
      } else if (data && Array.isArray(data.events)) {
        setEvents(data.events);
      } else {
        setEvents([]);
      }
    } catch (err) {
      console.log("Error loading events:", err);
      setError("Failed to load events");
    }
    setLoading(false);
  };

  const handleDeleteClick = (eventId) => {
    setConfirmDelete(eventId);
  };

  const handleDeleteConfirm = async () => {
    const eventId = confirmDelete;
    setConfirmDelete(null);
    setDeletingId(eventId);
    try {
      await deleteEvent(eventId);
      setEvents((prev) => prev.filter((e) => e.eventId !== eventId));
    } catch (err) {
      console.log("Delete failed:", err);
      alert("Failed to delete event. Please try again.");
    }
    setDeletingId(null);
  };

  const handleDeleteCancel = () => {
    setConfirmDelete(null);
  };

  if (loading) return <div style={styles.center}>Loading events...</div>;
  if (error) return <div style={styles.center}>{error}</div>;

  return (
    <div style={styles.container}>
      {confirmDelete && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Delete Event?</h3>
            <p style={styles.modalText}>
              This action cannot be undone. Are you sure you want to delete this
              event?
            </p>
            <div style={styles.modalActions}>
              <button onClick={handleDeleteCancel} style={styles.cancelBtn}>
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} style={styles.confirmDeleteBtn}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.header}>
        <h1 style={styles.title}>Upcoming Events</h1>
        <Link to="/events/create" style={styles.createBtn}>
          + Create Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div style={styles.center}>
          <p>No events yet.</p>
          <Link to="/events/create" style={styles.btn}>
            Create First Event
          </Link>
        </div>
      ) : (
        <div style={styles.grid}>
          {events.map((event) => (
            <div key={event.eventId} style={styles.card}>
              {event.mediaUrl && (
                <img
                  src={event.mediaUrl}
                  alt={event.title}
                  style={styles.image}
                />
              )}
              <div style={styles.cardBody}>
                <h3 style={styles.eventTitle}>{event.title}</h3>
                <p style={styles.description}>{event.description}</p>
                <p style={styles.date}>
                  {new Date(event.dateTime).toLocaleString()}
                </p>
                <div style={styles.actions}>
                  <Link
                    to={`/events/${event.eventId}`}
                    style={styles.viewBtn}
                  >
                    View
                  </Link>
                  <button
                    onClick={() => navigate(`/events/${event.eventId}/edit`)}
                    style={styles.editBtn}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(event.eventId)}
                    style={{
                      ...styles.deleteBtn,
                      opacity: deletingId === event.eventId ? 0.5 : 1,
                      cursor:
                        deletingId === event.eventId
                          ? "not-allowed"
                          : "pointer",
                    }}
                    disabled={deletingId === event.eventId}
                  >
                    {deletingId === event.eventId ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "2rem",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  title: {
    color: "#1a1a2e",
    margin: 0,
  },
  createBtn: {
    display: "inline-block",
    padding: "0.6rem 1.2rem",
    backgroundColor: "#1a1a2e",
    color: "white",
    textDecoration: "none",
    borderRadius: "4px",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1.5rem",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  image: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
  },
  cardBody: {
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
    flexGrow: 1,
  },
  eventTitle: {
    color: "#1a1a2e",
    margin: 0,
    fontSize: "1.1rem",
  },
  description: {
    color: "#666",
    margin: 0,
    fontSize: "0.9rem",
    lineHeight: "1.4",
  },
  date: {
    color: "#999",
    fontSize: "0.85rem",
    margin: 0,
    marginBottom: "0.75rem",
  },
  actions: {
    display: "flex",
    gap: "0.5rem",
    marginTop: "auto",
    flexWrap: "wrap",
  },
  viewBtn: {
    flex: 1,
    textAlign: "center",
    padding: "0.5rem 0.75rem",
    backgroundColor: "#1a1a2e",
    color: "white",
    textDecoration: "none",
    borderRadius: "4px",
    fontSize: "0.85rem",
    fontWeight: "500",
    border: "none",
    cursor: "pointer",
  },
  editBtn: {
    flex: 1,
    padding: "0.5rem 0.75rem",
    backgroundColor: "#f0a500",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "0.85rem",
    fontWeight: "500",
    cursor: "pointer",
  },
  deleteBtn: {
    flex: 1,
    padding: "0.5rem 0.75rem",
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "0.85rem",
    fontWeight: "500",
    cursor: "pointer",
  },
  center: {
    textAlign: "center",
    padding: "3rem",
  },
  btn: {
    display: "inline-block",
    padding: "0.75rem 1.5rem",
    backgroundColor: "#1a1a2e",
    color: "white",
    textDecoration: "none",
    borderRadius: "4px",
    marginTop: "1rem",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "2rem",
    maxWidth: "400px",
    width: "90%",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  modalTitle: {
    color: "#1a1a2e",
    marginTop: 0,
  },
  modalText: {
    color: "#666",
    marginBottom: "1.5rem",
  },
  modalActions: {
    display: "flex",
    gap: "0.75rem",
    justifyContent: "flex-end",
  },
  cancelBtn: {
    padding: "0.6rem 1.2rem",
    backgroundColor: "#f0f0f0",
    color: "#333",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "500",
  },
  confirmDeleteBtn: {
    padding: "0.6rem 1.2rem",
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "500",
  },
};
