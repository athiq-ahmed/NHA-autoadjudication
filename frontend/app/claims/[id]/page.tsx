"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  ChevronLeft,
  Calendar,
  MapPin,
  Stethoscope,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  User,
  Building,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface ClaimDetail {
  claim_id: string;
  patient_name: string;
  patient_age: number;
  patient_gender: string;
  hospital: string;
  admission_date: string;
  discharge_date: string;
  diagnosis: string;
  procedures: string[];
  package: string;
  stg_amount: number;
  claimed_amount: number;
  approved_amount?: number;
  status: string;
  confidence: number;
  los_days: number;
  complexity: number;
  extra_docs: number;
}

interface ValidationRule {
  category: string;
  rule: string;
  status: "pass" | "fail" | "warning";
  details: string;
}

interface Timeline {
  date: string;
  event: string;
  actor: string;
}

export default function ClaimDetail({ params }: { params: { id: string } }) {
  const [claim, setClaim] = useState<ClaimDetail | null>(null);
  const [rules, setRules] = useState<ValidationRule[]>([]);
  const [timeline, setTimeline] = useState<Timeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [notesText, setNotesText] = useState("");

  useEffect(() => {
    fetchClaimDetail();
    fetchClaimRules();
    fetchClaimTimeline();
  }, [params.id]);

  const fetchClaimDetail = async () => {
    try {
      const res = await fetch(`${API_URL}/claims/${params.id}`);
      const data = await res.json();
      setClaim(data);
    } catch (error) {
      console.error("Failed to fetch claim details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClaimRules = async () => {
    try {
      const res = await fetch(`${API_URL}/claims/${params.id}/rules`);
      const data = await res.json();
      setRules(data);
    } catch (error) {
      console.error("Failed to fetch rules:", error);
    }
  };

  const fetchClaimTimeline = async () => {
    try {
      const res = await fetch(`${API_URL}/claims/${params.id}/timeline`);
      const data = await res.json();
      setTimeline(data);
    } catch (error) {
      console.error("Failed to fetch timeline:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pass":
        return "bg-green-100 text-green-800 border-green-200";
      case "conditional":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "fail":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRuleStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="text-green-600" size={20} />;
      case "fail":
        return <AlertCircle className="text-red-600" size={20} />;
      case "warning":
        return <AlertCircle className="text-yellow-600" size={20} />;
      default:
        return <Clock size={20} />;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Navbar />
        <main className="flex-1 lg:ml-64 container-main py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading claim details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="flex min-h-screen">
        <Navbar />
        <main className="flex-1 lg:ml-64 container-main py-12">
          <div className="text-center">
            <AlertCircle size={48} className="mx-auto text-red-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Claim Not Found
            </h2>
            <Link href="/claims" className="btn-primary">
              Back to Claims
            </Link>
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
          <Link href="/claims" className="flex items-center gap-2 text-blue-100 hover:text-white mb-4 transition-colors">
            <ChevronLeft size={20} /> Back to Claims
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2">{claim.claim_id}</h1>
              <p className="text-blue-100">
                {claim.patient_name} • {claim.hospital}
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-lg font-semibold text-lg ${getStatusColor(claim.status)}`}
            >
              {claim.status.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="container-main py-8">
          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            {["overview", "validation", "timeline", "notes"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-semibold transition-colors ${
                  activeTab === tab
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Patient & Hospital Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <User size={20} /> Patient Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {claim.patient_name}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Age</p>
                        <p className="text-lg font-semibold text-gray-800">
                          {claim.patient_age} years
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Gender</p>
                        <p className="text-lg font-semibold text-gray-800">
                          {claim.patient_gender}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Diagnosis</p>
                      <p className="text-gray-800">{claim.diagnosis}</p>
                    </div>
                  </div>
                </div>

                <div className="card p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Building size={20} /> Hospital Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Hospital Name</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {claim.hospital}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Calendar size={14} /> Admission
                        </p>
                        <p className="text-gray-800">
                          {new Date(claim.admission_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Calendar size={14} /> Discharge
                        </p>
                        <p className="text-gray-800">
                          {new Date(claim.discharge_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Length of Stay</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {claim.los_days} days
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Procedures */}
              <div className="card p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Stethoscope size={20} /> Procedures
                </h3>
                <div className="space-y-2">
                  {claim.procedures.map((proc, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-gray-800"
                    >
                      {proc}
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6">
                  <p className="text-sm text-gray-600 flex items-center gap-2 mb-2">
                    <DollarSign size={16} /> STG Amount
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    ₹{claim.stg_amount.toLocaleString()}
                  </p>
                </div>
                <div className="card p-6">
                  <p className="text-sm text-gray-600 flex items-center gap-2 mb-2">
                    <DollarSign size={16} /> Claimed Amount
                  </p>
                  <p className="text-3xl font-bold text-orange-600">
                    ₹{claim.claimed_amount.toLocaleString()}
                  </p>
                </div>
                <div className="card p-6">
                  <p className="text-sm text-gray-600 flex items-center gap-2 mb-2">
                    <FileText size={16} /> Confidence Score
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {(claim.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              {/* Metadata */}
              <div className="card p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Metrics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">
                      {claim.complexity}
                    </p>
                    <p className="text-sm text-gray-600">Complexity</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">
                      {claim.extra_docs}
                    </p>
                    <p className="text-sm text-gray-600">Extra Docs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {claim.package}
                    </p>
                    <p className="text-sm text-gray-600">Package Type</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Validation Tab */}
          {activeTab === "validation" && (
            <div className="space-y-4">
              {rules.length === 0 ? (
                <div className="card p-6 text-center text-gray-500">
                  No validation rules available
                </div>
              ) : (
                rules.map((rule, idx) => (
                  <div key={idx} className="card p-6 border-l-4">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {getRuleStatusIcon(rule.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-gray-800">
                            {rule.category}: {rule.rule}
                          </h4>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              rule.status === "pass"
                                ? "bg-green-100 text-green-800"
                                : rule.status === "fail"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {rule.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-600">{rule.details}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === "timeline" && (
            <div className="card p-6">
              <div className="space-y-4">
                {timeline.length === 0 ? (
                  <div className="text-center text-gray-500">
                    No timeline events available
                  </div>
                ) : (
                  timeline.map((event, idx) => (
                    <div key={idx} className="flex gap-4 pb-4 border-b last:border-b-0">
                      <div className="min-w-fit">
                        <div className="w-3 h-3 rounded-full bg-blue-600 mt-2"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">
                          {new Date(event.date).toLocaleString()}
                        </p>
                        <p className="text-gray-800 font-semibold">{event.event}</p>
                        <p className="text-sm text-gray-500">by {event.actor}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === "notes" && (
            <div className="card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Adjudication Notes
              </h3>
              <textarea
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="Add your notes here..."
                className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              />
              <div className="flex gap-4 mt-4">
                <button className="btn-primary">Save Notes</button>
                <button className="btn-secondary">Discard</button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {activeTab === "overview" && (
            <div className="flex gap-4 mt-8">
              <button className="btn-primary px-6">Approve Claim</button>
              <button className="btn-secondary px-6">Request More Info</button>
              <button className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                Reject Claim
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
