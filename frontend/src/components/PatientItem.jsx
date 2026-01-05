export default function PatientItem({ patient, onVisited }) {
  const visit = async () => {
    if (onVisited) {
      try {
        await onVisited(patient.id);
      } catch (err) {}
    }
  };

  return (
    <div className="patient-item">
      <div>
        <h4>
          {patient.name}{" "}
          {patient.priority === "Emergency" && (
            <span className="badge-red">Emergency</span>
          )}
        </h4>
        <p>{patient.problem}</p>
        <small>{new Date(patient.arrivalTime).toLocaleString()}</small>
      </div>

      <button onClick={visit} className="btn-visit">
        Visited
      </button>
    </div>
  );
}
