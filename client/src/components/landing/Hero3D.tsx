import { useState, useEffect } from 'react';

function StaticHeroVisual() {
  return (
    <div className="relative w-full h-full min-h-[400px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-amber-900/20" />
      
      <div className="relative">
        <div className="w-48 h-48 md:w-64 md:h-64 relative animate-pulse">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 opacity-20 blur-xl animate-ping" style={{ animationDuration: '3s' }} />
          
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
            <defs>
              <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
              <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            <circle cx="100" cy="100" r="80" fill="none" stroke="url(#ringGradient)" strokeWidth="4" opacity="0.8" filter="url(#glow)">
              <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="20s" repeatCount="indefinite"/>
            </circle>
            
            <circle cx="100" cy="100" r="70" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.3">
              <animateTransform attributeName="transform" type="rotate" from="360 100 100" to="0 100 100" dur="15s" repeatCount="indefinite"/>
            </circle>
            
            <polygon points="100,30 140,75 140,125 100,170 60,125 60,75" fill="url(#shieldGradient)" filter="url(#glow)">
              <animate attributeName="opacity" values="0.9;1;0.9" dur="2s" repeatCount="indefinite"/>
            </polygon>
            
            <circle cx="160" cy="50" r="6" fill="#EF4444" filter="url(#glow)">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="40" cy="150" r="5" fill="#F59E0B" filter="url(#glow)">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="100" cy="15" r="4" fill="#3B82F6" filter="url(#glow)">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" repeatCount="indefinite"/>
            </circle>
          </svg>
        </div>
      </div>
      
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-amber-400/40 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function Hero3D() {
  return <StaticHeroVisual />;
}
