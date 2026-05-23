import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createEvent, getPresignedUrl } from "../utils/api";

export default function CreateEvent() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const uploadFile = async () => {
    if (!file) return "";
    const { data } = await getPresignedUrl({
      fileName: file.name,
      contentType: file.type
    });
    await fetch(data.uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type }
    });
    return data.fileUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const mediaUrl = await uploadFile();
      await createEvent({ title, description, dateTime, mediaUrl });
      navigate("/");
    } catch (err) {
      setError("Failed to create event. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create New Event</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            type="text"
            placeholder="Event Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            style={styles.textarea}
            placeholder="Event Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
          />
          <input
            style={styles.input}
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            required
          />
          <label style={styles.label}>Upload Event Banner (optional)</label>
          <input
            style={styles.input}
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Event"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    padding: "2rem"
  },
  card: {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "500px"
  },
  title: { textAlign: "center", marginBottom: "1.5rem", color: "#1a1a2e" },
  input: {
    width: "100%",
    padding: "0.75rem",
    marginBottom: "1rem",
    borderRadius: "4px",
    border: "1px solid #ddd",
    fontSize: "1rem",
    boxSizing: "border-box"
  },
  textarea: {
    width: "100%",
    padding: "0.75rem",
    marginBottom: "1rem",
    borderRadius: "4px",
    border: "1px solid #ddd",
    fontSize: "1rem",
    boxSizing: "border-box",
    resize: "vertical"
  },
  label: {
    display: "block",
    marginBottom: "0.5rem",
    color: "#666",
    fontSize: "0.9rem"
  },
  btn: {
    width: "100%",
    padding: "0.75rem",
    backgroundColor: "#1a1a2e",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "1rem",
    cursor: "pointer",
    marginTop: "0.5rem"
  },
  error: { color: "red", marginBottom: "1rem", textAlign: "center" }
};