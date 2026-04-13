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
import { AlertCircle, CheckCircle, Clock, DollarSign, TrendingUp, Zap } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function ProfessionalDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("mock");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [metricsRes, trendsRes, queueRes] = await Promise.all([
          fetch(`${API_URL}/dashboard/metrics?mode=${mode}`),
          fetch(`${API_URL}/dashboard/trends?mode=${mode}`),
          fetch(`${API_URL}/claims/queue/manual-review?mode=${mode}`),
        ]);

        setMetrics(await metricsRes.json());
        const trendData = await trendsRes.json();
        const queueData = await queueRes.json();
        setTrends(trendData.trends || trendData || []);
        setQueue(queueData.queue || queueData || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [mode]);

  return (
    <div className="min-h-screen bg-gray-900">
      <ProfessionalNavbar />
      <main className="pt-20 md:pl-64">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 md:px-8 py-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Dashboard</h1>
              <p className="text-blue-100">Welcome back. Here is your claims overview.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setMode("mock")} className={`px-4 py-2 rounded-lg font-semibold transition-all ${mode === "mock" ? "bg-white text-blue-600 shadow-lg" : "bg-blue-500 text-white hover:bg-blue-600"}`}>Mock Data</button>
              <button onClick={() => setMode("live")} className={`px-4 py-2 rounded-lg font-semibold transition-all ${mode === "live" ? "bg-white text-blue-600 shadow-lg" : "bg-blue-500 text-white hover:bg-blue-600"}`}>Live</button>
            </div>
          </div>
        </div>

        <div className="px-6 md:px-8 py-8 space-y-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <KpiCard title="Total Claims" value={metrics?.total_claims || 0} note="2.1% from last week" icon={<DollarSign className="text-blue-600" size={24} />} tone="blue" />
                <KpiCard title="Approved" value={metrics?.auto_adjudicated || 0} note="Processed" icon={<CheckCircle className="text-green-600" size={24} />} tone="green" />
                <KpiCard title="Pending Review" value={metrics?.manual_review || 0} note="Waiting" icon={<Clock className="text-orange-600" size={24} />} tone="orange" />
                <KpiCard title="Avg Confidence" value={`${((metrics?.avg_confidence || 0) * 100).toFixed(0)}%`} note="System reliability" icon={<Zap className="text-blue-600" size={24} />} tone="blue" />
                <KpiCard title="Rejection Rate" value={metrics?.fail_count || 0} note="Declined" icon={<AlertCircle className="text-red-600" size={24} />} tone="red" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="text-blue-600" size={20} />
                    Daily Adjudication Trend
                  </h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                      <Legend />
                      <Line type="monotone" dataKey="total_claims" stroke="#0078D4" strokeWidth={2} name="Total Claims" />
                      <Line type="monotone" dataKey="auto_adjudicated" stroke="#107C10" strokeWidth={2} name="Auto-Adjudicated" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Status Breakdown</h2>
                  <StatusBar label="Approved" value={metrics?.pass_count || 0} width="50%" color="bg-green-500" />
                  <StatusBar label="Pending" value={metrics?.conditional_count || 0} width="33%" color="bg-yellow-500" />
                  <StatusBar label="Rejected" value={metrics?.fail_count || 0} width="17%" color="bg-red-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <AlertCircle className="text-orange-600" size={20} />
                    Manual Review Queue
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Claims requiring immediate attention</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">#</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">Claim ID</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">Patient</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">Issue</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">Confidence</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">Priority</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {queue.slice(0, 5).map((item: any, idx: number) => (
                        <tr key={item.claim_id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-gray-500">{idx + 1}</td>
                          <td className="px-6 py-4 font-semibold text-blue-600">{item.claim_id}</td>
                          <td className="px-6 py-4 text-gray-700">{item.patient_name}</td>
                          <td className="px-6 py-4"><span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">Low Confidence</span></td>
                          <td className="px-6 py-4 text-gray-700">{(item.confidence * 100).toFixed(0)}%</td>
                          <td className="px-6 py-4 text-center">{item.complexity > 70 ? "C" : item.complexity > 40 ? "H" : "M"}</td>
                          <td className="px-6 py-4"><Link href={`/claims/${item.claim_id}`} className="text-blue-600 font-semibold hover:text-blue-700 text-sm">Review -&gt;</Link></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <Link href="/claims" className="text-blue-600 font-semibold hover:text-blue-700 text-sm flex items-center gap-1">View all claims -&gt;</Link>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function KpiCard({ title, value, note, icon, tone }: { title: string; value: string | number; note: string; icon: React.ReactNode; tone: "blue" | "green" | "orange" | "red"; }) {
  const bg = { blue: "bg-blue-100", green: "bg-green-100", orange: "bg-orange-100", red: "bg-red-100" }[tone];
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
          <p className="text-xs text-gray-500 mt-2">{note}</p>
        </div>
        <div className={`p-3 rounded-lg ${bg}`}>{icon}</div>
      </div>
    </div>
  );
}

function StatusBar({ label, value, width, color }: { label: string; value: number; width: string; color: string; }) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-900">{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div className={`h-full ${color}`} style={{ width }} />
      </div>
    </div>
  );
}
