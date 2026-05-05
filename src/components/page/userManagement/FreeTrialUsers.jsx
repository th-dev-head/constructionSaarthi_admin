import { useState, useEffect } from "react";
import { apiInstance } from "../../../config/axiosInstance";
import { Loader2, Users, Calendar, Calculator, Clock } from "lucide-react";

const FreeTrialUsers = () => {
  const [trialUsers, setTrialUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrialUsers();
  }, []);

  const fetchTrialUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiInstance.get("/api/dashboard/admin/free-trial-users");
      if (response.data.success) {
        setTrialUsers(response.data.trialUsers);
      } else {
        setError("Failed to fetch trial users");
      }
    } catch (err) {
      console.error("Error fetching trial users:", err);
      setError(err.response?.data?.message || "Failed to fetch trial users");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-[#FB4211]" size={48} />
        <span className="mt-4 text-gray-600 font-medium">Loading trial users...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-2xl mx-auto mt-10">
        <p className="text-red-700 mb-6">{error}</p>
        <button
          onClick={fetchTrialUsers}
          className="px-6 py-2 bg-[#FB4211] text-white rounded-xl font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-[#F8FAFC] min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F172A] flex items-center gap-3">
          <Users className="text-[#FB4211]" /> Active Free Trial Users
        </h1>
        <p className="text-gray-500 mt-1">Monitor users currently in their free trial period.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="p-5 font-semibold text-gray-600">User Details</th>
                <th className="p-5 font-semibold text-gray-600 text-center">Remaining</th>
                <th className="p-5 font-semibold text-gray-600 text-center">Members</th>
                <th className="p-5 font-semibold text-gray-600 text-center">Calculations</th>
                <th className="p-5 font-semibold text-gray-600">Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {trialUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-400">
                    No users currently in trial period.
                  </td>
                </tr>
              ) : (
                trialUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                    <td className="p-5">
                      <div>
                        <p className="font-bold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.phone}</p>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        user.daysRemaining <= 2 
                          ? 'bg-red-50 text-red-600' 
                          : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        <Clock size={14} />
                        {user.daysRemaining} Days
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-bold">
                        {user.memberCount}
                      </span>
                    </td>
                    <td className="p-5 text-center">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-purple-50 text-purple-600 font-bold">
                        {user.calculationCount}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Calendar size={14} />
                        {new Date(user.joinedAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FreeTrialUsers;
