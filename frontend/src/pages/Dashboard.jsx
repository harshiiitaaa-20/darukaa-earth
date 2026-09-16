import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import StatCard from '../components/common/StatCard';
import MapViewComponent from '../components/map/MapViewComponent';
import ProjectCard from '../components/projects/ProjectCard';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import {
  FolderTree,
  MapPin,
  Globe,
  Trees,
  Plus,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export default function Dashboard() {
  const { projects, sitesGeoJSON, totalProjects, totalSites, totalAreaHectares, refreshData } =
    useProjects();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Compute estimated platform carbon sequestered
  const totalCarbonSequestered = Math.round(totalAreaHectares * 42.8);

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest block mb-1">
            Overview Dashboard
          </span>
          <h1 className="font-display font-extrabold text-2xl lg:text-3xl text-white">
            Geospatial Carbon & Biodiversity Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Monitor, measure, and analyze ecological sites across global projects.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary text-xs self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Projects"
          value={totalProjects}
          icon={FolderTree}
          color="emerald"
          trend={12.5}
          trendLabel="vs last quarter"
        />
        <StatCard
          title="Mapped Sites"
          value={totalSites}
          icon={MapPin}
          color="cyan"
          trend={18.2}
          trendLabel="polygon plots"
        />
        <StatCard
          title="Total Area Managed"
          value={totalAreaHectares.toLocaleString()}
          unit="Hectares"
          icon={Globe}
          color="amber"
          trend={24.0}
          trendLabel="gis coverage"
        />
        <StatCard
          title="Est. Carbon Sequestered"
          value={totalCarbonSequestered.toLocaleString()}
          unit="tCO2e"
          icon={Trees}
          color="purple"
          trend={15.4}
          trendLabel="net offset"
        />
      </div>

      {/* Interactive Map Dashboard */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Spatial Intelligence Map
            </span>
            <h3 className="font-display font-bold text-lg text-white">
              Global Project & Site Polygons
            </h3>
          </div>
          <Link to="/map" className="btn-secondary text-xs">
            <span>Expand Full Map</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
          </Link>
        </div>

        <MapViewComponent sitesGeoJSON={sitesGeoJSON} height="420px" />
      </div>

      {/* Projects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-xl text-white">
              Active Conservation Projects
            </h3>
            <p className="text-xs text-slate-400">
              Select a project to add polygon site plots & inspect metrics.
            </p>
          </div>
          <Link
            to="/projects"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            View All ({projects.length}) &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.slice(0, 3).map((proj) => (
            <ProjectCard key={proj.id} project={proj} />
          ))}
        </div>
      </div>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={() => refreshData()}
      />
    </div>
  );
}
