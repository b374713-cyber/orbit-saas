'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

interface TaskDistributionProps {
  data: Array<{ name: string; value: number; color: string }>;
}

export function TaskDistribution({ data }: TaskDistributionProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        Tasks by Status
      </h3>
      {total === 0 ? (
        <div className="flex items-center justify-center h-[300px] text-slate-500">
          No tasks yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data.filter((d) => d.value > 0)}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data
                .filter((d) => d.value > 0)
                .map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${value} tasks`, '']}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '12px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}