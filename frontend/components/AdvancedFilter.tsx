"use client";

import { ChevronDown, X, Filter, RotateCcw } from "lucide-react";
import { useState } from "react";

export default function AdvancedFilter({
  onApply,
  onClear,
}: {
  onApply: (filters: any) => void;
  onClear: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    priorityLevel: "",
    amountRange: [0, 500000],
    assignedTo: "",
    dateRange: "all",
    confidence: [0, 1],
  });

  const handleApply = () => {
    onApply(filters);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 border-b border-gray-200 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Filter size={18} className="text-blue-600" />
          <span className="font-semibold text-gray-900">Advanced Filters</span>
        </div>
        <ChevronDown
          size={20}
          className={`text-gray-500 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* Content */}
      {expanded && (
        <div className="p-6 space-y-6">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "pass", label: "✓ Approved", color: "green" },
                { value: "conditional", label: "⏳ Pending", color: "yellow" },
                { value: "fail", label: "✕ Rejected", color: "red" },
                { value: "draft", label: "✏️ Draft", color: "gray" },
              ].map((status) => (
                <button
                  key={status.value}
                  onClick={() => setFilters({ ...filters, status: status.value })}
                  className={`px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                    filters.status === status.value
                      ? `border-blue-500 bg-blue-50 text-blue-700`
                      : "border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Priority Level
            </label>
            <select
              value={filters.priorityLevel}
              onChange={(e) => setFilters({ ...filters, priorityLevel: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Priorities</option>
              <option value="critical">🔴 Critical</option>
              <option value="high">🟠 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>

          {/* Claimed Amount Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Claimed Amount: ₹{filters.amountRange[0].toLocaleString()} - ₹{filters.amountRange[1].toLocaleString()}
            </label>
            <input
              type="range"
              min="0"
              max="500000"
              step="10000"
              value={filters.amountRange[1]}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  amountRange: [0, parseInt(e.target.value)],
                })
              }
              className="w-full"
            />
          </div>

          {/* Confidence Score */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Confidence Score: {(filters.confidence[1] * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={filters.confidence[1]}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  confidence: [0, parseFloat(e.target.value)],
                })
              }
              className="w-full"
            />
          </div>

          {/* Assigned To */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Assigned To
            </label>
            <select
              value={filters.assignedTo}
              onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Anyone</option>
              <option value="me">Assigned to Me</option>
              <option value="unassigned">Unassigned</option>
              <option value="team">My Team</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleApply}
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
            <button
              onClick={() => {
                setFilters({
                  status: "",
                  priorityLevel: "",
                  amountRange: [0, 500000],
                  assignedTo: "",
                  dateRange: "all",
                  confidence: [0, 1],
                });
                onClear();
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <RotateCcw size={16} /> Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
