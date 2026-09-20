import React from 'react';
import { Resource } from '../../types';
import { ResourceCard } from './ResourceCard';

export interface ResourceGridProps {
  resources: Resource[];
  onOpenDetails: (resource: Resource) => void;
  onSave?: (resource: Resource) => void;
}

export const ResourceGrid: React.FC<ResourceGridProps> = ({
  resources,
  onOpenDetails,
  onSave
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {resources.map(resource => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          onOpenDetails={onOpenDetails}
          onSave={onSave}
        />
      ))}
    </div>
  );
};
