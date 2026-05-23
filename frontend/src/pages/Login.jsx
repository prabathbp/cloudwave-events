import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../utils/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await loginUser(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"80vh"}}>
      <div style={{backgroundColor:"white",padding:"2rem",borderRadius:"8px",boxShadow:"0 2px 10px rgba(0,0,0,0.1)",width:"100%",maxWidth:"400px"}}>
        <h2 style={{textAlign:"center",marginBottom:"1.5rem",color:"#1a1a2e"}}>
          Login to CloudWave
        </h2>
        {error && (
          <p style={{color:"red",marginBottom:"1rem",textAlign:"center"}}>
            {error}
          </p>
        )}
        <form onSubmit={handleLogin}>
          <input
            style={{width:"100%",padding:"0.75rem",marginBottom:"1rem",borderRadius:"4px",border:"1px solid #ddd",fontSize:"1rem",boxSizing:"border-box"}}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            style={{width:"100%",padding:"0.75rem",marginBottom:"1rem",borderRadius:"4px",border:"1px solid #ddd",fontSize:"1rem",boxSizing:"border-box"}}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            style={{width:"100%",padding:"0.75rem",backgroundColor:"#1a1a2e",color:"white",border:"none",borderRadius:"4px",fontSize:"1rem",cursor:"pointer"}}
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p style={{textAlign:"center",marginTop:"1rem"}}>
          No account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}