import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { projectAPI, siteAPI } from '../services/api';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [sitesGeoJSON, setSitesGeoJSON] = useState({ type: 'FeatureCollection', features: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProjectsAndSites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [projData, geoData] = await Promise.all([
        projectAPI.getProjects(),
        siteAPI.getAllSitesGeoJSON(),
      ]);
      setProjects(projData);
      setSitesGeoJSON(geoData);
    } catch (err) {
      console.error('Error fetching project/site data:', err);
      setError('Failed to load project data. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjectsAndSites();
  }, [fetchProjectsAndSites]);

  // Aggregate Platform Statistics
  const totalProjects = projects.length;
  const totalSites = sitesGeoJSON.features ? sitesGeoJSON.features.length : 0;
  const totalAreaHectares = projects.reduce((acc, p) => acc + (p.total_area_hectares || 0), 0);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        sitesGeoJSON,
        loading,
        error,
        totalProjects,
        totalSites,
        totalAreaHectares,
        refreshData: fetchProjectsAndSites,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => useContext(ProjectContext);
