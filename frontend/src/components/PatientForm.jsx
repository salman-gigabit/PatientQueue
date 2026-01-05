import { useState } from "react";

export default function PatientForm({ addPatient }) {
  const [name, setName] = useState("");
  const [problem, setProblem] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !problem.trim()) {
      setError("Name and problem are required");
      return;
    }

    setSubmitting(true);
    try {
      await addPatient({
        name: name.trim(),
        problem: problem.trim(),
        priority,
      });
      setName("");
      setProblem("");
      setPriority("Normal");
    } catch (err) {
      setError("Failed to add patient");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h3>Add Patient</h3>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter patient name"
          className="input"
          disabled={submitting}
        />
        <input
          type="text"
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="Describe the problem"
          className="input"
          disabled={submitting}
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          disabled={submitting}
        >
          <option>Normal</option>
          <option>Emergency</option>
        </select>
        <button type="submit" disabled={submitting}>
          {submitting ? "Adding..." : "Add"}
        </button>
      </form>
    </div>
  );
}
