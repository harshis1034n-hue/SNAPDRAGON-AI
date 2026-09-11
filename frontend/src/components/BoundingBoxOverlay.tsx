import React, { useRef, useState, useEffect } from 'react';
import { DetectedEntity } from '../types';
import { ShieldAlert, Check, X, EyeOff } from 'lucide-react';

interface BoundingBoxOverlayProps {
  imageUri: string;
  imageWidth: number;
  imageHeight: number;
  entities: DetectedEntity[];
  selectedEntityId: string | null;
  onSelectEntity: (entity: DetectedEntity) => void;
  onToggleEntityMask: (entityId: string) => void;
}

export const BoundingBoxOverlay: React.FC<BoundingBoxOverlayProps> = ({
  imageUri,
  imageWidth,
  imageHeight,
  entities,
  selectedEntityId,
  onSelectEntity,
  onToggleEntityMask,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Maintain aspect ratio scaling
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current && imageWidth > 0) {
        const containerWidth = containerRef.current.clientWidth;
        setScale(containerWidth / imageWidth);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [imageWidth]);

  const getRiskStyles = (risk: string, isSelected: boolean) => {
    switch (risk) {
      case 'CRITICAL':
        return {
          border: isSelected ? 'border-2 border-rose-400' : 'border border-rose-500',
          bg: isSelected ? 'bg-rose-500/35 ring-2 ring-rose-400 shadow-lg shadow-rose-500/30' : 'bg-rose-500/20 hover:bg-rose-500/30',
          badge: 'bg-rose-600 text-white',
          dot: 'bg-rose-400',
        };
      case 'HIGH':
        return {
          border: isSelected ? 'border-2 border-amber-400' : 'border border-amber-500',
          bg: isSelected ? 'bg-amber-500/35 ring-2 ring-amber-400 shadow-lg shadow-amber-500/30' : 'bg-amber-500/20 hover:bg-amber-500/30',
          badge: 'bg-amber-600 text-white',
          dot: 'bg-amber-400',
        };
      case 'MEDIUM':
        return {
          border: isSelected ? 'border-2 border-yellow-400' : 'border border-yellow-500',
          bg: isSelected ? 'bg-yellow-500/35 ring-2 ring-yellow-400 shadow-lg shadow-yellow-500/30' : 'bg-yellow-500/20 hover:bg-yellow-500/30',
          badge: 'bg-yellow-600 text-slate-900 font-bold',
          dot: 'bg-yellow-400',
        };
      default:
        return {
          border: isSelected ? 'border-2 border-blue-400' : 'border border-blue-500',
          bg: isSelected ? 'bg-blue-500/35 ring-2 ring-blue-400 shadow-lg shadow-blue-500/30' : 'bg-blue-500/20 hover:bg-blue-500/30',
          badge: 'bg-blue-600 text-white',
          dot: 'bg-blue-400',
        };
    }
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl" ref={containerRef}>
      {/* Background Image */}
      <img
        src={imageUri}
        alt="Screen Capture to Analyze"
        className="w-full h-auto block select-none"
        onLoad={(e) => {
          const img = e.currentTarget;
          if (containerRef.current) {
            setScale(containerRef.current.clientWidth / img.naturalWidth);
          }
        }}
      />

      {/* Bounding Boxes Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {entities.map((entity) => {
          const bbox = entity.boundingBox;
          const isSelected = entity.id === selectedEntityId;
          const style = getRiskStyles(entity.risk, isSelected);

          const left = bbox.x * scale;
          const top = bbox.y * scale;
          const width = bbox.width * scale;
          const height = bbox.height * scale;

          return (
            <div
              key={entity.id}
              style={{
                left: `${left}px`,
                top: `${top}px`,
                width: `${Math.max(20, width)}px`,
                height: `${Math.max(16, height)}px`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectEntity(entity);
              }}
              className={`absolute pointer-events-auto cursor-pointer rounded transition-all duration-150 ${style.border} ${style.bg}`}
            >
              {/* Floating Pill Label */}
              <div
                className={`absolute -top-6 left-0 flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono tracking-tight whitespace-nowrap shadow-md select-none z-10 ${style.badge}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse`}></span>
                <span>{entity.displayName}</span>
                <span className="opacity-80">({Math.round(entity.confidence * 100)}%)</span>
                
                {/* Mask Toggle Button inside badge */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleEntityMask(entity.id);
                  }}
                  title={entity.isMasked ? "Mask active (Click to unmask)" : "Unmasked (Click to mask)"}
                  className={`ml-1 w-3.5 h-3.5 rounded flex items-center justify-center transition-colors ${
                    entity.isMasked ? 'bg-black/30 hover:bg-black/50 text-white' : 'bg-red-900/60 hover:bg-red-800 text-rose-200'
                  }`}
                >
                  {entity.isMasked ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                </button>
              </div>

              {/* Unmasked warning indicator if user deselected it */}
              {!entity.isMasked && (
                <div className="absolute inset-0 bg-red-900/40 border border-red-500 border-dashed rounded flex items-center justify-center">
                  <span className="text-[9px] font-mono text-red-300 uppercase font-bold bg-black/70 px-1 rounded">
                    Exposed
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
