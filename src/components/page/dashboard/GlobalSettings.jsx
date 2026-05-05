import { useState, useEffect } from "react";
import { apiInstance } from "../../../config/axiosInstance";
import { Loader2, Settings, Save, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

const GlobalSettings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states for new/update
  const [newSetting, setNewSetting] = useState({ key: "", value: "", description: "" });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await apiInstance.get("/api/global-settings");
      if (response.data.success) {
        setSettings(response.data.settings);
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (key, value, description) => {
    setSaving(true);
    try {
      const response = await apiInstance.post("/api/global-settings/update", {
        key,
        value,
        description
      });
      if (response.data.success) {
        toast.success(`${key} updated successfully`);
        fetchSettings();
      }
    } catch (err) {
      console.error("Error updating setting:", err);
      toast.error("Failed to update setting");
    } finally {
      setSaving(false);
    }
  };

  const handleAddDefaultSettings = async () => {
    setSaving(true);
    try {
      const defaults = [
        // { key: "TRIAL_DAYS", value: "7", description: "Number of days for free trial" },
        { key: "TRIAL_CALCULATIONS", value: "-1", description: "Number of free calculations (-1 for unlimited)" },
        { key: "TRIAL_MEMBER_LIMIT", value: "-1", description: "Number of members allowed during trial (-1 for unlimited)" },
        // { key: "FREE_MEMBER_LIMIT", value: "3", description: "Number of free members allowed after trial (without subscription)" }
      ];

      const response = await apiInstance.post("/api/global-settings/bulk-update", {
        settings: defaults
      });

      if (response.data.success) {
        toast.success("Default settings initialized");
        fetchSettings();
      }
    } catch (err) {
      console.error("Error bulk updating settings:", err);
      toast.error("Failed to initialize defaults");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#FB4211]" size={48} /></div>;

  return (
    <div className="p-4 md:p-8 bg-[#F8FAFC] min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] flex items-center gap-3">
            <Settings className="text-[#FB4211]" /> Global System Settings
          </h1>
          <p className="text-gray-500 mt-1">Configure system-wide constants like trial days and calculation limits.</p>
        </div>

      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {/* TRIAL_CALCULATIONS Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-bold rounded uppercase tracking-wider">
                  TRIAL_CALCULATIONS
                </span>
              </div>
              <p className="text-gray-500 text-sm mb-4">Number of free calculations (-1 for unlimited)</p>
              
              <div className="flex items-center gap-4">
                <input 
                  type="text"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 w-full md:w-64 focus:ring-2 focus:ring-[#FB4211] focus:outline-none"
                  defaultValue={settings.find(s => s.key === "TRIAL_CALCULATIONS")?.value || ""}
                  placeholder="null"
                  id="input-TRIAL_CALCULATIONS"
                />
                <button 
                  onClick={() => {
                    const val = document.getElementById("input-TRIAL_CALCULATIONS").value;
                    handleUpdate("TRIAL_CALCULATIONS", val, "Number of free calculations (-1 for unlimited)");
                  }}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-[#FB4211] text-white rounded-xl hover:bg-[#d93a0e] transition-colors disabled:opacity-50"
                >
                  <Save size={18} /> Save
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* TRIAL_MEMBER_LIMIT Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-bold rounded uppercase tracking-wider">
                  TRIAL_MEMBER_LIMIT
                </span>
              </div>
              <p className="text-gray-500 text-sm mb-4">Number of members allowed during trial (-1 for unlimited)</p>
              
              <div className="flex items-center gap-4">
                <input 
                  type="text"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 w-full md:w-64 focus:ring-2 focus:ring-[#FB4211] focus:outline-none"
                  defaultValue={settings.find(s => s.key === "TRIAL_MEMBER_LIMIT")?.value || ""}
                  placeholder="null"
                  id="input-TRIAL_MEMBER_LIMIT"
                />
                <button 
                  onClick={() => {
                    const val = document.getElementById("input-TRIAL_MEMBER_LIMIT").value;
                    handleUpdate("TRIAL_MEMBER_LIMIT", val, "Number of members allowed during trial (-1 for unlimited)");
                  }}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-[#FB4211] text-white rounded-xl hover:bg-[#d93a0e] transition-colors disabled:opacity-50"
                >
                  <Save size={18} /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSettings;
