'use client';

import { format, eachWeekOfInterval, startOfMonth, endOfMonth } from 'date-fns';

interface TimelineHeaderProps {
  startDate: Date;
  endDate: Date;
}

export function TimelineHeader({ startDate, endDate }: TimelineHeaderProps) {
  // Generate weeks between start and end
  const weeks = eachWeekOfInterval(
    { start: startDate, end: endDate },
    { weekStartsOn: 1 },
  );

  // Generate months
  const months: { label: string; span: number }[] = [];
  let currentMonth = startOfMonth(startDate);
  const lastMonth = endOfMonth(endDate);

  while (currentMonth <= lastMonth) {
    const monthEnd = endOfMonth(currentMonth);
    const monthStart = currentMonth < startDate ? startDate : currentMonth;
    const actualEnd = monthEnd > endDate ? endDate : monthEnd;

    const weeksInMonth = weeks.filter(
      (w) => w >= startOfMonth(currentMonth) && w <= monthEnd,
    ).length;

    months.push({
      label: format(currentMonth, 'MMMM yyyy'),
      span: weeksInMonth,
    });

    currentMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1,
    );
  }

  return (
    <div className="border-b border-slate-200 bg-slate-50">
      {/* Months Row */}
      <div className="flex">
        {months.map((month, i) => (
          <div
            key={i}
            className="border-r border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
            style={{ flex: month.span }}
          >
            {month.label}
          </div>
        ))}
      </div>

      {/* Weeks Row */}
      <div className="flex">
        {weeks.map((week, i) => (
          <div
            key={i}
            className="border-r border-slate-200 px-2 py-1 text-xs text-slate-500 text-center"
            style={{ flex: 1, minWidth: '40px' }}
          >
            {format(week, 'd MMM')}
          </div>
        ))}
      </div>
    </div>
  );
}