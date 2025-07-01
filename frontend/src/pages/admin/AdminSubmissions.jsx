import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { FileText } from "lucide-react";
import { fetchExamSubmissions } from "../../services/api";

const dummySubmissions = [
  {
    user_name: "Khyati Shah",
    course_title: "NFPA Level 1",
    chapter_title: "Fire Basics",
    score: 85,
    timestamp: "2025-06-29T14:45:00.000Z",
  },
  {
    user_name: "Raj Patel",
    course_title: "NFPA Level 2",
    chapter_title: "Hazard Handling",
    score: 70,
    timestamp: "2025-06-28T12:20:00.000Z",
  },
];

const AdminSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
  fetchExamSubmissions().then(setSubmissions);
  console.log("Fetched submissions:", submissions);
  }, []);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center mb-6">
          <FileText className="w-8 h-8 text-red-500 mr-2" />
          <h1 className="text-3xl font-bold text-gray-900">Exam Submissions</h1>
        </div>

        <div className="overflow-auto rounded-lg shadow ring-1 ring-black ring-opacity-5">
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-gradient-to-r from-red-50 to-orange-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-600">👤 User</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-600">📘 Course</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-600">📖 Chapter</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-600">🏆 Score</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-600">🕒 Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {submissions.map((s, i) => (
                <tr key={i} className="hover:bg-red-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{s.user_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{s.course_title}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{s.chapter_title}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-blue-700">{s.score}%</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(s.timestamp).toLocaleDateString()}{" "}
                    <span className="text-xs text-gray-400">
                      ({new Date(s.timestamp).toLocaleTimeString()})
                    </span>
                  </td>
                </tr>
              ))}
              {submissions.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center px-6 py-6 text-gray-400">
                    No submissions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default AdminSubmissions;
