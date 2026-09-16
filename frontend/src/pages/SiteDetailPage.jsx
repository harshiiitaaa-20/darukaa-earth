import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { analyticsAPI, siteAPI } from '../services/api';
import TimeSeriesChart from '../components/analytics/TimeSeriesChart';
import MapViewComponent from '../components/map/MapViewComponent';
import StatCard from '../components/common/StatCard';
import { ArrowLeft, Activity, TreeDeciduous, ShieldCheck, Database, Calendar, Download, RefreshCw } from 'lucide-react';

export default function SiteDetailPage() {
  const { id } = useParams();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [siteDetails, setSiteDetails] = useState(null);
  const [timeframe, setTimeframe] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, siteRes] = await Promise.all([
        analyticsAPI.getSiteAnalytics(id, timeframe),
        siteAPI.getSiteById(id),
      ]);
      setAnalyticsData(analyticsRes);
      setSiteDetails(siteRes);
    } catch (err) {
      console.error('Error loading site analytics:', err);
      setError('Failed to load telemetry analytics for this site.');
    } finally {
      setLoading(false);
    }
  }, [id, timeframe]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading && !analyticsData) {
    return <div className="text-center py-16 text-slate-400">Loading site analytics & telemetry...</div>;
  }

  if (error || !analyticsData) {
    return (
      <div className="p-8 text-rose-400 glass-card text-center space-y-3">
        <p>{error || 'Site analytics not found.'}</p>
        <Link to="/dashboard" className="btn-secondary text-xs">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const { summary, metrics } = analyticsData;

  // Single site GeoJSON FeatureCollection
  const singleSiteGeoJSON = siteDetails
    ? {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            id: siteDetails.id,
            geometry: siteDetails.geometry,
            properties: {
              id: siteDetails.id,
              site_name: siteDetails.name,
              project_id: siteDetails.project_id,
              project_name: analyticsData.project_name,
              area_hectares: siteDetails.area_hectares,
            },
          },
        ],
      }
    : null;

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        to={`/projects/${analyticsData.project_id}`}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Project ({analyticsData.project_name})</span>
      </Link>

      {/* Header */}
      <div className="glass-card p-6 border-l-4 border-l-cyan-500 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span>Site Telemetry Analytics</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl lg:text-3xl text-white">
            {analyticsData.site_name}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Spatial Area: <strong className="text-emerald-400">{analyticsData.area_hectares} Hectares</strong> | Project: {analyticsData.project_name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchAnalytics()}
            className="btn-secondary text-xs"
            title="Refresh metrics"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Indicator Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Carbon Stock"
          value={summary.total_carbon_sequestered_tco2.toLocaleString()}
          unit="tCO2e"
          icon={TreeDeciduous}
          color="emerald"
          trend={summary.carbon_trend_pct}
          trendLabel="over period"
        />
        <StatCard
          title="Latest NDVI Vegetation"
          value={summary.latest_ndvi}
          unit="Index"
          icon={Activity}
          color="cyan"
          trend={summary.ndvi_trend_pct}
          trendLabel="growth rate"
        />
        <StatCard
          title="Canopy Cover"
          value={summary.latest_canopy_cover}
          unit="%"
          icon={Database}
          color="amber"
        />
        <StatCard
          title="Biodiversity Index"
          value={summary.latest_biodiversity_index}
          unit="Score (1-10)"
          icon={ShieldCheck}
          color="purple"
        />
      </div>

      {/* Main Chart Section */}
      <TimeSeriesChart
        metrics={metrics}
        timeframe={timeframe}
        onTimeframeChange={(tf) => setTimeframe(tf)}
      />

      {/* Grid containing Map View and Raw Telemetry Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Site Boundary Map */}
        <div className="glass-card p-5 space-y-3">
          <h3 className="font-display font-bold text-base text-white">Site Boundary Polygon</h3>
          {singleSiteGeoJSON && (
            <MapViewComponent sitesGeoJSON={singleSiteGeoJSON} height="320px" interactive={false} />
          )}
        </div>

        {/* Telemetry Table */}
        <div className="lg:col-span-2 glass-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-display font-bold text-base text-white">
              Raw Environmental Telemetry ({metrics.length} Records)
            </h3>
          </div>

          <div className="overflow-x-auto max-h-[300px]">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase text-slate-400 bg-slate-950/60 sticky top-0 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">NDVI</th>
                  <th className="py-2.5 px-3">Canopy %</th>
                  <th className="py-2.5 px-3">Carbon (tCO2e/ha)</th>
                  <th className="py-2.5 px-3">SOC (tC/ha)</th>
                  <th className="py-2.5 px-3">Biodiversity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
                {metrics.slice().reverse().map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 px-3 text-slate-400 font-sans">{m.recorded_at}</td>
                    <td className="py-2 px-3 text-cyan-400 font-bold">{m.ndvi}</td>
                    <td className="py-2 px-3 text-amber-400">{m.canopy_cover_pct}%</td>
                    <td className="py-2 px-3 text-emerald-400 font-bold">{m.carbon_sequestered_tco2}</td>
                    <td className="py-2 px-3">{m.soil_organic_carbon}</td>
                    <td className="py-2 px-3 text-purple-400 font-bold">{m.biodiversity_index}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
