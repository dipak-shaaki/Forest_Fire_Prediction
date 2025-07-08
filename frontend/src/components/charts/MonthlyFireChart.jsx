
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { fetchMonthlyFires } from '../../services/fireApi';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function MonthlyFireChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchMonthlyFires().then(setData);
  }, []);

  const chartData = {
    labels: data.map(d => MONTHS[d.month - 1]),
    datasets: [{
      label: 'Fires per Month',
      data: data.map(d => d.count),
      backgroundColor: 'tomato',
    }],
  };

  return <Bar data={chartData} />;
}
