export default function StatsPanel({ stats }) {
  return (
    <div className="card">
      <h3>Statistics</h3>
      <p>Total waiting: {stats.totalWaiting}</p>
      <p>Total emergency: {stats.totalEmergency}</p>
      <p>Total visited: {stats.totalVisited}</p>
    </div>
  );
}
