
import React from 'react';
import YearlyFireChart from '../components/charts/YearlyFireChart';
import MonthlyFireChart from '../components/charts/MonthlyFireChart';
import ConfidenceFireChart from '../components/ConfidenceFireChart';

export default function FireStatsPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Fire Statistics in Nepal</h2>

      <section style={{ marginBottom: '3rem' }}>
        <h3>Fires Over the Years</h3>
        <YearlyFireChart />
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h3>Monthly Fire Distribution</h3>
        <MonthlyFireChart />
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h3>Fires by Confidence Level</h3>
        <ConfidenceFireChart />
      </section>


    </div>
  );
}
