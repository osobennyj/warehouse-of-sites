import { isDemoMode } from "@/shared/config/demo";
import type { MonthlyMetrics } from "@/entities/record/model/metrics";

interface StatsDashboardProps {
  metrics: MonthlyMetrics;
}

export const StatsDashboard = ({ metrics }: StatsDashboardProps) => {
  const hasMonthActivity = metrics.filledDays > 0 || metrics.byPlanTrades + metrics.offPlanTrades > 0;
  const hasByPlanTrades = metrics.byPlanTrades > 0;
  const hasOffPlanTrades = metrics.offPlanTrades > 0;
  const hasSkippedTrades = metrics.skippedWins + metrics.skippedLosses > 0;
  const monthTone = !hasMonthActivity ? "neutral" : metrics.greenDaysPercent >= 60 ? "good" : metrics.greenDaysPercent <= 40 ? "bad" : "neutral";
  const disciplineTone = !hasMonthActivity ? "neutral" : metrics.greenDaysPercent >= 70 ? "good" : metrics.greenDaysPercent < 45 ? "bad" : "neutral";
  const planTradesTone = metrics.byPlanTrades >= metrics.offPlanTrades ? "good" : "bad";
  const byPlanWinrateTone = !hasByPlanTrades ? "neutral" : metrics.byPlanWinrate >= 55 ? "good" : metrics.byPlanWinrate <= 40 ? "bad" : "neutral";
  const offPlanWinrateTone = !hasOffPlanTrades ? "neutral" : metrics.offPlanWinrate <= 45 ? "good" : metrics.offPlanWinrate >= 60 ? "bad" : "neutral";
  const avgByPlanRrTone = !hasByPlanTrades ? "neutral" : metrics.avgByPlanRr > 0 ? "good" : metrics.avgByPlanRr < 0 ? "bad" : "neutral";
  const avgOffPlanRrTone = !hasOffPlanTrades ? "neutral" : metrics.avgOffPlanRr <= 0 ? "good" : "bad";
  const skippedTone = !hasSkippedTrades ? "neutral" : metrics.skippedTotalRr <= 0 ? "good" : "bad";
  const bestAssetTone = !metrics.bestAsset ? "neutral" : metrics.bestAsset.rr > 0 ? "good" : metrics.bestAsset.rr < 0 ? "bad" : "neutral";
  const worstAssetTone = !metrics.worstAsset ? "neutral" : metrics.worstAsset.rr < 0 ? "bad" : metrics.worstAsset.rr > 0 ? "good" : "neutral";
  const formatRr = (value: number): string => `${value > 0 ? "+" : ""}${value}`;
  const greenStreakText = metrics.greenStreak === 1 ? "day" : "days";
  const formatAssetValue = (asset: { ticker: string; rr: number } | null): string =>
    asset ? `${asset.ticker} • ${formatRr(asset.rr)} RR` : "No data";

  return (
    <section className={`dashboard dashboard--${monthTone}`}>
      <h2>{isDemoMode ? "Monthly stats (sample data)" : "Monthly stats"}</h2>
      <div className="dashboard__kpis">
        <article className="kpi-card">
          <span className="kpi-card__label">Days tracked</span>
          <strong>{metrics.filledDays}</strong>
        </article>
        <article className="kpi-card">
          <span className="kpi-card__label">Discipline</span>
          <strong className={`stat-pill stat-pill--${disciplineTone}`}>{metrics.greenDaysPercent}%</strong>
        </article>
        <article className="kpi-card">
          <span className="kpi-card__label">Green streak</span>
          <strong>
            {metrics.greenStreak} {greenStreakText}
          </strong>
        </article>
      </div>

      <div className="dashboard__stats">
        <article className={`dashboard-stat dashboard-stat--${planTradesTone}`}>
          <span className="dashboard-stat__label">Planned trades</span>
          <strong className="dashboard-stat__value">{metrics.byPlanTrades}</strong>
        </article>
        <article className={`dashboard-stat dashboard-stat--${byPlanWinrateTone}`}>
          <span className="dashboard-stat__label">Planned win rate</span>
          <strong className="dashboard-stat__value">{metrics.byPlanWinrate}%</strong>
        </article>
        <article className={`dashboard-stat dashboard-stat--${offPlanWinrateTone}`}>
          <span className="dashboard-stat__label">Off-plan / win rate</span>
          <strong className="dashboard-stat__value">
            {metrics.offPlanTrades} • {metrics.offPlanWinrate}%
          </strong>
        </article>
        <article className={`dashboard-stat dashboard-stat--${avgByPlanRrTone}`}>
          <span className="dashboard-stat__label">Planned RR</span>
          <strong className="dashboard-stat__value">{formatRr(metrics.avgByPlanRr)}</strong>
        </article>
        <article className={`dashboard-stat dashboard-stat--${avgOffPlanRrTone}`}>
          <span className="dashboard-stat__label">Off-plan RR</span>
          <strong className="dashboard-stat__value">{formatRr(metrics.avgOffPlanRr)}</strong>
        </article>
        <article className={`dashboard-stat dashboard-stat--${skippedTone}`}>
          <span className="dashboard-stat__label">Skipped (W/L) / RR</span>
          <strong className="dashboard-stat__value">
            {metrics.skippedWins}/{metrics.skippedLosses} • {formatRr(metrics.skippedTotalRr)}
          </strong>
        </article>
        <article className={`dashboard-stat dashboard-stat--${bestAssetTone}`}>
          <span className="dashboard-stat__label">Best asset</span>
          <strong className="dashboard-stat__value">{formatAssetValue(metrics.bestAsset)}</strong>
        </article>
        <article className={`dashboard-stat dashboard-stat--${worstAssetTone}`}>
          <span className="dashboard-stat__label">Worst asset</span>
          <strong className="dashboard-stat__value">{formatAssetValue(metrics.worstAsset)}</strong>
        </article>
      </div>

    </section>
  );
};
