import PatientItem from "./PatientItem";

export default function PatientList({ patients, onVisited }) {
  return (
    <div className="card">
      <h3>Waiting Queue</h3>
      {patients.length === 0 ? (
        <p>No patients waiting.</p>
      ) : (
        patients.map((p) => (
          <PatientItem key={p.id} patient={p} onVisited={onVisited} />
        ))
      )}
    </div>
  );
}
