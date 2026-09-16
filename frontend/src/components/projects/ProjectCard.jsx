import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Globe, TreeDeciduous, ArrowRight } from 'lucide-react';

export default function ProjectCard({ project }) {
  const getBadgeClass = (type) => {
    switch (type) {
      case 'Reforestation':
        return 'badge-reforestation';
      case 'Blue Carbon':
        return 'badge-bluecarbon';
      case 'Peatland':
        return 'badge-peatland';
      default:
        return 'badge-reforestation';
    }
  };

  return (
    <div className="glass-card p-6 flex flex-col justify-between group hover:border-emerald-500/40 transition-all">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`badge ${getBadgeClass(project.project_type)}`}>
            {project.project_type}
          </span>
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-400" />
            {project.country}
          </span>
        </div>

        <h3 className="font-display font-bold text-lg text-white group-hover:text-emerald-400 transition-colors mb-2">
          {project.name}
        </h3>

        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {project.description || 'Carbon sequestration and ecological biodiversity project.'}
        </p>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-800/80">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold mb-0.5">Target Offset</span>
            <span className="font-bold text-slate-200">{project.target_carbon_offset?.toLocaleString()} tCO2e</span>
          </div>

          <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold mb-0.5">Sites / Area</span>
            <span className="font-bold text-emerald-400">
              {project.site_count} Sites ({project.total_area_hectares} Ha)
            </span>
          </div>
        </div>

        <Link
          to={`/projects/${project.id}`}
          className="btn-secondary text-xs w-full justify-center group-hover:border-emerald-500/50"
        >
          <span>Manage Sites & Analytics</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-emerald-400" />
        </Link>
      </div>
    </div>
  );
}
