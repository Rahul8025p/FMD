import { useLocation, useNavigate } from "react-router-dom";

export default function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state?.result) {
    return (
      <div className="container">
        <p>No result found</p>
        <button className="btn btn-primary" onClick={() => navigate("/analyze")}>
          Go Back
        </button>
      </div>
    );
  }

  const { disease, confidence, severity, explanation, recommendations } =
    state.result;

  return (
    <div className="container">
      <h2>Analysis Result</h2>

      <div className="card">
        <h3 style={{ color: "var(--danger)" }}>{disease}</h3>

        <p><strong>Confidence:</strong> {(confidence * 100).toFixed(2)}%</p>
        <p><strong>Severity:</strong> {severity}</p>

        <h4>Why this was detected</h4>
        <ul>
          {explanation.visual.map((v, i) => (
            <li key={i}>{v}</li>
          ))}
          {explanation.texture.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
          {explanation.thermal.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>

        <h4>Recommended Actions</h4>

        <strong>Precautions</strong>
        <ul>
          {recommendations.precautions.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>

        <strong>Treatment</strong>
        <ul>
          {recommendations.treatment.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>

        <p><strong>Vaccination:</strong> {recommendations.vaccination}</p>
      </div>
    </div>
  );
}
