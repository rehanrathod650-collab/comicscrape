import React, { useState } from 'react';
import {
  Folder,
  Plus,
  FolderOpen,
  Layers,
  ArrowRight,
  MoreVertical,
  ExternalLink
} from 'lucide-react';
import { Collection, Resource } from '../types';
import { ComicBadge } from '../components/comic/ComicBadge';
import { ResourceCard } from '../components/resources/ResourceCard';
import { Modal } from '../components/common/Modal';

export interface CollectionsPageProps {
  collections: Collection[];
  resources: Resource[];
  onCreateCollection: (name: string, description?: string, color?: string) => Promise<void>;
  onOpenResourceDetails: (resource: Resource) => void;
}

export const CollectionsPage: React.FC<CollectionsPageProps> = ({
  collections,
  resources,
  onCreateCollection,
  onOpenResourceDetails
}) => {
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(collections[0]?.id || null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newColor, setNewColor] = useState('#facc15');

  const selectedCollection = collections.find(c => c.id === activeCollectionId) || collections[0];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await onCreateCollection(newTitle, newDesc, newColor);
    setNewTitle('');
    setNewDesc('');
    setCreateModalOpen(false);
  };

  // Mock mapped items for selected collection
  const collectionResources = resources.slice(0, 4);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-comic text-3xl uppercase tracking-wider text-ink-900 dark:text-paper-50">
              COLLECTIONS VAULT
            </h1>
            <ComicBadge variant="yellow" size="sm">
              {collections.length} FOLDERS
            </ComicBadge>
          </div>
          <p className="text-xs text-ink-600 dark:text-paper-300">
            Organize discovered GitHub repositories, PDFs, cheatsheets, and tools into curated topic folders.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="comic-btn bg-comic-yellow text-ink-900 text-xs sm:text-sm px-4 py-2.5 rounded-xl font-comic tracking-wider uppercase flex items-center gap-2 self-start sm:self-auto hover:bg-yellow-400"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Folder</span>
        </button>
      </div>

      {/* Comic Folder Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {collections.map(col => {
          const isActive = activeCollectionId === col.id;
          return (
            <div
              key={col.id}
              onClick={() => setActiveCollectionId(col.id)}
              className={`comic-card comic-card-hover p-5 cursor-pointer transition-all ${
                isActive
                  ? 'bg-comic-yellow/15 border-ink-800 dark:border-paper-300'
                  : 'bg-white dark:bg-ink-800'
              }`}
              style={{ borderTop: `6px solid ${col.color || '#facc15'}` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="p-2.5 rounded-xl border-2 border-ink-800 dark:border-paper-300 shadow-comic-sm"
                  style={{ backgroundColor: col.color || '#facc15' }}
                >
                  <Folder className="w-5 h-5 text-ink-900" />
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-paper-200 dark:bg-ink-700 text-ink-800 dark:text-paper-200">
                  {col.resourceCount} items
                </span>
              </div>

              <h3 className="font-extrabold text-base text-ink-900 dark:text-paper-50 mb-1 line-clamp-1">
                {col.name}
              </h3>

              <p className="text-xs text-ink-600 dark:text-paper-300 line-clamp-2 mb-4 leading-relaxed">
                {col.description || 'Curated folder collection.'}
              </p>

              <div className="pt-2 border-t border-paper-200 dark:border-ink-700 flex items-center justify-between text-xs font-bold text-comic-blue">
                <span>View Collection</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Collection Resource List */}
      {selectedCollection && (
        <div className="space-y-4 pt-4 border-t-2 border-paper-300 dark:border-ink-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-comic-yellow" />
                <h2 className="font-comic text-2xl uppercase tracking-wider text-ink-900 dark:text-paper-50">
                  {selectedCollection.name}
                </h2>
              </div>
              <p className="text-xs text-ink-600 dark:text-paper-300">
                {selectedCollection.description}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collectionResources.map(res => (
              <ResourceCard
                key={res.id}
                resource={res}
                onOpenDetails={onOpenResourceDetails}
                isSaved={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Curated Collection Folder"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-ink-600 dark:text-paper-300 block mb-1">
              Folder Name
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="e.g. Python Automation & Tooling"
              className="w-full bg-paper-100 dark:bg-ink-900 text-ink-900 dark:text-paper-100 px-3.5 py-2.5 rounded-xl border-2 border-ink-800 dark:border-paper-300 text-sm font-bold shadow-comic-sm focus:outline-none focus:ring-2 focus:ring-comic-yellow"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-ink-600 dark:text-paper-300 block mb-1">
              Description
            </label>
            <textarea
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              rows={3}
              placeholder="What kind of resources are stored in this collection?"
              className="w-full bg-paper-100 dark:bg-ink-900 text-ink-900 dark:text-paper-100 px-3.5 py-2.5 rounded-xl border-2 border-ink-800 dark:border-paper-300 text-xs shadow-comic-sm focus:outline-none focus:ring-2 focus:ring-comic-yellow"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-ink-600 dark:text-paper-300 block mb-1.5">
              Accent Color
            </label>
            <div className="flex gap-2">
              {['#facc15', '#38bdf8', '#4ade80', '#f87171', '#c084fc'].map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewColor(color)}
                  className={`w-8 h-8 rounded-lg border-2 border-ink-800 dark:border-paper-300 transition-transform ${
                    newColor === color ? 'scale-110 shadow-comic-sm ring-2 ring-ink-900' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="comic-btn bg-paper-200 dark:bg-ink-700 text-ink-900 dark:text-paper-100 text-xs px-4 py-2 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="comic-btn bg-comic-yellow text-ink-900 text-xs px-5 py-2 rounded-xl font-comic tracking-wider uppercase hover:bg-yellow-400"
            >
              Create Collection
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
