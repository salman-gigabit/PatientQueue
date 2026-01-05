import { useEffect, useState } from "react";
import {
  getPatients,
  getStats,
  addPatient as apiAddPatient,
  markVisited as apiMarkVisited,
} from "../api/patients";
import PatientForm from "../components/PatientForm";
import PatientList from "../components/PatientList";
import StatsPanel from "../components/StatsPanel";

export default function Home() {
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const p = await getPatients();
      const s = await getStats();
      setPatients(p.data);
      setStats(s.data);
    } catch (err) {
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
    } catch (err) {
      setPatients((prev) => prev.filter((p) => p.id !== tempId));
      setError("Failed to add patient. Try again.");
    }
  };

  const markVisitedOptimistic = async (id) => {
    setError("");
    const patient = patients.find((p) => p.id === id);
    if (!patient) return;

    setStats((s) => ({
      totalWaiting: Math.max((s.totalWaiting || 1) - 1, 0),
      totalEmergency:
        patient.priority === "Emergency"
          ? Math.max((s.totalEmergency || 1) - 1, 0)
          : s.totalEmergency || 0,
      totalVisited: (s.totalVisited || 0) + 1,
    }));

    setPatients((prev) => prev.filter((p) => p.id !== id));

    try {
      await apiMarkVisited(id);
    } catch (err) {
      setPatients((prev) => {
        const next = [...prev, patient];
        return next.sort((a, b) => {
          const pa = a.priority === "Emergency" ? 0 : 1;
          const pb = b.priority === "Emergency" ? 0 : 1;
          if (pa !== pb) return pa - pb;
          return new Date(a.arrivalTime) - new Date(b.arrivalTime);
        });
      });
      setStats((s) => ({
        totalWaiting: (s.totalWaiting || 0) + 1,
        totalEmergency:
          patient.priority === "Emergency"
            ? (s.totalEmergency || 0) + 1
            : s.totalEmergency || 0,
        totalVisited: Math.max((s.totalVisited || 1) - 1, 0),
      }));
      setError("Failed to mark visited. Try again.");
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="container">
      <h1>Clinic Queue System</h1>

      {error && <div className="error">{error}</div>}
      {loading && <div className="info">Loading...</div>}

      <div className="grid">
        <PatientForm addPatient={addPatientOptimistic} />
        <StatsPanel stats={stats} />
      </div>

      <PatientList patients={patients} onVisited={markVisitedOptimistic} />
    </div>
  );
}
