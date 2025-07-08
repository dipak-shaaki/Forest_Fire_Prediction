import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { fetchConfidenceFires } from '../services/fireApi';

export default function ConfidenceFireChart() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetchConfidenceFires().then(data => {
      const labels = data.map(d => d.confidence);
      const counts = data.map(d => d.count);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Fire Confidence Level',
            data: counts,
            backgroundColor: ['#e74c3c', '#f1c40f', '#2ecc71'],
          },
        ],
      });
    });
  }, []);

  if (!chartData) return <p>Loading chart...</p>;

  return (
    <div key="confidence-chart" style={{ margin: '20px 0' }}>
      <h3>Fires by Confidence Level</h3>
      <Bar data={chartData} />
    </div>
  );
}
