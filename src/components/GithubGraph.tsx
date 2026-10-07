import { useEffect, useRef, useState } from 'react';
import { globalStore } from '../lib/store';
import type { ContributionDay as Day, Contributions } from '../lib/types';
import './Frame.css';

const USERNAME = 'mahmutelipek';

const LEVEL_COLORS = ['rgba(255, 255, 255, 0.06)', '#0e4429', '#006d32', '#26a641', '#39d353'];

// Group days into week columns (Sunday first), padding the first column.
function toWeeks(days: Day[]): (Day | null)[][] {
  const weeks: (Day | null)[][] = [];
  let week: (Day | null)[] = [];
  if (days.length > 0) {
    const first = new Date(days[0].date + 'T00:00:00Z').getUTCDay();
    for (let i = 0; i < first; i++) week.push(null);
  }
  for (const day of days) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) weeks.push(week);
  return weeks;
}

export function GithubGraph() {
  const [data, setData] = useState<Contributions | null>(globalStore.githubContributions);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (globalStore.githubContributions) return;
    let cancelled = false;
    fetch(`https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=last`)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(json => {
        const result: Contributions = {
          total: Object.values(json.total as Record<string, number>).reduce((a, b) => a + b, 0),
          days: json.contributions as Day[],
        };
        globalStore.githubContributions = result;
        if (!cancelled) setData(result);
      })
      .catch(err => console.error('Error fetching GitHub contributions:', err));
    return () => {
      cancelled = true;
    };
  }, []);

  // Show the most recent weeks first on narrow screens
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [data]);

  // Real data only: if it can't be loaded, don't render a placeholder graph.
  if (!data) return null;

  const weeks = toWeeks(data.days);

  return (
    <div className="frame">
      <style>{`
        .gh-scroll { overflow-x: auto; padding: 1.25rem 1.5rem 0.5rem; scrollbar-width: none; }
        .gh-scroll::-webkit-scrollbar { display: none; }
        .gh-grid { display: flex; gap: 3px; width: max-content; margin: 0 auto; }
        .gh-week { display: flex; flex-direction: column; gap: 3px; }
        .gh-cell { width: 10px; height: 10px; border-radius: 2px; }
      `}</style>
      <h2 className="section-title">Contributions</h2>
      <div className="rule-top">
        <div className="gh-scroll" ref={scrollRef}>
          <div className="gh-grid">
            {weeks.map((week, wi) => (
              <div className="gh-week" key={wi}>
                {week.map((day, di) =>
                  day ? (
                    <div
                      key={day.date}
                      className="gh-cell"
                      style={{ background: LEVEL_COLORS[day.level] ?? LEVEL_COLORS[0] }}
                      title={`${day.count} contribution${day.count === 1 ? '' : 's'} on ${day.date}`}
                    />
                  ) : (
                    <div key={`e${di}`} className="gh-cell" style={{ visibility: 'hidden' }} />
                  )
                )}
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem 1rem',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.5rem 1.5rem 1.25rem',
            fontSize: '12px',
            color: 'var(--text-secondary)',
          }}
        >
          <a href={`https://github.com/${USERNAME}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>
            {data.total} contributions in the last year
          </a>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Less
            {LEVEL_COLORS.map(c => (
              <span key={c} className="gh-cell" style={{ background: c, display: 'inline-block' }} />
            ))}
            More
          </span>
        </div>
      </div>
    </div>
  );
}
