export function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm text-muted">
        <span>
          {done} of {total} tasks done
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-sage-soft">
        <div
          className="h-full rounded-full bg-evergreen transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
