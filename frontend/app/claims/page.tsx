"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProfessionalNavbar from "@/components/ProfessionalNavbar";
import AdvancedFilter from "@/components/AdvancedFilter";
import ProfessionalClaimsTable from "@/components/ProfessionalClaimsTable";
import { Search } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface Claim {
  claim_id: string;
  patient_name: string;
  hospital: string;
  package: string;
  claimed_amount: number;
  status: string;
  confidence: number;
  los_days: number;
  complexity: number;
  extra_docs: number;
}

export default function ClaimsList() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("mock");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    priorityLevel: "",
    amountRange: [0, 500000],
    assignedTo: "",
    dateRange: "all",
    confidence: [0, 1],
  });

  useEffect(() => {
    fetchClaims();
  }, [mode]);

  useEffect(() => {
    applyFilters();
  }, [claims, filters, searchTerm]);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/claims/list?mode=${mode}&limit=100`);
      const data = await res.json();
      setClaims(data);
    } catch (error) {
      console.error("Failed to fetch claims:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = claims.filter((claim) => {
      // Search filter
      if (
        searchTerm &&
        !claim.claim_id.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !claim.patient_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false;

      // Status filter
      if (filters.status && claim.status.toLowerCase() !== filters.status.toLowerCase())
        return false;

      // Amount range filter
      if (
        claim.claimed_amount < filters.amountRange[0] ||
        claim.claimed_amount > filters.amountRange[1]
      )
        return false;

      // Confidence filter
      if (claim.confidence < filters.confidence[0] || claim.confidence > filters.confidence[1])
        return false;

      return true;
    });

    setFilteredClaims(filtered);
  };

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      status: "",
      priorityLevel: "",
      amountRange: [0, 500000],
      assignedTo: "",
      dateRange: "all",
      confidence: [0, 1],
    });
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <ProfessionalNavbar />

      <main className="pt-20 md:pt-20 md:pl-64">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 md:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Claims</h1>
              <p className="text-blue-100">Browse and manage all claims with advanced filters</p>
            </div>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              <option value="mock">Mock Data</option>
              <option value="live">Live Data</option>
            </select>
          </div>
        </div>

        <div className="px-6 md:px-8 py-8 space-y-6">
          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
              <Search size={20} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search by Claim ID or Patient Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-500"
              />
            </div>
          </div>

          {/* Advanced Filter */}
          <AdvancedFilter onApply={handleApplyFilters} onClear={handleClearFilters} />

          {/* Claims Table */}
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading claims...</p>
            </div>
          ) : filteredClaims.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500 text-lg">No claims found matching your filters</p>
            </div>
          ) : (
            <ProfessionalClaimsTable claims={filteredClaims} />
          )}
        </div>
      </main>
    </div>
  );
}
