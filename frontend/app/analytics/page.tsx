"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Users,
  Zap,
  Package,
  AlertCircle,
  Download,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface AnalyticsData {
  approval_rate: { date: string; rate: number }[];
  team_performance: {
    team_member: string;
    approved: number;
    rejected: number;
    pending: number;
  }[];
  complexity_distribution: { complexity: string; count: number }[];
  package_breakdown: { package: string; count: number }[];
}

const COLORS = ["#107C10", "#FFB900", "#DA3B01", "#0078D4", "#8661C5"];

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(7);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [approvalRes, teamRes, complexityRes, packageRes] = await Promise.all([
        fetch(`${API_URL}/analytics/approval-rate?days=${dateRange}`),
        fetch(`${API_URL}/analytics/team-performance`),
        fetch(`${API_URL}/analytics/complexity-distribution`),
        fetch(`${API_URL}/analytics/package-breakdown`),
      ]);

      const analyticsData: AnalyticsData = {
        approval_rate: await approvalRes.json(),
        team_performance: await teamRes.json(),
        complexity_distribution: await complexityRes.json(),
        package_breakdown: await packageRes.json(),
      };

      setData(analyticsData);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Navbar />
        <main className="flex-1 lg:ml-64 container-main py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Navbar />

      <main className="flex-1 lg:ml-64">
        {/* Header */}
        <div className="header">
          <h1 className="text-4xl font-bold mb-2">Analytics</h1>
          <p className="text-blue-100">Performance metrics and insights</p>
        </div>

        <div className="container-main py-8 space-y-8">
          {/* Date Range Selector */}
          <div className="flex gap-4 items-center">
            <label className="text-gray-700 font-semibold">Date Range:</label>
            {[7, 30, 90].map((days) => (
              <button
                key={days}
                onClick={() => setDateRange(days)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  dateRange === days
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                Last {days} Days
              </button>
            ))}
            <button className="ml-auto btn-secondary flex items-center gap-2">
              <Download size={16} /> Export
            </button>
          </div>

          {/* Approval Rate Trend */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="text-blue-600" size={24} /> Approval Rate Trend
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data?.approval_rate || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `${(value * 100).toFixed(1)}%`}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#0078D4"
                  strokeWidth={2}
                  dot={{ fill: "#0078D4", r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Approval Rate"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Team Performance */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="text-green-600" size={24} /> Team Performance
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.team_performance || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="team_member" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="approved" fill="#107C10" name="Approved" />
                <Bar dataKey="rejected" fill="#DA3B01" name="Rejected" />
                <Bar dataKey="pending" fill="#FFB900" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Complexity & Package Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Complexity Distribution */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Zap className="text-yellow-600" size={24} /> Complexity Distribution
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data?.complexity_distribution || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ complexity, count }) =>
                      `${complexity}: ${count}`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Package Breakdown */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Package className="text-purple-600" size={24} /> Package Breakdown
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data?.package_breakdown || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ package: pkg, count }) => `${pkg}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg Approval Rate</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {data?.approval_rate
                      ? (
                          data.approval_rate.reduce((sum, d) => sum + d.rate, 0) /
                          data.approval_rate.length * 100
                        ).toFixed(1)
                      : "0"}
                    %
                  </p>
                </div>
                <TrendingUp className="text-blue-600" size={32} />
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Claims</p>
                  <p className="text-3xl font-bold text-green-600">
                    {data?.complexity_distribution?.reduce((sum, d) => sum + d.count, 0) || 0}
                  </p>
                </div>
                <AlertCircle className="text-green-600" size={32} />
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Team Members</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {data?.team_performance?.length || 0}
                  </p>
                </div>
                <Users className="text-purple-600" size={32} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
