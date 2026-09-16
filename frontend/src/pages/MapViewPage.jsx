import React from 'react';
import { useProjects } from '../context/ProjectContext';
import MapViewComponent from '../components/map/MapViewComponent';
import { Layers, Globe } from 'lucide-react';

export default function MapViewPage() {
  const { sitesGeoJSON, totalSites, totalAreaHectares } = useProjects();

  return (
    <div className="space-y-4 h-[calc(100vh-120px)] flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest block mb-0.5">
            Geospatial Explorer
          </span>
          <h1 className="font-display font-extrabold text-2xl text-white">
            Full-Screen Interactive Map Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs">
          <span className="text-slate-400">Total Plots: <strong className="text-white">{totalSites}</strong></span>
          <span className="h-3 w-px bg-slate-800" />
          <span className="text-slate-400">Coverage: <strong className="text-emerald-400">{totalAreaHectares} Ha</strong></span>
        </div>
      </div>

      <div className="flex-1 w-full relative">
        <MapViewComponent sitesGeoJSON={sitesGeoJSON} height="100%" />
      </div>
    </div>
  );
}
