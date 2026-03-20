export default function AdminDashboard() {
  return (
    <div className="container">
      <h2>Admin Monitoring Panel</h2>

      <div className="card">
        <p>
          Live disease spread visualization across India
        </p>

        <div
          style={{
            height: "300px",
            background: "#e5e7eb",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <p>India Heatmap (Coming Next)</p>
        </div>
      </div>
    </div>
  );
}
