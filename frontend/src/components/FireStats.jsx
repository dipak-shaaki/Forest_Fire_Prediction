
import React from 'react';

function FireStats({ stats }) {
  const { dailyFires, monthlyFires, totalFires } = stats;

  const cardStyle = "bg-white shadow-md rounded-lg p-6 w-full sm:w-1/3 text-center border-t-4";

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <div className={`${cardStyle} border-red-500`}>
        <h2 className="text-xl font-semibold text-red-600">Fires Today</h2>
        <p className="text-3xl font-bold mt-2">{dailyFires}</p>
      </div>

      <div className={`${cardStyle} border-yellow-500`}>
        <h2 className="text-xl font-semibold text-yellow-600">This Month</h2>
        <p className="text-3xl font-bold mt-2">{monthlyFires}</p>
      </div>

      <div className={`${cardStyle} border-green-500`}>
        <h2 className="text-xl font-semibold text-green-600">All-Time Total</h2>
        <p className="text-3xl font-bold mt-2">{totalFires}</p>
      </div>
    </div>
  );
}

export default FireStats;
