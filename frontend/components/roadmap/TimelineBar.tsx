'use client';

import { differenceInDays } from 'date-fns';

interface TimelineBarProps {
  startDate: Date;
  endDate: Date;
  timelineStart: Date;
  timelineEnd: Date;
  color: string;
  label: string;
  progress?: number;
  onClick?: () => void;
  size?: 'large' | 'small';
}

export function TimelineBar({
  startDate,
  endDate,
  timelineStart,
  timelineEnd,
  color,
  label,
  progress = 0,
  onClick,
  size = 'large',
}: TimelineBarProps) {
  const totalDays = differenceInDays(timelineEnd, timelineStart);
  const barStartOffset = Math.max(0, differenceInDays(startDate, timelineStart));
  const barDuration = Math.max(
    1,
    differenceInDays(endDate, startDate),
  );

  const leftPercent = (barStartOffset / totalDays) * 100;
  const widthPercent = (barDuration / totalDays) * 100;

  const height = size === 'large' ? 'h-12' : 'h-8';
  const textSize = size === 'large' ? 'text-sm' : 'text-xs';

  return (
    <div className="relative h-full w-full">
      <div
        className={`absolute ${height} rounded-lg ${color} shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden group`}
        style={{
          left: `${leftPercent}%`,
          width: `${widthPercent}%`,
          minWidth: '60px',
        }}
        onClick={onClick}
      >
        {/* Progress Fill */}
        {progress > 0 && (
          <div
            className="absolute top-0 left-0 h-full bg-white/20"
            style={{ width: `${progress}%` }}
          />
        )}

        {/* Label */}
        <div className="relative h-full flex items-center px-3">
          <span className={`${textSize} font-medium text-white truncate`}>
            {label}
          </span>
          {progress > 0 && (
            <span className="ml-auto text-xs font-bold text-white">
              {progress}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}