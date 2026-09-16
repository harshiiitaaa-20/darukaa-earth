import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import ProjectCard from '../components/projects/ProjectCard';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import { Search, Plus, Filter, FolderTree } from 'lucide-react';

export default function ProjectsPage() {
  const { projects, loading, refreshData } = useProjects();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = selectedType === 'ALL' || p.project_type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest block mb-1">
            Project Management
          </span>
          <h1 className="font-display font-extrabold text-2xl lg:text-3xl text-white">
            Conservation & Carbon Projects ({projects.length})
          </h1>
          <p className="text-sm text-slate-400">
            Create projects, manage site boundaries, and monitor environmental outcomes.
          </p>
        </div>

        <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary text-xs">
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects by name, country..."
            className="glass-input pl-9"
          />
        </div>

        {/* Project Type Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['ALL', 'Reforestation', 'Blue Carbon', 'Peatland', 'Avoided Deforestation'].map(
            (type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                  selectedType === type
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {type}
              </button>
            )
          )}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading projects...</div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center text-slate-400 space-y-3">
          <FolderTree className="w-10 h-10 mx-auto text-slate-600" />
          <h4 className="font-display font-semibold text-lg text-white">No projects found</h4>
          <p className="text-xs">Try clearing search filters or create a new project.</p>
        </div>
      )}

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={() => refreshData()}
      />
    </div>
  );
}
