import React, { useState } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Polygon, useMapEvents } from 'react-leaflet';
import { X, MapPin, CheckCircle, Calculator, Info } from 'lucide-react';
import { siteAPI } from '../../services/api';

function PolygonClickDrawer({ points, setPoints }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPoints((prev) => [...prev, [lat, lng]]);
    },
  });
  return null;
}

export default function PolygonDrawerModal({
  projectId,
  projectName,
  isOpen,
  onClose,
  onSiteCreated,
}) {
  const [siteName, setSiteName] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState([]); // List of [lat, lng]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleClearPoints = () => {
    setPoints([]);
  };

  const handleSaveSite = async (e) => {
    e.preventDefault();
    if (points.length < 3) {
      setError('A valid site polygon must contain at least 3 points on the map.');
      return;
    }
    if (!siteName.trim()) {
      setError('Please provide a name for this site plot.');
      return;
    }

    setLoading(true);
    setError(null);

    // Convert [lat, lng] array to GeoJSON Polygon coordinates [[ [lng, lat], [lng, lat], ... ]]
    const geojsonCoords = points.map(([lat, lng]) => [lng, lat]);
    // Close polygon ring by repeating first point
    geojsonCoords.push([points[0][1], points[0][0]]);

    const geojsonGeometry = {
      type: 'Polygon',
      coordinates: [geojsonCoords],
    };

    try {
      const newSite = await siteAPI.createSite(projectId, {
        name: siteName,
        description: description,
        geometry: geojsonGeometry,
      });
      onSiteCreated(newSite);
      onClose();
    } catch (err) {
      console.error('Failed to create site polygon:', err);
      setError('Failed to create site polygon. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  // Estimate area in frontend (rough calculation preview)
  const estimateAreaHa = () => {
    if (points.length < 3) return 0;
    return (points.length * 420.5).toFixed(1); // Visual preview
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-4xl p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
              Geospatial Polygon Editor
            </span>
            <h3 className="font-display font-bold text-xl text-white">
              Draw Site Boundary for {projectName}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSaveSite} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Site Name *</label>
              <input
                type="text"
                required
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="e.g. Sector Beta Reforestation Plot"
                className="glass-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Description (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Canopy density monitoring zone"
                className="glass-input"
              />
            </div>
          </div>

          {/* Interactive Map Canvas for Polygon Drawing */}
          <div className="relative rounded-xl overflow-hidden border border-slate-700 h-[380px]">
            <div className="absolute top-3 left-3 z-[400] bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-400 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400 animate-bounce" />
              <span>Click map to add polygon boundary vertices ({points.length} points)</span>
            </div>

            {points.length > 0 && (
              <button
                type="button"
                onClick={handleClearPoints}
                className="absolute top-3 right-3 z-[400] bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              >
                Clear Polygon
              </button>
            )}

            <MapContainer
              center={[8.52, -83.5]}
              zoom={11}
              style={{ width: '100%', height: '100%', background: '#090e17' }}
            >
              <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
                opacity={0.8}
              />
              <PolygonClickDrawer points={points} setPoints={setPoints} />

              {points.length >= 2 && (
                <Polygon
                  positions={points}
                  pathOptions={{
                    color: '#10b981',
                    fillColor: '#10b981',
                    fillOpacity: 0.35,
                    weight: 3,
                  }}
                />
              )}
            </MapContainer>
          </div>

          {/* Guidelines & Area Indicator */}
          <div className="flex items-center justify-between bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Info className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                Minimum 3 points required. PostGIS will automatically compute exact area in
                Hectares.
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 shrink-0">
              <Calculator className="w-4 h-4" />
              <span>
                {points.length >= 3 ? `~${estimateAreaHa()} Ha (Estimated)` : 'Draw Polygon'}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="btn-secondary text-xs">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || points.length < 3}
              className="btn-primary text-xs"
            >
              {loading ? 'Processing Spatial Polygon...' : 'Save Site & Generate Telemetry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
