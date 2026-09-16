import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { projectAPI } from '../../services/api';

export default function CreateProjectModal({ isOpen, onClose, onProjectCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [projectType, setProjectType] = useState('Reforestation');
  const [country, setCountry] = useState('');
  const [targetCarbon, setTargetCarbon] = useState('50000');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const newProj = await projectAPI.createProject({
        name,
        description,
        project_type: projectType,
        country,
        target_carbon_offset: parseFloat(targetCarbon) || 0,
        status: 'active',
      });
      onProjectCreated(newProj);
      onClose();
      // Reset form
      setName('');
      setDescription('');
      setCountry('');
    } catch (err) {
      console.error('Failed to create project:', err);
      setError('Failed to create project. Please check input values or session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-lg p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">Create Environmental Project</h3>
              <p className="text-xs text-slate-400">Register new project for carbon & biodiversity tracking</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Project Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Osa Rainforest Restoration Corridor"
              className="glass-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Project Type *</label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="glass-input bg-slate-900"
              >
                <option value="Reforestation">Reforestation</option>
                <option value="Blue Carbon">Blue Carbon (Mangroves)</option>
                <option value="Peatland">Peatland Reserve</option>
                <option value="Avoided Deforestation">Avoided Deforestation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Country / Region *</label>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. Costa Rica"
                className="glass-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Carbon Offset (tCO2e)</label>
            <input
              type="number"
              step="1000"
              value={targetCarbon}
              onChange={(e) => setTargetCarbon(e.target.value)}
              className="glass-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe project ecological scope, species conservation goals, and baseline..."
              className="glass-input resize-none"
            />
          </div>

          {error && <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl">{error}</div>}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="btn-secondary text-xs">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary text-xs">
              {loading ? 'Creating Project...' : 'Register Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
