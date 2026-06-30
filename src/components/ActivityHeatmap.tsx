'use client';

import React, { useMemo } from 'react';
import { ActivityCalendar } from 'react-activity-calendar';
import { format } from 'date-fns';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

import { useTheme } from '@/components/ThemeProvider';

interface ActivityHeatmapProps {
  logs: Date[];
}

export default function ActivityHeatmap({ logs }: ActivityHeatmapProps) {
  const { theme } = useTheme();
  
  const data = useMemo(() => {
    // 1. Generate empty array for the last 365 days
    const today = new Date();
    const days: Record<string, number> = {};
    for (let i = 365; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = format(d, 'yyyy-MM-dd');
      days[dateStr] = 0;
    }

    // 2. Count revisions per day
    logs.forEach(date => {
      const d = new Date(date);
      const dateStr = format(d, 'yyyy-MM-dd');
      if (days[dateStr] !== undefined) {
        days[dateStr]++;
      }
    });

    // 3. Convert to array and assign levels
    return Object.entries(days).map(([date, count]) => {
      let level = 0;
      if (count > 0) {
        if (count >= 10) level = 4;
        else if (count >= 5) level = 3;
        else if (count >= 2) level = 2;
        else level = 1;
      }

      return {
        date,
        count,
        level: level as 0 | 1 | 2 | 3 | 4,
      };
    });
  }, [logs]);

  // Calculate streaks
  const { totalActive, currentStreak, maxStreak, totalRevisions } = useMemo(() => {
    let active = 0;
    let current = 0;
    let max = 0;
    let total = 0;

    let trackingCurrent = true;

    for (let i = data.length - 1; i >= 0; i--) {
      const count = data[i].count;
      total += count;
      
      if (count > 0) {
        active++;
        if (trackingCurrent) {
          current++;
        }
      } else {
        if (i === data.length - 1) {
          // Today is 0. Streak is intact if yesterday was >0, but we don't increment current.
        } else {
          trackingCurrent = false;
        }
      }
    }

    let tempMax = 0;
    for (let i = 0; i < data.length; i++) {
      if (data[i].count > 0) {
        tempMax++;
        if (tempMax > max) max = tempMax;
      } else {
        tempMax = 0;
      }
    }

    return { totalActive: active, currentStreak: current, maxStreak: max, totalRevisions: total };
  }, [data]);

  const customTheme = {
    light: ['var(--bg-tertiary)', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
    dark: ['var(--bg-tertiary)', '#0e4429', '#006d32', '#26a641', '#39d353'],
  };

  return (
    <div className="glass-card mb-8 p-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
          {totalRevisions} revisions in the past year
        </h2>
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          <span>Total active days: <strong style={{ color: 'var(--text-primary)' }}>{totalActive}</strong></span>
          <span>Max streak: <strong style={{ color: 'var(--text-primary)' }}>{maxStreak}</strong></span>
          <span>Current streak: <strong style={{ color: 'var(--text-primary)' }}>{currentStreak}</strong></span>
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', overflowX: 'auto', padding: '1rem 0' }}>
        <ActivityCalendar 
          data={data} 
          theme={customTheme}
          colorScheme={theme}
          hideTotalCount={true}
          labels={{
            totalCount: '{{count}} revisions in the past year',
          }}
          renderBlock={(block, activity) => React.cloneElement(block as React.ReactElement, {
            'data-tooltip-id': 'react-tooltip',
            'data-tooltip-content': `${activity.count} revisions on ${format(new Date(activity.date), 'MMM d, yyyy')}`,
          })}
        />
      </div>
      <Tooltip id="react-tooltip" place="top" style={{ zIndex: 9999, borderRadius: '8px', fontSize: '0.85rem' }} />
    </div>
  );
}
