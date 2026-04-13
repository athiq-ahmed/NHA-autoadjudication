"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Settings2 } from "lucide-react";

interface ClaimRow {
  claim_id: string;
  patient_name: string;
  hospital: string;
  package: string;
  claimed_amount: number;
  status: string;
  confidence: number;
  priority?: "critical" | "high" | "medium" | "low";
  days_pending?: number;
  assigned_to?: string;
  los_days?: number;
  complexity?: number;
}

export default function ProfessionalClaimsTable({ claims }: { claims: ClaimRow[] }) {
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [columnVisibility, setColumnVisibility] = useState({
    claim_id: true,
    patient_name: true,
    hospital: true,
    package: true,
    claimed_amount: true,
    status: true,
    confidence: true,
    priority: true,
    assigned_to: true,
  });
  const [columnSettingsOpen, setColumnSettingsOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pass":
        return "bg-green-100 text-green-800 border-green-300";
      case "conditional":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "fail":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "critical":
        return "C";
      case "high":
        return "H";
      case "medium":
        return "M";
      case "low":
        return "L";
      default:
        return "-";
    }
  };

  const getDaysColor = (days: number) => {
    if (days > 14) return "text-red-600 font-bold";
    if (days > 7) return "text-orange-600 font-semibold";
    return "text-green-600";
  };

  const getPriorityFromClaim = (claim: ClaimRow): string => {
    if (claim.priority) return claim.priority;
    if (claim.complexity !== undefined) {
      if (claim.complexity > 80) return "critical";
      if (claim.complexity > 60) return "high";
      if (claim.complexity > 40) return "medium";
      return "low";
    }
    if (claim.status?.toLowerCase() === "fail") return "critical";
    if (claim.status?.toLowerCase() === "conditional") return "high";
    return "medium";
  };

  const getDaysPendingFromClaim = (claim: ClaimRow): number => {
    if (claim.days_pending !== undefined) return claim.days_pending;
    return claim.los_days || 3;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-gray-900">Claims List</h3>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">{claims.length} claims</span>
          {selectedRows.size > 0 && <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">{selectedRows.size} selected</span>}
        </div>

        <div className="relative">
          <button onClick={() => setColumnSettingsOpen(!columnSettingsOpen)} className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors" title="Column options">
            <Settings2 size={18} />
          </button>

          {columnSettingsOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <div className="p-4 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900 text-sm">Visible Columns</h4>
              </div>
              <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                {Object.keys(columnVisibility).map((col) => (
                  <label key={col} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={columnVisibility[col as keyof typeof columnVisibility]}
                      onChange={() =>
                        setColumnVisibility({
                          ...columnVisibility,
                          [col]: !columnVisibility[col as keyof typeof columnVisibility],
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700 capitalize">{col.replace(/_/g, " ")}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRows(new Set(claims.map((c) => c.claim_id)));
                    } else {
                      setSelectedRows(new Set());
                    }
                  }}
                  className="w-4 h-4"
                />
              </th>
              {columnVisibility.claim_id && <SortableHeader label="Claim ID" column="claim_id" active={sortBy === "claim_id"} order={sortOrder} onSort={handleSort} />}
              {columnVisibility.patient_name && <SortableHeader label="Patient" column="patient_name" active={sortBy === "patient_name"} order={sortOrder} onSort={handleSort} />}
              {columnVisibility.hospital && <SortableHeader label="Hospital" column="hospital" active={sortBy === "hospital"} order={sortOrder} onSort={handleSort} />}
              {columnVisibility.package && <SortableHeader label="Package" column="package" active={sortBy === "package"} order={sortOrder} onSort={handleSort} />}
              {columnVisibility.claimed_amount && <SortableHeader label="Amount" column="claimed_amount" active={sortBy === "claimed_amount"} order={sortOrder} onSort={handleSort} />}
              {columnVisibility.status && <SortableHeader label="Status" column="status" active={sortBy === "status"} order={sortOrder} onSort={handleSort} />}
              {columnVisibility.confidence && <SortableHeader label="Confidence" column="confidence" active={sortBy === "confidence"} order={sortOrder} onSort={handleSort} />}
              {columnVisibility.priority && <th className="px-6 py-3 text-left font-semibold text-gray-700">Priority</th>}
              {columnVisibility.assigned_to && <th className="px-6 py-3 text-left font-semibold text-gray-700">Assigned To</th>}
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Pending</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((claim) => (
              <tr
                key={claim.claim_id}
                onMouseEnter={() => setHoveredRow(claim.claim_id)}
                onMouseLeave={() => setHoveredRow(null)}
                className={`border-b border-gray-100 transition-colors ${hoveredRow === claim.claim_id ? "bg-blue-50" : "hover:bg-gray-50"}`}
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(claim.claim_id)}
                    onChange={(e) => {
                      const newSet = new Set(selectedRows);
                      if (e.target.checked) {
                        newSet.add(claim.claim_id);
                      } else {
                        newSet.delete(claim.claim_id);
                      }
                      setSelectedRows(newSet);
                    }}
                    className="w-4 h-4"
                  />
                </td>
                {columnVisibility.claim_id && <td className="px-6 py-4 font-semibold text-blue-600 hover:text-blue-700 cursor-pointer">{claim.claim_id}</td>}
                {columnVisibility.patient_name && <td className="px-6 py-4 text-gray-800">{claim.patient_name}</td>}
                {columnVisibility.hospital && <td className="px-6 py-4 text-gray-700">{claim.hospital}</td>}
                {columnVisibility.package && <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">{claim.package}</span></td>}
                {columnVisibility.claimed_amount && <td className="px-6 py-4 font-semibold text-gray-900">Rs {claim.claimed_amount.toLocaleString()}</td>}
                {columnVisibility.status && <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(claim.status)}`}>{claim.status}</span></td>}
                {columnVisibility.confidence && (
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`${claim.confidence > 0.8 ? "bg-green-500" : claim.confidence > 0.5 ? "bg-yellow-500" : "bg-red-500"} h-full`} style={{ width: `${claim.confidence * 100}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 min-w-fit">{(claim.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                )}
                {columnVisibility.priority && <td className="px-6 py-4 text-center text-lg">{getPriorityIcon(getPriorityFromClaim(claim))}</td>}
                {columnVisibility.assigned_to && <td className="px-6 py-4 text-gray-700 text-sm">{claim.assigned_to || "Unassigned"}</td>}
                <td className={`px-6 py-4 font-semibold text-sm ${getDaysColor(getDaysPendingFromClaim(claim))}`}>{getDaysPendingFromClaim(claim)}d</td>
                <td className="px-6 py-4"><button className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-sm text-gray-600">
        <div>Showing {claims.length} of {claims.length} claims</div>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-white transition-colors">&lt;- Previous</button>
          <button className="px-3 py-1 bg-white border border-gray-300 rounded-lg">1</button>
          <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-white transition-colors">Next -&gt;</button>
        </div>
      </div>
    </div>
  );
}

function SortableHeader({ label, column, active, order, onSort }: { label: string; column: string; active: boolean; order: "asc" | "desc"; onSort: (col: string) => void; }) {
  return (
    <th onClick={() => onSort(column)} className="px-6 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors group">
      <div className="flex items-center gap-2">
        <span>{label}</span>
        {active ? order === "asc" ? <ChevronUp size={16} className="text-blue-600" /> : <ChevronDown size={16} className="text-blue-600" /> : <ChevronUp size={16} className="text-gray-300 group-hover:text-gray-400" />}
      </div>
    </th>
  );
}
