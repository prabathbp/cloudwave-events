import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser, confirmUser } from "../utils/auth";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await registerUser(email, password);
      setStep(2);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await confirmUser(email, code);
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>
          {step === 1 ? "Create Account" : "Verify Email"}
        </h2>
        {error && <p style={styles.error}>{error}</p>}
        {step === 1 ? (
          <form onSubmit={handleRegister}>
            <input
              style={styles.input}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              style={styles.input}
              type="password"
              placeholder="Password (min 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button style={styles.btn} type="submit" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleConfirm}>
            <p style={styles.info}>
              Check your email for a verification code
            </p>
            <input
              style={styles.input}
              type="text"
              placeholder="Enter verification code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <button style={styles.btn} type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>
        )}
        <p style={styles.text}>
          Already have account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "80vh"
  },
  card: {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px"
  },
  title: {
    textAlign: "center",
    marginBottom: "1.5rem",
    color: "#1a1a2e"
  },
  input: {
    width: "100%",
    padding: "0.75rem",
    marginBottom: "1rem",
    borderRadius: "4px",
    border: "1px solid #ddd",
    fontSize: "1rem",
    boxSizing: "border-box"
  },
  btn: {
    width: "100%",
    padding: "0.75rem",
    backgroundColor: "#1a1a2e",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "1rem",
    cursor: "pointer"
  },
  error: {
    color: "red",
    marginBottom: "1rem",
    textAlign: "center"
  },
  info: {
    color: "#666",
    marginBottom: "1rem",
    textAlign: "center"
  },
  text: {
    textAlign: "center",
    marginTop: "1rem"
  }
};