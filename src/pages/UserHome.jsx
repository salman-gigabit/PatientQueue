import { useEffect, useState } from "react";
import {
  getPatients,
  getStats,
  addPatient as apiAddPatient,
} from "../api/patients";
import PatientForm from "../components/PatientForm";
import PatientList from "../components/PatientList";
import StatsPanel from "../components/StatsPanel";

export default function UserHome() {
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "null");
    setCurrentUser(user);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    // Dispatch custom event to notify App component
    window.dispatchEvent(new Event("logout"));
    window.location.href = "/login";
  };

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const p = await getPatients();
      const s = await getStats();
      setPatients(p.data);
      setStats(s.data);
    } catch {
      setError("Failed to refresh data. Check the backend.");
    } finally {
      setLoading(false);
    }
  };

  const addPatientOptimistic = async ({ name, problem, priority }) => {
    setError("");
    const tempId = `temp-${Date.now()}`;
    const arrival = new Date().toISOString();
    const tempPatient = {
      id: tempId,
      name,
      problem,
      priority,
      arrivalTime: arrival,
      status: "Waiting",
    };

    setPatients((prev) => {
      const next = [...prev, tempPatient];
      return next.sort((a, b) => {
        const pa = a.priority === "Emergency" ? 0 : 1;
        const pb = b.priority === "Emergency" ? 0 : 1;
        if (pa !== pb) return pa - pb;
        return new Date(a.arrivalTime) - new Date(b.arrivalTime);
      });
    });

    try {
      await apiAddPatient({ name, problem, priority });
      await refresh();
    } catch {
      setPatients((prev) => prev.filter((p) => p.id !== tempId));
      setError("Failed to add patient. Try again.");
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>Clinic Queue System</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          {currentUser && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: "600", color: "#667eea" }}>{currentUser.name}</div>
              <div style={{ fontSize: "12px", color: "#666" }}>User</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              background: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {loading && <div className="info">Loading...</div>}

      <div className="grid">
        <PatientForm addPatient={addPatientOptimistic} />
        <StatsPanel stats={stats} />
      </div>

      <div className="card">
        <h3>Waiting Queue (View Only)</h3>
        {patients.length === 0 ? (
          <p>No patients waiting.</p>
        ) : (
          patients.map((p) => (
            <div
              key={p.id}
              style={{
                padding: "15px",
                margin: "10px 0",
                border: "1px solid #ddd",
                borderRadius: "8px",
                background: p.priority === "Emergency" ? "#fff3cd" : "#fff",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: "600", fontSize: "16px" }}>{p.name}</div>
                  <div style={{ color: "#666", marginTop: "5px" }}>{p.problem}</div>
                  <div style={{ fontSize: "12px", color: "#999", marginTop: "5px" }}>
                    Priority: {p.priority} | Arrived: {new Date(p.arrivalTime).toLocaleString()}
                  </div>
                </div>
                <div
                  style={{
                    padding: "5px 10px",
                    borderRadius: "4px",
                    background: p.priority === "Emergency" ? "#dc3545" : "#667eea",
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  {p.priority}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

