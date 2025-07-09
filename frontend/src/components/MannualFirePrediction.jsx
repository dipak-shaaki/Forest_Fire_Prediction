import { useState } from "react";
import axios from "axios";

export default function ManualFirePrediction() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    latitude: "",
    longitude: "",
    temperature: "",
    humidity: "",
    wind_speed: "",
    precipitation: "",
    elevation: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value),
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.post("http://localhost:8000/predict-manual", formData);
      setResult(response.data);
      setStep(2);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 border rounded-lg shadow">
      {step === 1 && (
        <>
          <h2 className="text-xl font-bold mb-4">Step 1: Input Environmental Parameters</h2>
          <form className="grid grid-cols-2 gap-4">
            {[
              "latitude",
              "longitude",
              "temperature",
              "humidity",
              "wind_speed",
              "precipitation",
              "elevation",
            ].map((param) => (
              <div key={param}>
                <label className="block text-sm font-medium capitalize mb-1">{param.replace("_", " ")}</label>
                <input
                  type="number"
                  step="any"
                  name={param}
                  value={formData[param]}
                  onChange={handleChange}
                  className="w-full border px-2 py-1 rounded"
                />
              </div>
            ))}
          </form>
          <div className="mt-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {loading ? "Predicting..." : "Predict Fire Risk"}
            </button>
          </div>
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </>
      )}

      {step === 2 && result && (
        <>
          <h2 className="text-xl font-bold mb-4">Step 2: Prediction Result</h2>
          <p><strong>Prediction:</strong> {result.fire_occurred === 1 ? "🔥 Fire Likely" : "🌿 No Fire Expected"}</p>
          <p><strong>Risk Level:</strong> {result.risk_level}</p>
          <p className="mt-2"><strong>Explanation:</strong> {result.explanation}</p>

          <div className="mt-4">
            <button
              onClick={() => {
                setFormData({});
                setResult(null);
                setStep(1);
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Predict Another
            </button>
          </div>
        </>
      )}
    </div>
  );
}
