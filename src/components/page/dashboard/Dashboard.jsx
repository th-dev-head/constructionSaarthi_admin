import { useState, useEffect, useRef } from "react";
import {
  Users, UserCheck, UserX, TrendingUp,
  Briefcase, Layout, CheckCircle,
  CreditCard, IndianRupee, Ticket,
  Zap, MousePointerClick, Loader2,
  TrendingDown, Activity, Calendar
} from "lucide-react";
import { apiInstance } from "../../../config/axiosInstance";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarElement
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import CustomSelect from "../../../components/common/CustomSelect";
import CustomDatePicker from "../../../components/common/CustomDatePicker";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roles, setRoles] = useState([]);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    roleId: "all"
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  const fetchRoles = async () => {
    try {
      const response = await apiInstance.get("/api/admin/getAllRole");
      if (response.data.status === 200) {
        setRoles(response.data.roles || []);
      }
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) {
        params.append("startDate", filters.startDate.toISOString().split('T')[0]);
      }
      if (filters.endDate) {
        params.append("endDate", filters.endDate.toISOString().split('T')[0]);
      }
      if (filters.roleId !== "all") params.append("roleId", filters.roleId);

      const response = await apiInstance.get(`/api/dashboard/admin?${params.toString()}`);
      if (response.data.success && response.data.data) {
        setDashboardData(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch dashboard data");
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.response?.data?.message || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      startDate: null,
      endDate: null,
      roleId: "all"
    });
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-accent" size={48} />
        <span className="mt-4 text-gray-600 font-medium">Preparing your insights...</span>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-2xl mx-auto mt-10">
        <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Activity className="text-red-600" size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h3>
        <p className="text-red-700 mb-6">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-6 py-2.5 bg-accent text-white rounded-xl font-semibold hover:bg-[#d93a0e] transition-colors shadow-lg shadow-red-900/20"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Fallback data if API fields are missing (just for structure safety)
  const stats = dashboardData || {};

  const roleOptions = [
    { value: "all", label: "All Roles" },
    ...roles.map(r => ({ value: r.id, label: r.name.charAt(0).toUpperCase() + r.name.slice(1) }))
  ];

  return (
    <div className="space-y-4 md:space-y-6 px-4 lg:px-10 py-4 md:py-8 bg-[#F8FAFC] w-full min-h-screen" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Real-time performance metrics and user insights</p>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[180px]">
            <CustomSelect
              label="Role"
              placeholder="Select Role"
              options={roleOptions}
              value={filters.roleId}
              onChange={(val) => updateFilter("roleId", val)}
            />
          </div>

          <div className="min-w-[180px]">
            <CustomDatePicker
              label="From"
              placeholderText="Start Date"
              selected={filters.startDate}
              onChange={(date) => updateFilter("startDate", date)}
            />
          </div>

          <div className="min-w-[180px]">
            <CustomDatePicker
              label="To"
              placeholderText="End Date"
              selected={filters.endDate}
              onChange={(date) => updateFilter("endDate", date)}
            />
          </div>

          <div className="pb-1">
            <button
              onClick={resetFilters}
              className="p-3 text-gray-400 hover:text-accent hover:bg-accent/5 rounded-xl transition-all border border-gray-100"
              title="Reset Filters"
            >
              <Activity size={20} />
            </button>
          </div>
        </div>
      </div>

      {loading && dashboardData && (
        <div className="flex items-center gap-2 text-accent font-medium text-sm animate-pulse mb-4">
          <Loader2 size={16} className="animate-spin" />
          Updating statistics...
        </div>
      )}

      {/* User Statistics */}
      <section className="mb-10">
        <div className="flex items-center mb-5 gap-2">
          <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
          <h2 className="text-xl font-bold text-gray-800">User Insights</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats.users?.total || 0}
            icon={<Users className="text-blue-600" />}
            color="blue"
            description="Total registered users"
          />
          <StatCard
            title="Active Users"
            value={stats.users?.active || 0}
            icon={<UserCheck className="text-green-600" />}
            color="green"
            description="Currently active"
          />
          <StatCard
            title="Suspended"
            value={(stats.users?.total || 0) - (stats.users?.active || 0)}
            icon={<UserX className="text-red-600" />}
            color="red"
            description="Account restrictions"
          />
          <StatCard
            title="New Users"
            value={stats.users?.newLast30Days || 0}
            icon={<TrendingUp className="text-purple-600" />}
            color="purple"
            description="Last 30 days"
          />
          <StatCard
            title="Trial Users"
            value={stats.users?.inTrial || 0}
            icon={<Zap className="text-amber-600" />}
            color="amber"
            description="Users in active trial"
          />
        </div>
      </section>

      {/* Project & Workspace Statistics */}
      <section className="mb-10">
        <div className="flex items-center mb-5 gap-2">
          <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
          <h2 className="text-xl font-bold text-gray-800">Projects & Workspaces</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Projects"
            value={stats.projects?.total || 0}
            icon={<Briefcase className="text-amber-600" />}
            color="amber"
            extra={
              <div className="flex gap-3 mt-2">
                <span className="text-xs font-medium px-2 py-1 bg-green-50 text-green-700 rounded-md">
                  {stats.projects?.active || 0} Active
                </span>
                <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
                  {stats.projects?.completed || 0} Done
                </span>
              </div>
            }
          />
          <StatCard
            title="Total Workspaces"
            value={stats.workspaces?.total || 0}
            icon={<Layout className="text-indigo-600" />}
            color="indigo"
            description="Active collaboration spaces"
          />
          <div className="lg:col-span-1 bg-[#B02E0C] rounded-3xl p-6 text-white shadow-xl shadow-red-900/20 flex flex-col justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Quick Summary</p>
              <h3 className="text-2xl font-bold mt-1">Construction Progress</h3>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span>Active Projects</span>
                <span className="font-bold">{stats.projects?.active || 0}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1.5">
                <div
                  className="bg-white h-1.5 rounded-full"
                  style={{ width: `${Math.round(((stats.projects?.active || 0) / (stats.projects?.total || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription & Revenue */}
      <section className="mb-10">
        <div className="flex items-center mb-5 gap-2">
          <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
          <h2 className="text-xl font-bold text-gray-800">Revenue & Subscriptions</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard
                title="Active Subscriptions"
                value={stats.subscriptions?.activeSubscriptions || 0}
                icon={<CreditCard className="text-white" />}
                color="brand"
                variant="filled"
                description={`Total Orders: ${stats.subscriptions?.totalOrders || 0}`}
              />
              <StatCard
                title="Overall Revenue"
                value={`₹${parseFloat(stats.subscriptions?.totalRevenue || 0).toLocaleString()}`}
                icon={<IndianRupee className="text-white" />}
                color="brand"
                variant="filled"
                description="Lifetime collection"
              />
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800">Revenue Trends</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-[#B02E0C] rounded-full"></div>
                    <span className="text-xs text-gray-500 font-medium">Monthly Revenue</span>
                  </div>
                </div>
              </div>
              <div style={{ height: '300px', position: 'relative' }}>
                <RevenueChart data={stats.revenueTrends || []} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-accent/5 rounded-2xl">
                  <Ticket className="text-accent" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Coupon Tracking</h3>
              </div>

              <div className="space-y-5 flex-grow">
                <div className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Total Available</p>
                    <p className="text-xl font-bold text-gray-900">{stats.coupons?.total || 0}</p>
                  </div>
                  <Ticket className="text-gray-300" size={32} />
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Active Now</p>
                    <p className="text-xl font-bold text-green-600">{stats.coupons?.active || 0}</p>
                  </div>
                  <Zap className="text-green-300" size={32} />
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Usage Count</p>
                    <p className="text-xl font-bold text-gray-900">{stats.coupons?.totalUsage || 0}</p>
                  </div>
                  <MousePointerClick className="text-gray-300" size={32} />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-gray-500">Coupon Effectiveness</span>
                  <span className="text-accent">High</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Enhanced Stat Card Component
const StatCard = ({ title, value, icon, color, trend, description, extra, variant }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 ring-blue-50",
    green: "bg-green-50 text-green-600 ring-green-50",
    red: "bg-red-50 text-red-600 ring-red-50",
    purple: "bg-purple-50 text-purple-600 ring-purple-50",
    amber: "bg-amber-50 text-amber-600 ring-amber-50",
    indigo: "bg-indigo-50 text-indigo-600 ring-indigo-50",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-50",
    rose: "bg-accent/5 text-accent ring-accent/10",
    teal: "bg-teal-50 text-teal-600 ring-teal-50",
    brand: "bg-[#B02E0C]/10 text-[#B02E0C] ring-[#B02E0C]/20",
  };

  const isFilled = variant === "filled";

  return (
    <div className={`p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1 ${isFilled ? "bg-[#B02E0C] text-white border-transparent" : "bg-white"}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${isFilled ? "bg-white/20 text-white ring-white/10" : colorClasses[color]} ring-4`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${trend === "up" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {trend === "up" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {value}
          </div>
        )}
      </div>
      <div>
        <h3 className={`text-sm font-medium ${isFilled ? "text-white/80" : "text-gray-500"}`}>{title}</h3>
        <p className={`text-3xl font-extrabold mt-1 tracking-tight tabular-nums ${isFilled ? "text-white" : "text-gray-900"}`}>{value}</p>
        {description && <p className={`text-xs mt-2 font-medium ${isFilled ? "text-white/60" : "text-gray-400"}`}>{description}</p>}
        {extra && <div className="mt-1">{extra}</div>}
      </div>
    </div>
  );
};

// Gradient plugin at FILE LEVEL — stable reference, Chart.js won't re-register per render
// beforeDraw guarantees chartArea exists when gradient is created (no flicker/fallback needed)
const gradientPlugin = {
  id: 'revenueGradientFill',
  beforeDraw(chart) {
    const { ctx, chartArea, data: chartData } = chart;
    if (!chartArea) return;
    const dataset = chartData.datasets[0];
    if (!dataset) return;
    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0, 'rgba(176, 46, 12, 0.22)');
    gradient.addColorStop(1, 'rgba(176, 46, 12, 0.01)');
    dataset.backgroundColor = gradient;
  },
};

// Revenue Trend Chart Component
const RevenueChart = ({ data }) => {
  const chartRef = useRef(null);

  const formatMonth = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const hasData = Array.isArray(data) && data.length > 0;
  const revenueValues = hasData ? data.map(item => parseFloat(item.revenue) || 0) : [0];
  const labels = hasData ? data.map(item => formatMonth(item.month)) : ['No Data'];


  const chartData = {
    labels,
    datasets: [
      {
        label: 'Monthly Revenue',
        data: revenueValues,
        fill: true,
        backgroundColor: 'rgba(176, 46, 12, 0.1)', // initial solid fallback, plugin overrides
        borderColor: '#B02E0C',
        borderWidth: 3,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#B02E0C',
        pointBorderWidth: 2,
        pointRadius: hasData ? 5 : 0,
        pointHoverRadius: 7,
        tension: hasData && data.length > 1 ? 0.4 : 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    // Fix: animation disabled — gradient + animation causes incomplete first paint
    animation: false,
    layout: {
      padding: { top: 10, right: 10 }, // prevent top data point from clipping
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1f2937',
        padding: 12,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 13 },
        displayColors: false,
        callbacks: {
          // Fix: title is the correct key in Chart.js 4.x callbacks (not a conflict)
          title: (items) => items[0]?.label ?? '',
          label: (ctx) => ` ₹${ctx.parsed.y.toLocaleString('en-IN')}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 12, weight: '500' },
          color: '#9ca3af',
          maxRotation: 0,
        },
        // Fix: border.display:false is the Chart.js 4.x way (drawBorder is deprecated)
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        suggestedMax: hasData ? Math.max(...revenueValues) * 1.15 : undefined,
        grid: {
          color: '#f3f4f6',
          // Fix: removed deprecated drawBorder:false, border.display:false used below
        },
        ticks: {
          font: { size: 12, weight: '500' },
          color: '#9ca3af',
          padding: 8,
          maxTicksLimit: 7,
          callback(value) {
            if (value >= 100000) return '₹' + (value / 100000).toFixed(1) + 'L';
            if (value >= 1000) return '₹' + Number(value).toLocaleString('en-IN');
            return '₹' + value;
          },
        },
        border: { display: false },
      },
    },
  };

  if (!hasData) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="mb-3 opacity-30" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-sm font-medium">No revenue data available yet</p>
      </div>
    );
  }

  // Gradient plugin defined at file level (stable reference, no re-registration per render)
  return (
    <Line
      ref={chartRef}
      data={chartData}
      options={options}
      plugins={[gradientPlugin]}
      style={{ width: '100% !important', height: '100% !important' }}
    />
  );
};

export default Dashboard;
