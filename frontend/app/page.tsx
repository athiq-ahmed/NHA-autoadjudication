"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProfessionalNavbar from "@/components/ProfessionalNavbar";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface Metrics {
  total_claims: number;
  auto_adjudicated: number;
  manual_review: number;
  avg_confidence: number;
  pass_count: number;
  fail_count: number;
  conditional_count: number;
}

interface QueueItem {
  claim_id: string;
  patient: string;
  status: string;
  confidence: number;
  complexity: number;
  issue: string;
}

interface StatusDistribution {
  pass?: number;
  conditional?: number;
  fail?: number;
}

interface TrendPoint {
  date: string;
  total_claims: number;
  auto_adjudicated: number;
  manual_review: number;
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [statusDist, setStatusDist] = useState<StatusDistribution>({});
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [mode, setMode] = useState("mock");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [metricsRes, trendsRes, statusRes, queueRes] = await Promise.all([
          fetch(`${API_URL}/dashboard/metrics?mode=${mode}`),
          fetch(`${API_URL}/dashboard/trends?mode=${mode}`),
          fetch(`${API_URL}/dashboard/status-distribution?mode=${mode}`),
          fetch(`${API_URL}/claims/queue/manual-review?mode=${mode}`),
        ]);

        const metricsData = await metricsRes.json();
        const trendsData = await trendsRes.json();
        const statusData = await statusRes.json();
        const queueData = await queueRes.json();

        setMetrics(metricsData);
        setTrends(trendsData.trends || []);
        setStatusDist(statusData || {});
        setQueue(queueData.queue || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, [mode]);

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gray-900">
        <ProfessionalNavbar />
        <div className="pt-20 md:pl-64 p-8 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-300">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const approvalRate = metrics.total_claims > 0 ? ((metrics.pass_count / metrics.total_claims) * 100).toFixed(1) : "0";
  const rejectionRate = metrics.total_claims > 0 ? ((metrics.fail_count / metrics.total_claims) * 100).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <ProfessionalNavbar />

      <main className="pt-20 md:pl-64">
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white px-6 md:px-8 py-12 shadow-2xl">
          <div className="flex items-center justify-between max-w-full mx-auto gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">Dashboard</h1>
              <p className="text-blue-100 text-lg">Real-time claims adjudication analytics and insights</p>
            </div>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="px-4 py-2.5 bg-white text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
            >
              <option value="mock">Mock Data</option>
              <option value="live">Live Data</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 px-6 md:px-8 py-8 max-w-full">
          <div className="md:col-span-1 space-y-4">
            <SummaryCard code="TC" label="Total" value={metrics.total_claims.toString()} note="All claims" subnote="Up 12% from yesterday" accent="gray" />
            <SummaryCard code="AA" label="Auto" value={metrics.auto_adjudicated.toString()} note="Auto-adjudicated" subnote={`Success rate ${approvalRate}%`} accent="green" />
            <SummaryCard code="HL" label="Review" value={metrics.manual_review.toString()} note="Human review" subnote="Needs review" accent="orange" />
            <SummaryCard code="CF" label="Score" value={`${(metrics.avg_confidence * 100).toFixed(0)}%`} note="Average confidence" subnote="Model reliability" accent="blue" />
            <SummaryCard code="AL" label="Alert" value={metrics.fail_count.toString()} note="Rejected claims" subnote={`${rejectionRate}% rejection rate`} accent="red" />
          </div>

