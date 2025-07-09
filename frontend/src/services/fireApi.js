

const API_BASE = 'http://localhost:8000'; 

export async function fetchYearlyFires() {
  const res = await fetch(`${API_BASE}/fires/yearly`);
  return await res.json();
}

export async function fetchMonthlyFires() {
  const res = await fetch(`${API_BASE}/fires/monthly`);
  return await res.json();
}

export async function fetchConfidenceFires() {
  const res = await fetch("http://localhost:8000/fires/confidence");
  return res.json();
}

