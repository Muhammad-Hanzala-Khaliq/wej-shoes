"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/ToastProvider";

const STATUS_OPTIONS = ["NEW", "REPLIED", "CLOSED"];

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }) {
  const styles = {
    NEW: "bg-blue-50 text-blue-700 border-blue-200",
    REPLIED: "bg-green-50 text-green-700 border-green-200",
    CLOSED: "bg-gray-100 text-gray-600 border-gray-200",
  };

  return (
    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${styles[status] || styles.NEW}`}>
      {status}
    </span>
  );
}

export default function ContactSubmissionsClient({ initialSubmissions }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [updatingId, setUpdatingId] = useState(null);

  // Resync when server pushes new props (e.g., after router.refresh)
  useEffect(() => {
    setSubmissions(initialSubmissions);
  }, [initialSubmissions]);

  async function handleStatusChange(id, newStatus) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/contact/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        showToast("Failed to update status", "error");
        return;
      }

      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
      );
      showToast("Status updated", "success");
      router.refresh();
    } catch {
      showToast("Failed to update status", "error");
    } finally {
      setUpdatingId(null);
    }
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg font-medium">No submissions yet</p>
        <p className="text-sm mt-1">Contact form messages will appear here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Subject</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Message</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub) => (
              <tr key={sub.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{sub.name}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  <a href={`mailto:${sub.email}`} className="hover:underline">
                    {sub.email}
                  </a>
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{sub.subject}</td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell max-w-xs truncate">
                  {sub.message.length > 80 ? sub.message.substring(0, 80) + "..." : sub.message}
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(sub.createdAt)}</td>
                <td className="px-4 py-3">
                  <select
                    value={sub.status}
                    onChange={(e) => handleStatusChange(sub.id, e.target.value)}
                    disabled={updatingId === sub.id}
                    className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-gray-300 disabled:opacity-50"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
