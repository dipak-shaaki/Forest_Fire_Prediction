import React from 'react';
import FireMap from '../components/fireMap';
import {FireStatsChart} from '../components/FireStatsChart';

export default function FireWatchNepal() {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Fire Watch Nepal</h1>
      <FireMap />
      <FireStatsChart />
    </div>
  );
}