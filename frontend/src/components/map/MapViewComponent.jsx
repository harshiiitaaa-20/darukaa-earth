import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ExternalLink, Layers, Sparkles } from 'lucide-react';

// Subcomponent to fit bounds around features
function FitBounds({ features }) {
  const map = useMap();
  useEffect(() => {
    if (features && features.length > 0) {
      try {
        const geoJsonLayer = L.geoJSON({ type: 'FeatureCollection', features });
        const bounds = geoJsonLayer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
        }
      } catch (err) {
        console.error('Fit bounds error:', err);
      }
    }
  }, [features, map]);
  return null;
}

export default function MapViewComponent({ sitesGeoJSON, height = '500px', interactive = true }) {
  const navigate = useNavigate();
  const features = sitesGeoJSON?.features || [];

  // Polygon styling based on project type / ID
  const getStyle = (feature) => {
    const id = feature?.properties?.id || 1;
    const colors = ['#10b981', '#06b6d4', '#f59e0b', '#8b5cf6', '#ec4899'];
    const color = colors[id % colors.length];

    return {
      color: color,
      weight: 2.5,
      opacity: 0.9,
      fillColor: color,
      fillOpacity: 0.25,
    };
  };

  const onEachFeature = (feature, layer) => {
    const props = feature.properties || {};
    const siteId = props.id;
    const siteName = props.site_name || 'Site Plot';
    const projName = props.project_name || 'Project';
    const area = props.area_hectares || 0;

    const popupContent = `
      <div style="font-family: 'Inter', sans-serif; padding: 4px;">
        <span style="font-size: 10px; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.5px;">${projName}</span>
        <h4 style="font-size: 15px; font-weight: 700; margin: 2px 0 6px 0; color: #f8fafc;">${siteName}</h4>
        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 10px;">
          <strong>Area:</strong> ${area} Hectares
        </div>
        <button id="btn-site-${siteId}" style="width: 100%; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 600; font-size: 12px; cursor: pointer;">
          View Site Analytics &rarr;
        </button>
      </div>
    `;

    layer.bindPopup(popupContent);

    layer.on('popupopen', () => {
      const btn = document.getElementById(`btn-site-${siteId}`);
      if (btn) {
        btn.onclick = () => {
          navigate(`/sites/${siteId}`);
        };
      }
    });

    layer.on({
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({
          fillOpacity: 0.5,
          weight: 3.5,
        });
      },
      mouseout: (e) => {
        const l = e.target;
        l.setStyle(getStyle(feature));
      },
    });
  };

  const defaultCenter = [9.0, -83.5]; // Central Costa Rica / global fallback

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl" style={{ height }}>
      {/* Map Control Overlay Header */}
      <div className="absolute top-3 left-3 z-[400] bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-slate-200">
        <Layers className="w-4 h-4 text-emerald-400" />
        <span>PostGIS Vector Polygon Layer ({features.length} Sites)</span>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={3}
        style={{ width: '100%', height: '100%', background: '#090e17' }}
        zoomControl={interactive}
      >
        {/* Esri World Imagery / Dark Canvas Basemap */}
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Satellite Imagery'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        
        {/* Dark Overlay for Sleek Contrast */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
          opacity={0.85}
        />

        {features.length > 0 && (
          <>
            <GeoJSON key={JSON.stringify(features)} data={sitesGeoJSON} style={getStyle} onEachFeature={onEachFeature} />
            <FitBounds features={features} />
          </>
        )}
      </MapContainer>
    </div>
  );
}
