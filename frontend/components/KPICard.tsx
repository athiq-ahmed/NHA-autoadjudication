"use client";

interface KPICardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: string;
  color?: "blue" | "green" | "red" | "yellow";
}

export default function KPICard({
  label,
  value,
  icon,
  trend,
  color = "blue",
}: KPICardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    red: "bg-red-50 text-red-600 border-red-200",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
  };

  return (
    <div className={`card p-6 border-l-4 ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
            {label}
          </p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {trend && <p className="text-xs text-gray-500 mt-2">{trend}</p>}
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  );
}
