import React, { useState } from 'react';
import {
  ProjectFolder,
  ProjectStylePrimer,
  ProjectAsset,
  AssetCategoryFolder,
  StudioProject,
} from '../types.ts';
import { PRESET_STYLE_PRIMERS } from '../data/projectPresets.ts';
import {
  Folder,
  FolderOpen,
  Plus,
  Sparkles,
  Lock,
  Unlock,
  Image as ImageIcon,
  User,
  Volume2,
  Music,
  LayoutGrid,
  Download,
  Upload,
  Copy,
  Trash2,
  Check,
  Star,
  ExternalLink,
  Tag,
  Palette,
  Eye,
  Play,
  RotateCcw,
  Search,
  X,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';

interface ProjectFolderManagerProps {
  projects: ProjectFolder[];
  activeProject: ProjectFolder;
  onSelectProject: (project: ProjectFolder) => void;
  onUpdateProject: (updatedProject: ProjectFolder) => void;
  onCreateProject: (newProject: ProjectFolder) => void;
  onDeleteProject: (projectId: string) => void;
  onDuplicateProject: (project: ProjectFolder) => void;
  onApplyAssetToStudio: (asset: ProjectAsset) => void;
}

export function ProjectFolderManager({
  projects,
  activeProject,
  onSelectProject,
  onUpdateProject,
  onCreateProject,
  onDeleteProject,
  onDuplicateProject,
  onApplyAssetToStudio,
}: ProjectFolderManagerProps) {
  const [selectedFolderTab, setSelectedFolderTab] = useState<AssetCategoryFolder | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState<'current' | 'all'>('current');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isEditingStylePrimer, setIsEditingStylePrimer] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectAppType, setNewProjectAppType] = useState<ProjectFolder['appType']>('mobile');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [selectedPresetPrimerId, setSelectedPresetPrimerId] = useState(PRESET_STYLE_PRIMERS[0].id);

  // Local style primer draft state
  const [primerDraft, setPrimerDraft] = useState<ProjectStylePrimer>(activeProject.stylePrimer);

  const primer = activeProject.stylePrimer;

  // Build scoped assets based on search scope
  const targetProjects = searchScope === 'all' ? projects : [activeProject];
  const allScopedAssets = targetProjects.flatMap((proj) =>
    (proj.assets || []).map((asset) => ({
      ...asset,
      projectName: proj.name,
      projectId: proj.id,
      projectColor: proj.stylePrimer?.colorPalette?.primary || '#6366f1',
      projectAppType: proj.appType || 'mobile',
    }))
  );

  const totalAssetsAcrossAllProjects = projects.reduce(
    (sum, p) => sum + (p.assets?.length || 0),
    0
  );

  // Dynamic tag extraction and counts across the active asset pool
  const tagCounts: Record<string, number> = {};
  for (const asset of allScopedAssets) {
    for (const tag of asset.tags || []) {
      const clean = tag.trim().toLowerCase();
      if (clean) {
        tagCounts[clean] = (tagCounts[clean] || 0) + 1;
      }
    }
  }
  const availableTags = Object.keys(tagCounts).sort((a, b) => {
    const diff = tagCounts[b] - tagCounts[a];
    return diff !== 0 ? diff : a.localeCompare(b);
  });

  // Filter assets
  const filteredAssets = allScopedAssets.filter((asset) => {
    // 1. Category folder matching
    const matchesFolder = selectedFolderTab === 'all' || asset.folder === selectedFolderTab;

    // 2. Tag matching (must match all selected tags)
    const assetTagsLower = (asset.tags || []).map((t) => t.toLowerCase());
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((st) => assetTagsLower.includes(st.toLowerCase()));

    // 3. Search query matching across name, tags, prompt, specs, and source project name
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      asset.name.toLowerCase().includes(q) ||
      (asset.tags && asset.tags.some((t) => t.toLowerCase().includes(q))) ||
      (asset.prompt && asset.prompt.toLowerCase().includes(q)) ||
      (asset.specs?.uiType && asset.specs.uiType.toLowerCase().includes(q)) ||
      (asset.specs?.resolution && asset.specs.resolution.toLowerCase().includes(q)) ||
      asset.folder.toLowerCase().replace('_', ' ').includes(q) ||
      asset.projectName.toLowerCase().includes(q);

    return matchesFolder && matchesTags && matchesSearch;
  });

  // Folder counts for the current search scope pool
  const folderCounts: Record<string, number> = {
    all: allScopedAssets.length,
    ui_art: allScopedAssets.filter((a) => a.folder === 'ui_art').length,
    avatar: allScopedAssets.filter((a) => a.folder === 'avatar').length,
    background: allScopedAssets.filter((a) => a.folder === 'background').length,
    voice: allScopedAssets.filter((a) => a.folder === 'voice').length,
    music: allScopedAssets.filter((a) => a.folder === 'music').length,
    intro: allScopedAssets.filter((a) => a.folder === 'intro').length,
  };

  const handleToggleTag = (tag: string) => {
    const norm = tag.toLowerCase();
    setSelectedTags((prev) =>
      prev.includes(norm) ? prev.filter((t) => t !== norm) : [...prev, norm]
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setSelectedFolderTab('all');
  };

  const handleToggleStyleLock = () => {
    const updatedPrimer = { ...primer, locked: !primer.locked };
    onUpdateProject({
      ...activeProject,
      stylePrimer: updatedPrimer,
      currentStudioState: {
        ...activeProject.currentStudioState,
        stylePrimer: updatedPrimer,
        styleLockEnabled: updatedPrimer.locked,
      },
    });
  };

  const handleSetStyleAnchor = (asset: { id: string; type: string; url: string; name: string; projectId?: string }) => {
    if (asset.type !== 'image') return;
    const targetProj = projects.find((p) => p.id === asset.projectId) || activeProject;
    const updatedAssets = targetProj.assets.map((a) => ({
      ...a,
      isStyleAnchor: a.id === asset.id,
    }));
    const updatedPrimer = {
      ...targetProj.stylePrimer,
      referenceImageUrl: asset.url,
      referenceImageName: asset.name,
    };
    onUpdateProject({
      ...targetProj,
      stylePrimer: updatedPrimer,
      assets: updatedAssets,
      currentStudioState: {
        ...targetProj.currentStudioState,
        stylePrimer: updatedPrimer,
      },
    });
  };

  const handleDeleteAsset = (assetId: string, projectId?: string) => {
    const targetProj = projects.find((p) => p.id === projectId) || activeProject;
    const updated = targetProj.assets.filter((a) => a.id !== assetId);
    onUpdateProject({
      ...targetProj,
      assets: updated,
    });
  };

  const handleSavePrimerDraft = () => {
    onUpdateProject({
      ...activeProject,
      stylePrimer: primerDraft,
      currentStudioState: {
        ...activeProject.currentStudioState,
        stylePrimer: primerDraft,
      },
    });
    setIsEditingStylePrimer(false);
  };

  const handleCreateNewProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    const selectedTemplate =
      PRESET_STYLE_PRIMERS.find((p) => p.id === selectedPresetPrimerId) || PRESET_STYLE_PRIMERS[0];
    const now = Date.now();
    const newProj: ProjectFolder = {
      id: `proj_${now}`,
      name: newProjectName.trim(),
      appType: newProjectAppType,
      description: newProjectDescription.trim() || 'Custom app assets and intro project',
      createdAt: now,
      updatedAt: now,
      stylePrimer: { ...selectedTemplate, id: `primer_${now}` },
      currentStudioState: {
        ...activeProject.currentStudioState,
        title: `${newProjectName.trim()} Onboarding`,
        appType: newProjectAppType,
        projectId: `proj_${now}`,
        projectName: newProjectName.trim(),
        stylePrimer: selectedTemplate,
        styleLockEnabled: true,
      },
      assets: [],
    };
    onCreateProject(newProj);
    setIsCreatingProject(false);
    setNewProjectName('');
    setNewProjectDescription('');
  };

  const handleExportProjectJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeProject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${activeProject.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_project_bundle.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportProjectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.id && parsed.name && parsed.stylePrimer) {
          onCreateProject({ ...parsed, id: `proj_import_${Date.now()}` });
        } else {
          alert('Invalid project JSON structure.');
        }
      } catch (err) {
        alert('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Projects Shelf & Folder Navigation */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <Folder className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Project Folders &amp; Asset Vault
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Organize every avatar, backdrop, UI art piece, modulated voice, and soundtrack per app project.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer border border-slate-700 transition-colors">
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>Import JSON</span>
              <input type="file" accept=".json" onChange={handleImportProjectFile} className="hidden" />
            </label>

            <button
              type="button"
              onClick={handleExportProjectJSON}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
              title="Download project folder data as JSON"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export Bundle</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCreatingProject(true)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* Project Switcher Cards Carousel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-4">
          {projects.map((proj) => {
            const isActive = proj.id === activeProject.id;
            return (
              <div
                key={proj.id}
                onClick={() => onSelectProject(proj)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                  isActive
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                          isActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {isActive ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white line-clamp-1">{proj.name}</h3>
                        <span className="text-[10px] text-slate-400 capitalize">{proj.appType} App</span>
                      </div>
                    </div>
                    {isActive && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Active
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">{proj.description}</p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: proj.stylePrimer.colorPalette.primary }}
                    />
                    <span className="text-slate-300 font-medium text-[10px] truncate max-w-[110px]">
                      {proj.stylePrimer.styleName}
                    </span>
                  </div>
                  <span className="text-slate-500 text-[10px]">{proj.assets.length} assets</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. THE STYLE PRIMING PUMP (Style Consistency Anchor) */}
      <div className="bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-950 border border-indigo-500/40 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-lg shadow-indigo-950/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </span>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Project Style Primer &amp; Consistency Pump
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                  primer.locked
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}
              >
                {primer.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                {primer.locked ? 'Style Consistency Locked' : 'Style Lock Off'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              When loaded, all new avatars, UI art, icons, and backdrops automatically inherit this style&apos;s
              render medium, lighting, color palette, and visual reference anchor.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleStyleLock}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                primer.locked
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              {primer.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{primer.locked ? 'Lock Active' : 'Lock Style'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPrimerDraft(primer);
                setIsEditingStylePrimer(true);
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              <Palette className="w-3.5 h-3.5 text-indigo-400" />
              <span>Customize Primer</span>
            </button>
          </div>
        </div>

        {/* Style Primer Metadata Grid */}
        <div className="mt-4 pt-4 border-t border-indigo-500/20 grid grid-cols-1 sm:grid-cols-4 gap-4 relative z-10 text-xs">
          {/* Visual Anchor Reference Image */}
          <div className="flex items-center gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            {primer.referenceImageUrl ? (
              <img
                src={primer.referenceImageUrl}
                alt="Style Anchor"
                className="w-12 h-12 rounded-lg object-cover border border-indigo-500/40 shadow-sm flex-shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0">
                <ImageIcon className="w-5 h-5 text-slate-600" />
              </div>
            )}
            <div className="overflow-hidden">
              <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block">
                Hero Anchor
              </span>
              <p className="text-white font-semibold truncate text-[11px]">
                {primer.referenceImageName || 'No Image Anchor'}
              </p>
              <span className="text-[10px] text-slate-400 block truncate">
                {primer.referenceImageUrl ? 'Multimodal priming active' : 'Text priming only'}
              </span>
            </div>
          </div>

          {/* Style Name & Medium */}
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Art Style &amp; Medium
            </span>
            <p className="text-white font-bold text-xs mt-0.5">{primer.styleName}</p>
            <span className="text-[10px] text-slate-400 capitalize">
              {primer.artMedium.replace('_', ' ')} • {primer.lightingStyle.replace('_', ' ')}
            </span>
          </div>

          {/* Color Palette Swatches */}
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
              Project Color DNA
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className="w-5 h-5 rounded-md border border-white/20 shadow-sm"
                style={{ backgroundColor: primer.colorPalette.primary }}
                title={`Primary: ${primer.colorPalette.primary}`}
              />
              <span
                className="w-5 h-5 rounded-md border border-white/20 shadow-sm"
                style={{ backgroundColor: primer.colorPalette.secondary }}
                title={`Secondary: ${primer.colorPalette.secondary}`}
              />
              <span
                className="w-5 h-5 rounded-md border border-white/20 shadow-sm"
                style={{ backgroundColor: primer.colorPalette.accent }}
                title={`Accent: ${primer.colorPalette.accent}`}
              />
              <span
                className="w-5 h-5 rounded-md border border-white/20 shadow-sm"
                style={{ backgroundColor: primer.colorPalette.background }}
                title={`Background: ${primer.colorPalette.background}`}
              />
              <span className="text-[10px] text-slate-400 ml-1">4 Swatches</span>
            </div>
          </div>

          {/* Style Directives */}
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-center overflow-hidden">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Style Directives
            </span>
            <p className="text-slate-300 text-[11px] line-clamp-2 mt-0.5 italic">
              &quot;{primer.styleDirectives}&quot;
            </p>
          </div>
        </div>
      </div>

      {/* 3. ASSET FOLDER BROWSER & FILING BIN */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5">
        {/* Top Header: Title & Cross-Project Scope Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3.5 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Asset Vault &amp; Cross-Folder Library
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Filter by tags, search prompt directives, or quickly find assets across all your project folders.
            </p>
          </div>

          {/* Search Scope Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800/90 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setSearchScope('current')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                searchScope === 'current'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
              title={`Limit search to active project: ${activeProject.name}`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span className="truncate max-w-[130px]">{activeProject.name}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  searchScope === 'current'
                    ? 'bg-indigo-700 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {activeProject.assets.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSearchScope('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                searchScope === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
              title="Search across all project folders"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>All Projects</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  searchScope === 'all'
                    ? 'bg-indigo-700 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {totalAssetsAcrossAllProjects}
              </span>
            </button>
          </div>
        </div>

        {/* Row 2: Folder Category Tabs + Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3.5 pb-3">
          {/* Category folder pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setSelectedFolderTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                selectedFolderTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>All Assets</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800/80 text-slate-300">
                {folderCounts.all}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFolderTab('ui_art')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                selectedFolderTab === 'ui_art'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>UI Art &amp; Icons</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800/80 text-slate-300">
                {folderCounts.ui_art}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFolderTab('avatar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                selectedFolderTab === 'avatar'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Avatars</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800/80 text-slate-300">
                {folderCounts.avatar}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFolderTab('background')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                selectedFolderTab === 'background'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Backgrounds</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800/80 text-slate-300">
                {folderCounts.background}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFolderTab('voice')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                selectedFolderTab === 'voice'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Voice</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800/80 text-slate-300">
                {folderCounts.voice}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFolderTab('music')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                selectedFolderTab === 'music'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Soundtracks</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800/80 text-slate-300">
                {folderCounts.music}
              </span>
            </button>
          </div>

          {/* Search bar with Icon and Clear Button */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={
                searchScope === 'all'
                  ? 'Search all projects, tags, names...'
                  : 'Search assets, tags, prompts...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                title="Clear search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Row 3: Tag Filtering Bar */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="flex items-center gap-1.5 text-slate-300 text-xs font-semibold pr-1.5 shrink-0">
              <Tag className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tags:</span>
            </div>

            {/* "All Tags" reset pill */}
            <button
              type="button"
              onClick={() => setSelectedTags([])}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                selectedTags.length === 0
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              All Tags
            </button>

            {/* Dynamic Tag Pills */}
            {availableTags.length === 0 ? (
              <span className="text-[11px] text-slate-500 italic">No tags in this view</span>
            ) : (
              availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                        : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    <span>#{tag}</span>
                    <span
                      className={`text-[9px] px-1 rounded-full ${
                        isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {tagCounts[tag]}
                    </span>
                    {isSelected && <Check className="w-2.5 h-2.5 text-white ml-0.5" />}
                  </button>
                );
              })
            )}
          </div>

          {/* Reset Filters & Count Summary */}
          <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-800/60 shrink-0">
            <span className="text-[11px] text-slate-400">
              Showing <strong className="text-white">{filteredAssets.length}</strong> of{' '}
              {allScopedAssets.length}
            </span>

            {(searchQuery.trim() || selectedTags.length > 0 || selectedFolderTab !== 'all') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-2.5 py-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/40 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                title="Clear all active search and tag filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Asset Cards Grid */}
        {filteredAssets.length === 0 ? (
          <div className="py-12 border-2 border-dashed border-slate-800 rounded-xl text-center flex flex-col items-center justify-center p-6">
            <Search className="w-10 h-10 text-slate-600 mb-2" />
            <h4 className="text-sm font-semibold text-slate-300">No matching assets found</h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              {searchQuery || selectedTags.length > 0
                ? `No assets match your search "${searchQuery || ''}" ${
                    selectedTags.length > 0 ? `with tags [${selectedTags.join(', ')}]` : ''
                  } in ${selectedFolderTab === 'all' ? 'any category' : selectedFolderTab}.`
                : 'There are no assets saved in this category yet.'}
            </p>
            {(searchQuery || selectedTags.length > 0 || selectedFolderTab !== 'all') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-3.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-3 flex flex-col justify-between group transition-all"
              >
                <div>
                  {/* Media Preview */}
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900 border border-slate-800/80 flex items-center justify-center mb-2.5">
                    {asset.type === 'image' ? (
                      <img
                        src={asset.url}
                        alt={asset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-3 text-center">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-1">
                          {asset.folder === 'voice' ? <Volume2 className="w-5 h-5" /> : <Music className="w-5 h-5" />}
                        </div>
                        <span className="text-[10px] text-slate-400">Audio Track</span>
                      </div>
                    )}

                    {/* Anchor Star Badge */}
                    {asset.isStyleAnchor && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500/90 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-md">
                        <Star className="w-3 h-3 fill-slate-950" />
                        Anchor
                      </span>
                    )}

                    {/* Folder Pill */}
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-sm text-slate-300 text-[9px] font-bold uppercase tracking-wider border border-slate-800">
                      {asset.folder.replace('_', ' ')}
                    </span>

                    {/* Cross-Project Origin Badge */}
                    {searchScope === 'all' && (
                      <button
                        type="button"
                        onClick={() => {
                          const targetProj = projects.find((p) => p.id === asset.projectId);
                          if (targetProj) onSelectProject(targetProj);
                        }}
                        className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/90 backdrop-blur-sm text-slate-200 border border-slate-800 text-[9px] font-semibold flex items-center gap-1 hover:border-indigo-500 transition-colors cursor-pointer"
                        title={`Folder: ${asset.projectName} (Click to open)`}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: asset.projectColor }}
                        />
                        <span className="truncate max-w-[90px]">{asset.projectName}</span>
                      </button>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-white line-clamp-1">{asset.name}</h4>
                  {asset.prompt && (
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 italic">
                      &quot;{asset.prompt}&quot;
                    </p>
                  )}

                  {/* Specs row */}
                  <div className="flex flex-wrap items-center gap-1 mt-2 text-[10px]">
                    {asset.specs.resolution && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-mono">
                        {asset.specs.resolution}
                      </span>
                    )}
                    {asset.specs.aspectRatio && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-mono">
                        {asset.specs.aspectRatio}
                      </span>
                    )}
                    {asset.specs.uiType && (
                      <span className="px-1.5 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
                        {asset.specs.uiType.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  {/* Interactive Tags */}
                  {asset.tags && asset.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 mt-1.5">
                      {asset.tags.map((tag) => {
                        const isSelected = selectedTags.includes(tag.toLowerCase());
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleTag(tag);
                            }}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                            }`}
                            title={`Filter by tag #${tag}`}
                          >
                            #{tag}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between gap-1">
                  <button
                    type="button"
                    onClick={() => onApplyAssetToStudio(asset)}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Load this asset into active studio"
                  >
                    <Play className="w-3 h-3" />
                    <span>Load</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {asset.type === 'image' && !asset.isStyleAnchor && (
                      <button
                        type="button"
                        onClick={() => handleSetStyleAnchor(asset)}
                        className="p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-900 rounded transition-colors cursor-pointer"
                        title="Set as Project Style Anchor reference"
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <a
                      href={asset.url}
                      download={`${asset.name.replace(/[^a-z0-9]/gi, '_')}.png`}
                      className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded transition-colors"
                      title="Download file"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>

                    <button
                      type="button"
                      onClick={() => handleDeleteAsset(asset.id, asset.projectId)}
                      className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded transition-colors cursor-pointer"
                      title="Delete asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: CUSTOMIZE STYLE PRIMER */}
      {isEditingStylePrimer && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Customize Project Style Primer</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingStylePrimer(false)}
                className="text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Quick Preset Selector */}
            <div className="mt-4">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Choose a Style Archetype
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_STYLE_PRIMERS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() =>
                      setPrimerDraft((prev) => ({
                        ...prev,
                        styleName: p.styleName,
                        artMedium: p.artMedium,
                        lightingStyle: p.lightingStyle,
                        colorPalette: p.colorPalette,
                        styleDirectives: p.styleDirectives,
                        referenceImageUrl: p.referenceImageUrl,
                        referenceImageName: p.referenceImageName,
                      }))
                    }
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      primerDraft.styleName === p.styleName
                        ? 'bg-indigo-950/60 border-indigo-500 ring-1 ring-indigo-500'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold text-white block">{p.styleName}</span>
                    <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{p.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Style Directives */}
            <div className="mt-4">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                AI Style Directives (Prompt Prefix)
              </label>
              <textarea
                rows={3}
                value={primerDraft.styleDirectives}
                onChange={(e) => setPrimerDraft({ ...primerDraft, styleDirectives: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                placeholder="Direct instructions on rendering technique, line weight, textures, lighting..."
              />
            </div>

            {/* Color Palette Editors */}
            <div className="mt-4">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Color Palette Hex Codes
              </label>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Primary</span>
                  <input
                    type="color"
                    value={primerDraft.colorPalette.primary}
                    onChange={(e) =>
                      setPrimerDraft({
                        ...primerDraft,
                        colorPalette: { ...primerDraft.colorPalette, primary: e.target.value },
                      })
                    }
                    className="w-full h-8 rounded bg-slate-950 border border-slate-800 cursor-pointer"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Secondary</span>
                  <input
                    type="color"
                    value={primerDraft.colorPalette.secondary}
                    onChange={(e) =>
                      setPrimerDraft({
                        ...primerDraft,
                        colorPalette: { ...primerDraft.colorPalette, secondary: e.target.value },
                      })
                    }
                    className="w-full h-8 rounded bg-slate-950 border border-slate-800 cursor-pointer"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Accent</span>
                  <input
                    type="color"
                    value={primerDraft.colorPalette.accent}
                    onChange={(e) =>
                      setPrimerDraft({
                        ...primerDraft,
                        colorPalette: { ...primerDraft.colorPalette, accent: e.target.value },
                      })
                    }
                    className="w-full h-8 rounded bg-slate-950 border border-slate-800 cursor-pointer"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Background</span>
                  <input
                    type="color"
                    value={primerDraft.colorPalette.background}
                    onChange={(e) =>
                      setPrimerDraft({
                        ...primerDraft,
                        colorPalette: { ...primerDraft.colorPalette, background: e.target.value },
                      })
                    }
                    className="w-full h-8 rounded bg-slate-950 border border-slate-800 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Reference Anchor URL */}
            <div className="mt-4">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Visual Anchor Reference Image (URL or Data URL)
              </label>
              <input
                type="text"
                value={primerDraft.referenceImageUrl || ''}
                onChange={(e) =>
                  setPrimerDraft({
                    ...primerDraft,
                    referenceImageUrl: e.target.value,
                    referenceImageName: 'Custom URL Anchor',
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                placeholder="https://... or data:image/png;base64,..."
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditingStylePrimer(false)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePrimerDraft}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg cursor-pointer shadow-md shadow-indigo-600/20"
              >
                Save Style Primer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE NEW PROJECT */}
      {isCreatingProject && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateNewProject}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Folder className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Create New Project Folder</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingProject(false)}
                className="text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Project / App Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lumina Meditation Mobile App"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  App Platform Format
                </label>
                <select
                  value={newProjectAppType}
                  onChange={(e) => setNewProjectAppType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="mobile">Mobile Application (9:16 portrait)</option>
                  <option value="web_modal">Web App Modal / Dialog (16:9)</option>
                  <option value="game_cutscene">Game Intro Cutscene (16:9)</option>
                  <option value="banner">Landing Hero Banner (16:9)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Purpose, target audience, vibe..."
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Initial Style Primer Archetype
                </label>
                <select
                  value={selectedPresetPrimerId}
                  onChange={(e) => setSelectedPresetPrimerId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {PRESET_STYLE_PRIMERS.map((primer) => (
                    <option key={primer.id} value={primer.id}>
                      {primer.styleName} ({primer.artMedium.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreatingProject(false)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg cursor-pointer shadow-md shadow-indigo-600/20"
              >
                Create Folder
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
