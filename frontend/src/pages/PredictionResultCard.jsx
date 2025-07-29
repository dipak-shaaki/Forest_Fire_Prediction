// In PredictionResultCard.jsx
const riskColors = {
  High: "#ff4d4f",      // Red
  Moderate: "#faad14",  // Orange
  Low: "#52c41a"        // Green
};

function PredictionResultCard({ result }) {
  return (
    <div style={{
      background: riskColors[result.risk_level],
      color: "#fff",
      borderRadius: "1rem",
      padding: "2rem",
      marginTop: "2rem"
    }}>
      <h2>
        {result.risk_level === "High" && "🔥"}
        {result.risk_level === "Moderate" && "⚠️"}
        {result.risk_level === "Low" && "🌲"}
        {" "}{result.risk_level} RISK
      </h2>
      <div style={{ fontSize: "1.5rem" }}>
        Probability: {(result.probability * 100).toFixed(1)}%
      </div>
      <div style={{ margin: "1rem 0" }}>{result.risk_message}</div>
      <ul>
        {result.explanation.split('. ').map((point, i) =>
          point.trim() && <li key={i}>{point}</li>
        )}
      </ul>
    </div>
  );
}