import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const client = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

export const fetchMeta = async () => {
  const { data } = await client.get("/meta");
  return data;
};

export const fetchAnalytics = async (filters) => {
  const params = new URLSearchParams();
  (filters.platforms || []).forEach((v) => params.append("platforms", v));
  (filters.regions || []).forEach((v) => params.append("regions", v));
  (filters.ages || []).forEach((v) => params.append("ages", v));
  (filters.content_types || []).forEach((v) => params.append("content_types", v));
  (filters.genders || []).forEach((v) => params.append("genders", v));
  if (filters.start_date) params.append("start_date", filters.start_date);
  if (filters.end_date) params.append("end_date", filters.end_date);

  const { data } = await client.get(`/analytics?${params.toString()}`);
  return data;
};

export const formatCurrency = (n, compact = true) => {
  if (n === null || n === undefined) return "—";
  if (compact) {
    if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  }
  return `$${Number(n).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
};

export const formatNumber = (n, compact = true) => {
  if (n === null || n === undefined) return "—";
  if (compact) {
    if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  }
  return Number(n).toLocaleString("en-US");
};

export const formatPercent = (n, digits = 1) => {
  if (n === null || n === undefined) return "—";
  return `${(n * 100).toFixed(digits)}%`;
};

export const PLATFORM_COLORS = {
  Google: "#D1603D",
  Facebook: "#111110",
  Instagram: "#7D8471",
  LinkedIn: "#A5ACB5",
  YouTube: "#DDA77B",
};

export const CHART_COLORS = ["#111110", "#D1603D", "#DDA77B", "#7D8471", "#A5ACB5"];
