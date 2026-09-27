'use client';

interface PriorityBreakdownProps {
  data: Array<{ name: string; value: number; color: string }>;
}

export function PriorityBreakdown({ data }: PriorityBreakdownProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        Tasks by Priority
      </h3>
      {total === 0 ? (
        <p className="text-center py-12 text-slate-500">No tasks yet</p>
      ) : (
        <div className="space-y-4">
          {data.map((item) => {
            const percent =
              total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <div key={item.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    {item.name}
                  </span>
                  <span className="text-sm text-slate-500">
                    {item.value} ({percent}%)
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}