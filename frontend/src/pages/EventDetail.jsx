import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEventById, registerForEvent } from "../utils/api";

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvent();
  }, []);

  const fetchEvent = async () => {
    try {
      const response = await getEventById(id);
      setEvent(response.data);
    } catch {
      navigate("/");
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    setRegistering(true);
    setMessage("");
    try {
      const email = localStorage.getItem("email");
      await registerForEvent({ eventId: id, userEmail: email });
      setMessage("Successfully registered! Check your email for confirmation.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed.");
    }
    setRegistering(false);
  };

  if (loading) return <div style={styles.center}>Loading...</div>;
  if (!event) return <div style={styles.center}>Event not found</div>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {event.mediaUrl && (
          <img src={event.mediaUrl} alt={event.title} style={styles.image} />
        )}
        <div style={styles.body}>
          <h1 style={styles.title}>{event.title}</h1>
          <p style={styles.date}>
            {new Date(event.dateTime).toLocaleString()}
          </p>
          <p style={styles.description}>{event.description}</p>
          {message && (
            <p style={styles.message}>{message}</p>
          )}
          <button
            style={styles.btn}
            onClick={handleRegister}
            disabled={registering}
          >
            {registering ? "Registering..." : "Register for Event"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "2rem", maxWidth: "800px", margin: "0 auto" },
  card: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    overflow: "hidden"
  },
  image: { width: "100%", height: "300px", objectFit: "cover" },
  body: { padding: "2rem" },
  title: { color: "#1a1a2e", marginBottom: "0.5rem" },
  date: { color: "#999", marginBottom: "1rem" },
  description: { color: "#444", marginBottom: "1.5rem", lineHeight: "1.6" },
  btn: {
    padding: "0.75rem 2rem",
    backgroundColor: "#e94560",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "1rem",
    cursor: "pointer"
  },
  message: {
    padding: "1rem",
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
    borderRadius: "4px",
    marginBottom: "1rem"
  },
  center: { textAlign: "center", padding: "3rem" }
};