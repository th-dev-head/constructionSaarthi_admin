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
  const [showAddForm, setShowAddForm] = useState(false);

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

        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#FB4211] text-white rounded-xl hover:bg-[#d93a0e] transition-colors text-sm font-medium shadow-sm"
        >
          {showAddForm ? "Cancel" : "Add New Setting"}
        </button>
      </div>

      {showAddForm && (
        <div className="mb-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-lg font-bold text-[#0F172A] mb-4">Add New Global Setting</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Key</label>
              <input 
                type="text"
                placeholder="e.g. TRIAL_DAYS"
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 w-full focus:ring-2 focus:ring-[#FB4211] focus:outline-none"
                value={newSetting.key}
                onChange={(e) => setNewSetting({...newSetting, key: e.target.value.toUpperCase()})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Value</label>
              <input 
                type="text"
                placeholder="e.g. 7"
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 w-full focus:ring-2 focus:ring-[#FB4211] focus:outline-none"
                value={newSetting.value}
                onChange={(e) => setNewSetting({...newSetting, value: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Description</label>
              <input 
                type="text"
                placeholder="Number of trial days"
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 w-full focus:ring-2 focus:ring-[#FB4211] focus:outline-none"
                value={newSetting.description}
                onChange={(e) => setNewSetting({...newSetting, description: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button 
              onClick={async () => {
                if (!newSetting.key || !newSetting.value) {
                  return toast.error("Key and Value are required");
                }
                await handleUpdate(newSetting.key, newSetting.value, newSetting.description);
                setNewSetting({ key: "", value: "", description: "" });
                setShowAddForm(false);
              }}
              disabled={saving}
              className="flex items-center gap-2 px-8 py-2 bg-[#FB4211] text-white rounded-xl hover:bg-[#d93a0e] transition-colors disabled:opacity-50 font-bold"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Create Setting
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {settings
          .filter((s) => s.key !== "FREE_MEMBER_LIMIT" && s.key !== "TRIAL_DAYS")
          .map((setting) => (
            <div key={setting.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-bold rounded uppercase tracking-wider">
                      {setting.key}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-4">{setting.description}</p>
                  
                  <div className="flex items-center gap-4">
                    <input 
                      type="text"
                      className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 w-full md:w-64 focus:ring-2 focus:ring-[#FB4211] focus:outline-none"
                      defaultValue={setting.value}
                      id={`input-${setting.key}`}
                    />
                    <button 
                      onClick={() => {
                        const val = document.getElementById(`input-${setting.key}`).value;
                        handleUpdate(setting.key, val, setting.description);
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
          ))}
      </div>
    </div>
  );
};

export default GlobalSettings;
