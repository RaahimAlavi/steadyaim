import React from 'react';
import type { UserSettings } from '../types';

interface HUDCrosshairProps {
  settings: UserSettings;
  isTense: boolean;
}

export const HUDCrosshair: React.FC<HUDCrosshairProps> = ({ settings, isTense }) => {
  const color = isTense ? '#ff4655' : settings.crosshairColor || '#00f5d4';
  const style = settings.crosshairStyle || 'classic';
  const size = settings.crosshairSize || 6;

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {/* Outer subtle glow if tense */}
      {isTense && (
        <div className="absolute w-12 h-12 rounded-full bg-[#ff4655]/20 animate-ping" />
      )}

      {style === 'dot' && (
        <div
          style={{
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: color,
            boxShadow: isTense ? '0 0 8px #ff4655' : `0 0 6px ${color}`,
          }}
          className="rounded-full transition-transform duration-75"
        />
      )}

      {style === 'classic' && (
        <div className="relative w-10 h-10 flex items-center justify-center">
          {/* Top */}
          <div
            style={{
              height: `${size}px`,
              width: '2px',
              backgroundColor: color,
              top: `${14 - size}px`,
            }}
            className="absolute left-1/2 -translate-x-1/2"
          />
          {/* Bottom */}
          <div
            style={{
              height: `${size}px`,
              width: '2px',
              backgroundColor: color,
              bottom: `${14 - size}px`,
            }}
            className="absolute left-1/2 -translate-x-1/2"
          />
          {/* Left */}
          <div
            style={{
              width: `${size}px`,
              height: '2px',
              backgroundColor: color,
              left: `${14 - size}px`,
            }}
            className="absolute top-1/2 -translate-y-1/2"
          />
          {/* Right */}
          <div
            style={{
              width: `${size}px`,
              height: '2px',
              backgroundColor: color,
              right: `${14 - size}px`,
            }}
            className="absolute top-1/2 -translate-y-1/2"
          />
          {/* Center tiny dot */}
          <div
            style={{ backgroundColor: color }}
            className="w-1 h-1 rounded-sm"
          />
        </div>
      )}

      {style === 'plus' && (
        <div className="relative w-8 h-8 flex items-center justify-center">
          <div
            style={{
              width: `${size * 2}px`,
              height: '2px',
              backgroundColor: color,
            }}
            className="absolute"
          />
          <div
            style={{
              height: `${size * 2}px`,
              width: '2px',
              backgroundColor: color,
            }}
            className="absolute"
          />
        </div>
      )}

      {style === 'circle' && (
        <div
          style={{
            width: `${size * 2.5}px`,
            height: `${size * 2.5}px`,
            borderColor: color,
          }}
          className="rounded-full border-2 border-solid flex items-center justify-center"
        >
          <div style={{ backgroundColor: color }} className="w-1 h-1 rounded-full" />
        </div>
      )}
    </div>
  );
};
