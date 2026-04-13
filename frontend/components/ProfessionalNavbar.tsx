"use client";

import { useState } from "react";
import {
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  Settings,
  LogOut,
  User,
  Clock,
} from "lucide-react";

export default function ProfessionalNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const notifications = [
    { id: 1, message: "Claim CN001 approved", time: "2 min ago", type: "success" },
    { id: 2, message: "3 claims pending review", time: "15 min ago", type: "warning" },
    { id: 3, message: "Database backup complete", time: "1 hour ago", type: "info" },
  ];

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 z-50 shadow-lg">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 min-w-fit">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">NHA</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Claims Hub</h1>
              <p className="text-xs text-gray-400">Auto-Adjudication AI</p>
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search claims, patients, hospitals..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:bg-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-30 transition-all"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Bell size={22} />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full shadow-lg"></span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl">
                  <div className="p-4 border-b border-gray-700 bg-gray-900">
                    <h3 className="font-semibold text-white">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="px-4 py-3 border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors"
                      >
                        <p className="text-sm text-gray-100">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Clock size={12} />
                          {notif.time}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-gray-700 bg-gray-900 text-center">
                    <button className="text-blue-400 text-sm font-medium hover:text-blue-300">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <a
              href="/settings"
              className="p-2.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Settings size={22} />
            </a>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 text-gray-200 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                  AJ
                </div>
                <span className="text-sm font-medium hidden sm:inline">Admin</span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl">
                  <div className="p-4 border-b border-gray-700 bg-gray-900">
                    <p className="text-sm font-semibold text-white">John Adjudicator</p>
                    <p className="text-xs text-gray-400">Senior Claims Officer</p>
                  </div>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white flex items-center gap-2 transition-colors">
                    <User size={16} /> Profile
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900 hover:text-red-300 flex items-center gap-2 border-t border-gray-700 transition-colors">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden px-6 py-2 border-t border-gray-700 bg-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </nav>

      {/* Sidebar Navigation - Desktop */}
      <aside className="hidden md:flex fixed left-0 top-20 bottom-0 w-64 bg-gradient-to-b from-gray-900 to-gray-950 border-r border-gray-700 flex-col shadow-xl">
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <NavItem href="/" icon="DB" label="Dashboard" active />
          <NavItem href="/claims" icon="CL" label="Claims" />
          <NavItem href="/analytics" icon="AN" label="Analytics" />
          <NavItem href="/documents" icon="DO" label="Documents" />
          <NavItem href="/team" icon="TM" label="Team" />
          <NavItem href="/reports" icon="RP" label="Reports" />
          <NavItem href="/settings" icon="ST" label="Settings" />
        </nav>
        <div className="p-4 border-t border-gray-700 bg-gray-900">
          <div className="text-xs text-gray-500 mb-2 uppercase font-semibold">Status</div>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-gray-300">System Operational</span>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden top-20">
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-gray-900 border-r border-gray-700">
            <nav className="flex flex-col p-3 space-y-1">
              <NavItem href="/" icon="DB" label="Dashboard" active />
              <NavItem href="/claims" icon="CL" label="Claims" />
              <NavItem href="/analytics" icon="AN" label="Analytics" />
              <NavItem href="/documents" icon="DO" label="Documents" />
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

function NavItem({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <a
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
        active
          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg border-l-4 border-blue-400"
          : "text-gray-300 hover:bg-gray-800 hover:text-white"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </a>
  );
}
