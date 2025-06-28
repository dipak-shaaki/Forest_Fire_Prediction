export default function HowItWorks() {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-semibold text-gray-800">How It Works</h1>
        <ul className="mt-4 list-disc ml-6 text-gray-700">
          <li>Fetches NASA weather data</li>
          <li>Calculates VPD and fire-related parameters</li>
          <li>Predicts fire risk using ML model</li>
        </ul>
      </div>
    );
  }
  