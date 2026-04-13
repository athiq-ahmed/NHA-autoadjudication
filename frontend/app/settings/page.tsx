"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import {
  Settings as SettingsIcon,
  Save,
  Bell,
  Moon,
  Eye,
  Lock,
  Zap,
  AlertCircle,
} from "lucide-react";

export default function Settings() {
  const [settings, setSettings] = useState({
    mode: "mock",
    theme: "light",
    notifications: true,
    autoApprove: false,
    confidenceThreshold: 0.8,
    showAdvanced: false,
    rowsPerPage: 20,
    language: "en",
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const stored = localStorage.getItem("adjudication_settings");
    if (stored) {
      setSettings(JSON.parse(stored));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("adjudication_settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    const defaults = {
      mode: "mock",
      theme: "light",
      notifications: true,
      autoApprove: false,
      confidenceThreshold: 0.8,
      showAdvanced: false,
      rowsPerPage: 20,
      language: "en",
    };
    setSettings(defaults);
    localStorage.setItem("adjudication_settings", JSON.stringify(defaults));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex min-h-screen">
      <Navbar />

      <main className="flex-1 lg:ml-64">
        {/* Header */}
        <div className="header">
          <h1 className="text-4xl font-bold mb-2">Settings</h1>
          <p className="text-blue-100">Manage your preferences and application configuration</p>
        </div>

        <div className="container-main py-8">
          <div className="max-w-2xl">
            {/* Success Message */}
            {saved && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white text-sm">
                  ✓
                </div>
                <p className="text-green-800 font-semibold">Settings saved successfully</p>
              </div>
            )}

            {/* Environment Settings */}
            <div className="card p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Zap className="text-blue-600" size={24} /> Environment
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Operation Mode
                  </label>
                  <select
                    value={settings.mode}
                    onChange={(e) =>
                      setSettings({ ...settings, mode: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="mock">Mock Mode (Test Data)</option>
                    <option value="live">Live Mode (Production)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Mock mode uses test data for development. Live mode connects to production database.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) =>
                      setSettings({ ...settings, language: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिंदी (Hindi)</option>
                    <option value="ta">தமிழ் (Tamil)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Display Settings */}
            <div className="card p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Eye className="text-green-600" size={24} /> Display
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.theme === "dark"}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          theme: e.target.checked ? "dark" : "light",
                        })
                      }
                      className="w-5 h-5 rounded border-gray-300 cursor-pointer"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">Dark Mode</p>
                      <p className="text-xs text-gray-500">
                        Enable dark theme for reduced eye strain
                      </p>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rows Per Page
                  </label>
                  <select
                    value={settings.rowsPerPage}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        rowsPerPage: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value={10}>10 rows</option>
                    <option value={20}>20 rows</option>
                    <option value={50}>50 rows</option>
                    <option value={100}>100 rows</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showAdvanced}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          showAdvanced: e.target.checked,
                        })
                      }
                      className="w-5 h-5 rounded border-gray-300 cursor-pointer"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">
                        Show Advanced Options
                      </p>
                      <p className="text-xs text-gray-500">
                        Display advanced filtering and analysis tools
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="card p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Bell className="text-orange-600" size={24} /> Notifications
              </h2>

              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) =>
                      setSettings({ ...settings, notifications: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-gray-300 cursor-pointer"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">
                      Enable Notifications
                    </p>
                    <p className="text-xs text-gray-500">
                      Receive alerts for important claim status updates
                    </p>
                  </div>
                </label>

                <div className="pl-8 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      disabled={!settings.notifications}
                      className="w-4 h-4 rounded border-gray-300 cursor-pointer disabled:opacity-50"
                    />
                    <span className="text-sm text-gray-700">
                      Manual review required
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      disabled={!settings.notifications}
                      className="w-4 h-4 rounded border-gray-300 cursor-pointer disabled:opacity-50"
                    />
                    <span className="text-sm text-gray-700">
                      Rejection alerts
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      disabled={!settings.notifications}
                      className="w-4 h-4 rounded border-gray-300 cursor-pointer disabled:opacity-50"
                    />
                    <span className="text-sm text-gray-700">
                      Daily summary report
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Adjudication Settings */}
            <div className="card p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Lock className="text-red-600" size={24} /> Adjudication
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confidence Threshold
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.confidenceThreshold}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          confidenceThreshold: parseFloat(e.target.value),
                        })
                      }
                      className="flex-1"
                    />
                    <span className="text-2xl font-bold text-blue-600 min-w-fit">
                      {(settings.confidenceThreshold * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Claims below this confidence score will require manual review
                  </p>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoApprove}
                    onChange={(e) =>
                      setSettings({ ...settings, autoApprove: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-gray-300 cursor-pointer"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">Auto-Approve High Confidence</p>
                    <p className="text-xs text-gray-500">
                      Automatically approve claims above confidence threshold (requires admin approval)
                    </p>
                  </div>
                </label>

                {settings.autoApprove && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={18} />
                    <p className="text-sm text-yellow-800">
                      Auto-approval is <strong>disabled in mock mode</strong> for safety. Enable it in live mode through admin settings.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                className="btn-primary flex items-center gap-2"
              >
                <Save size={18} /> Save Settings
              </button>
              <button
                onClick={handleReset}
                className="btn-secondary flex items-center gap-2"
              >
                Reset to Defaults
              </button>
            </div>

            {/* About Section */}
            <div className="card p-6 mt-8 bg-blue-50 border-blue-200">
              <h3 className="text-lg font-bold text-blue-900 mb-2">About This Application</h3>
              <p className="text-sm text-blue-800 mb-2">
                NHA Claims Auto-Adjudication System v1.0
              </p>
              <p className="text-xs text-blue-700">
                Built for National Health Authority (NHA) hackathon. This system uses AI-powered rules
                engine with temporal validation to streamline healthcare claim adjudication.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