          <div className="md:col-span-3 lg:col-span-4 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl border border-gray-700 p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>Trend</span>
                  7-Day Trend
                </h2>
                {trends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} stroke="#4b5563" />
                      <YAxis stroke="#4b5563" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                      <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px", color: "#e5e7eb" }} />
                      <Legend />
                      <Line type="monotone" dataKey="total_claims" stroke="#3b82f6" strokeWidth={2.5} name="Total" dot={false} />
                      <Line type="monotone" dataKey="auto_adjudicated" stroke="#10b981" strokeWidth={2.5} name="Auto" dot={false} />
                      <Line type="monotone" dataKey="manual_review" stroke="#f59e0b" strokeWidth={2.5} name="Manual" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-400">No trend data</p>
                )}
              </div>

              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl border border-gray-700 p-6">
                <h2 className="text-xl font-bold text-white mb-4">Distribution</h2>
                <div className="space-y-3">
                  <DistributionRow label="Approved" value={statusDist.pass || 0} width="50%" color="green" />
                  <DistributionRow label="Conditional" value={statusDist.conditional || 0} width="33%" color="yellow" />
                  <DistributionRow label="Rejected" value={statusDist.fail || 0} width="17%" color="red" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl border border-gray-700 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-700 bg-gradient-to-r from-gray-900 to-gray-800">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Queue</span>
                  Action Items (Priority Queue)
                </h2>
                <p className="text-sm text-gray-400 mt-1">Claims requiring immediate adjudication</p>
              </div>

              {queue.length > 0 ? (
                <div className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
                  {queue.map((item, idx) => (
                    <div key={item.claim_id} className="flex items-center gap-4 p-4 hover:bg-gray-700 hover:bg-opacity-30 transition-colors border-l-4 border-l-blue-500">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-blue-400">{item.claim_id}</p>
                        <p className="text-sm text-gray-400">{item.patient} - {item.issue}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <p className="text-sm font-bold text-white">{(item.confidence * 100).toFixed(0)}%</p>
                          <p className="text-xs text-gray-500">Conf</p>
                        </div>
                        <Link href={`/claims/${item.claim_id}`} className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all whitespace-nowrap">
                          Review
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-400">No pending items</p>
                </div>
              )}

              <div className="px-6 py-3 border-t border-gray-700 bg-gray-900 flex justify-between items-center">
                <span className="text-xs text-gray-400">Showing {Math.min(queue.length, 5)} of {queue.length}</span>
                <Link href="/claims" className="text-blue-400 text-xs font-semibold hover:text-blue-300">
                  View all -&gt;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function SummaryCard({ code, label, value, note, subnote, accent }: { code: string; label: string; value: string; note: string; subnote: string; accent: "gray" | "green" | "orange" | "blue" | "red"; }) {
  const tone = {
    gray: { bg: "from-gray-800 to-gray-900", border: "border-gray-700", label: "text-gray-400", value: "text-white" },
    green: { bg: "from-green-900 to-green-950", border: "border-green-700", label: "text-green-300", value: "text-green-400" },
    orange: { bg: "from-orange-900 to-orange-950", border: "border-orange-700", label: "text-orange-300", value: "text-orange-400" },
    blue: { bg: "from-blue-900 to-blue-950", border: "border-blue-700", label: "text-blue-300", value: "text-blue-400" },
    red: { bg: "from-red-900 to-red-950", border: "border-red-700", label: "text-red-300", value: "text-red-400" },
  }[accent];

  return (
    <div className={`bg-gradient-to-br ${tone.bg} rounded-xl shadow-xl border ${tone.border} p-5 hover:shadow-2xl transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-4xl">{code}</span>
        <span className={`text-xs font-semibold uppercase ${tone.label}`}>{label}</span>
      </div>
      <h3 className={`text-3xl font-bold ${tone.value}`}>{value}</h3>
      <p className={`text-xs mt-2 ${tone.label}`}>{note}</p>
      <div className={`mt-3 pt-3 border-t ${tone.border}`}>
        <p className={`text-xs ${tone.label}`}>{subnote}</p>
      </div>
    </div>
  );
}

function DistributionRow({ label, value, width, color }: { label: string; value: number; width: string; color: "green" | "yellow" | "red"; }) {
  const tone = {
    green: { bg: "from-green-500 to-green-600", text: "text-green-400" },
    yellow: { bg: "from-yellow-500 to-yellow-600", text: "text-yellow-400" },
    red: { bg: "from-red-500 to-red-600", text: "text-red-400" },
  }[color];

  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-sm text-gray-300">{label}</span>
        <span className={`text-sm font-bold ${tone.text}`}>{value}</span>
      </div>
      <div className="w-full h-2.5 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${tone.bg}`} style={{ width }} />
      </div>
    </div>
  );
}
