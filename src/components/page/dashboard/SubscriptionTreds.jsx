import React from "react";
const data = [
  { month: "Jan", active: 80, expired: 120 },
  { month: "Feb", active: 100, expired: 100 },
  { month: "Mar", active: 120, expired: 90 },
  { month: "Apr", active: 150, expired: 70 },
  { month: "May", active: 180, expired: 80 },
  { month: "Jun", active: 160, expired: 120 },
  { month: "Jul", active: 140, expired: 110 },
  { month: "Aug", active: 150, expired: 100 },
  { month: "Sep", active: 130, expired: 90 },
  { month: "Oct", active: 140, expired: 100 },
  { month: "Nov", active: 120, expired: 80 },
  { month: "Dec", active: 130, expired: 70 },
];
const SubscriptionTreds = () => {
  return (
    <div className="bg-white p-5 rounded-xl shadow w-full h-[350px]">
      <h2 className="text-lg font-semibold mb-3">Subscription Trends</h2>
      {/* <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="active"
            stroke="#22c55e" // green like design
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="expired"
            stroke="#3b82f6" // blue like design
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>            
      </ResponsiveContainer> */}
    </div>
  );
}

export default SubscriptionTreds;
