import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectAPI, siteAPI } from '../services/api';
import MapViewComponent from '../components/map/MapViewComponent';
import PolygonDrawerModal from '../components/map/PolygonDrawerModal';
import {
  MapPin,
  Plus,
  ArrowLeft,
  Globe,
  TreeDeciduous,
  Calendar,
  Activity,
  Trash2,
} from 'lucide-react';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchProjectAndSites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [projData, sitesData] = await Promise.all([
        projectAPI.getProjectById(id),
        siteAPI.getProjectSites(id),
      ]);
      setProject(projData);
      setSites(sitesData);
    } catch (err) {
      console.error('Error fetching project detail:', err);
      setError('Project not found or failed to load data.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProjectAndSites();
  }, [fetchProjectAndSites]);

  const handleDeleteSite = async (siteId) => {
    if (window.confirm('Are you sure you want to delete this site polygon plot?')) {
      try {
        await siteAPI.deleteSite(siteId);
        fetchProjectAndSites();
      } catch (err) {
        alert('Failed to delete site.');
      }
    }
  };

  if (loading)
    return <div className="text-center py-16 text-slate-400">Loading project detail...</div>;
  if (error || !project)
    return (
      <div className="p-8 text-rose-400 glass-card text-center">
        {error || 'Project not found.'}
      </div>
    );

  // Build GeoJSON FeatureCollection for project sites
  const projectSitesGeoJSON = {
    type: 'FeatureCollection',
    features: sites.map((s) => ({
      type: 'Feature',
      id: s.id,
      geometry: s.geometry,
      properties: {
        id: s.id,
        site_name: s.name,
        project_id: project.id,
        project_name: project.name,
        area_hectares: s.area_hectares,
      },
    })),
  };

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        to="/projects"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Projects</span>
      </Link>

      {/* Project Header Card */}
      <div className="glass-card p-6 border-l-4 border-l-emerald-500 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="badge badge-reforestation">{project.project_type}</span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              {project.country}
            </span>
          </div>
          <h1 className="font-display font-extrabold text-2xl lg:text-3xl text-white">
            {project.name}
          </h1>
          <p className="text-sm text-slate-400 max-w-3xl">{project.description}</p>
        </div>

        {/* Action Button to Add Site */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="btn-primary text-xs shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Draw & Add Site Polygon</span>
        </button>
      </div>

      {/* Map View of Project Sites */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Project Spatial Boundaries
            </span>
            <h3 className="font-display font-bold text-lg text-white">
              Sites Mapped ({sites.length})
            </h3>
          </div>
        </div>

        <MapViewComponent sitesGeoJSON={projectSitesGeoJSON} height="360px" />
      </div>

      {/* List of Sites */}
      <div className="space-y-4">
        <h3 className="font-display font-bold text-xl text-white">Project Geographical Sites</h3>

        {sites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sites.map((site) => (
              <div
                key={site.id}
                className="glass-card p-5 space-y-3 hover:border-emerald-500/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                    Plot #{site.id}
                  </span>
                  <button
                    onClick={() => handleDeleteSite(site.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete site"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h4 className="font-display font-bold text-base text-white">{site.name}</h4>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {site.description || 'Geospatial carbon sequestration site plot.'}
                </p>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-400">{site.area_hectares} Hectares</span>
                  <Link to={`/sites/${site.id}`} className="btn-primary py-1 px-3 text-[11px]">
                    <span>View Analytics</span>
                    <Activity className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 text-center text-slate-400 space-y-3">
            <p className="text-sm">No site plots mapped yet for this project.</p>
            <button onClick={() => setIsDrawerOpen(true)} className="btn-secondary text-xs">
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Draw First Polygon Plot</span>
            </button>
          </div>
        )}
      </div>

      <PolygonDrawerModal
        projectId={project.id}
        projectName={project.name}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSiteCreated={() => fetchProjectAndSites()}
      />
    </div>
  );
}
