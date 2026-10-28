import React from 'react';
import { CatalogProduct } from '../data/catalogData';

interface ProductArtProps {
  type: CatalogProduct['illustrationType'];
  sku: string;
}

export const ProductTechnicalIllustration: React.FC<ProductArtProps> = ({ type, sku }) => {
  return (
    <div className="relative w-full aspect-[4/3] bg-[#0F172A] overflow-hidden flex items-center justify-center select-none border-b border-slate-200">
      {/* Subtle architectural blueprint grid */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern id={`grid-${sku}`} width="24" height="24" patternUnits="userSpaceOnUse">
            <path
              d="M 24 0 L 0 0 0 24"
              fill="none"
              stroke="#64748B"
              strokeWidth="0.6"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${sku})`} />
      </svg>

      {/* Top technical dimension annotation */}
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>REF · {sku}</span>
        <span>NORMA ABNT / INMETRO</span>
      </div>

      {/* Isometric Steel Profiles SVG */}
      {type === 'metalon' && (
        <svg viewBox="0 0 320 200" className="w-4/5 h-4/5 relative z-10" aria-label="Ilustração técnica Tubos Metalon">
          <defs>
            <linearGradient id="steelGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E2E8F0" />
              <stop offset="50%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <linearGradient id="steelSide" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#64748B" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
          </defs>
          {/* Long rectangular tube 1 */}
          <polygon points="50,125 185,55 245,80 110,150" fill="url(#steelGrad1)" stroke="#CBD5E1" strokeWidth="1" />
          <polygon points="110,150 245,80 245,115 110,185" fill="url(#steelSide)" stroke="#94A3B8" strokeWidth="1" />
          {/* Hollow end face */}
          <polygon points="50,125 110,150 110,185 50,160" fill="#1E293B" stroke="#F59E0B" strokeWidth="1.8" />
          <polygon points="58,132 102,151 102,176 58,157" fill="#0F172A" stroke="#64748B" strokeWidth="0.8" />
          {/* Second stacked square tube */}
          <polygon points="85,78 210,18 250,36 125,96" fill="url(#steelGrad1)" stroke="#E2E8F0" strokeWidth="1" />
          <polygon points="125,96 250,36 250,66 125,126" fill="url(#steelSide)" stroke="#94A3B8" strokeWidth="1" />
          <polygon points="85,78 125,96 125,126 85,108" fill="#1E293B" stroke="#CBD5E1" strokeWidth="1.5" />
          <polygon points="92,84 118,96 118,118 92,106" fill="#0F172A" />
        </svg>
      )}

      {type === 'chapa-xadrez' && (
        <svg viewBox="0 0 320 200" className="w-4/5 h-4/5 relative z-10" aria-label="Ilustração técnica Chapa de Aço Xadrez">
          <defs>
            <linearGradient id="plateSurf" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#CBD5E1" />
              <stop offset="60%" stopColor="#64748B" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
          </defs>
          {/* Base plate */}
          <polygon points="45,115 170,55 275,105 150,165" fill="#334155" stroke="#64748B" strokeWidth="1.2" />
          <polygon points="45,103 170,43 275,93 150,153" fill="url(#plateSurf)" stroke="#E2E8F0" strokeWidth="1.5" />
          {/* Thickness edge highlight */}
          <polygon points="45,103 150,153 150,165 45,115" fill="#1E293B" stroke="#F59E0B" strokeWidth="1.5" />
          <polygon points="150,153 275,93 275,105 150,165" fill="#0F172A" stroke="#94A3B8" strokeWidth="1" />
          {/* Diamond tread lugs */}
          <g fill="#F8FAFC" opacity="0.75">
            <ellipse cx="160" cy="75" rx="6" ry="2.2" transform="rotate(-25 160 75)" />
            <ellipse cx="185" cy="88" rx="6" ry="2.2" transform="rotate(25 185 88)" />
            <ellipse cx="135" cy="88" rx="6" ry="2.2" transform="rotate(25 135 88)" />
            <ellipse cx="160" cy="100" rx="6" ry="2.2" transform="rotate(-25 160 100)" />
            <ellipse cx="210" cy="100" rx="6" ry="2.2" transform="rotate(-25 210 100)" />
            <ellipse cx="110" cy="100" rx="6" ry="2.2" transform="rotate(-25 110 100)" />
            <ellipse cx="135" cy="114" rx="6" ry="2.2" transform="rotate(25 135 114)" />
            <ellipse cx="185" cy="114" rx="6" ry="2.2" transform="rotate(25 185 114)" />
            <ellipse cx="160" cy="127" rx="6" ry="2.2" transform="rotate(-25 160 127)" />
          </g>
        </svg>
      )}

      {type === 'perfil-u' && (
        <svg viewBox="0 0 320 200" className="w-4/5 h-4/5 relative z-10" aria-label="Ilustração técnica Perfil U Estrutural">
          {/* Extruded U-channel body */}
          <polygon points="65,130 215,50 260,72 110,152" fill="#94A3B8" stroke="#E2E8F0" strokeWidth="1" />
          <polygon points="65,88 215,8 215,50 65,130" fill="#64748B" stroke="#CBD5E1" strokeWidth="1" />
          <polygon points="110,110 260,30 260,72 110,152" fill="#475569" stroke="#94A3B8" strokeWidth="1" />
          {/* Front U cross-section highlighted in industrial amber */}
          <path
            d="M 65,88 L 78,94 L 78,102 L 72,99 L 72,127 L 103,142 L 103,114 L 97,111 L 97,103 L 110,110 L 110,152 L 65,130 Z"
            fill="#F59E0B"
            stroke="#FEF3C7"
            strokeWidth="1.2"
          />
        </svg>
      )}

      {type === 'telha-galvalume' && (
        <svg viewBox="0 0 320 200" className="w-4/5 h-4/5 relative z-10" aria-label="Ilustração técnica Telha Galvalume TP40">
          {/* Trapezoidal ribs */}
          <path
            d="M 30,140 L 50,110 L 75,110 L 95,140 L 120,140 L 140,110 L 165,110 L 185,140 L 210,140 L 230,110 L 255,110 L 275,140"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="3"
          />
          <polygon points="50,110 140,55 165,55 75,110" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
          <polygon points="75,110 165,55 185,85 95,140" fill="#64748B" stroke="#475569" strokeWidth="1" />
          <polygon points="95,140 185,85 210,85 120,140" fill="#94A3B8" stroke="#CBD5E1" strokeWidth="1" />
          <polygon points="140,110 230,55 255,55 165,110" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
          <polygon points="165,110 255,55 275,85 185,140" fill="#64748B" stroke="#475569" strokeWidth="1" />
          <polygon points="230,110 300,65 315,65 255,110" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1" />
        </svg>
      )}

      {type === 'cantoneira' && (
        <svg viewBox="0 0 320 200" className="w-4/5 h-4/5 relative z-10" aria-label="Ilustração técnica Cantoneiras e Barras">
          {/* L-angle iron 1 */}
          <polygon points="60,75 215,20 215,65 60,120" fill="#94A3B8" stroke="#E2E8F0" strokeWidth="1" />
          <polygon points="60,120 215,65 260,88 105,143" fill="#64748B" stroke="#CBD5E1" strokeWidth="1" />
          <path
            d="M 60,75 L 70,80 L 70,116 L 105,133 L 105,143 L 60,120 Z"
            fill="#F59E0B"
            stroke="#FEF3C7"
            strokeWidth="1.2"
          />
          {/* Flat bar beside it */}
          <polygon points="120,160 270,105 295,118 145,173" fill="#CBD5E1" stroke="#F8FAFC" strokeWidth="1" />
          <polygon points="120,160 145,173 145,182 120,169" fill="#D97706" />
        </svg>
      )}

      {type === 'acessorios' && (
        <svg viewBox="0 0 320 200" className="w-4/5 h-4/5 relative z-10" aria-label="Ilustração técnica Roldanas e Consumíveis">
          {/* Steel V-groove pulley wheel */}
          <circle cx="125" cy="105" r="48" fill="#475569" stroke="#E2E8F0" strokeWidth="3" />
          <circle cx="125" cy="105" r="36" fill="#1E293B" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="6 4" />
          <circle cx="125" cy="105" r="14" fill="#F59E0B" stroke="#FEF3C7" strokeWidth="2" />
          <circle cx="125" cy="105" r="5" fill="#0F172A" />
          {/* Cutting disc / welding rod representation */}
          <circle cx="215" cy="95" r="38" fill="#1E293B" stroke="#CBD5E1" strokeWidth="2" />
          <circle cx="215" cy="95" r="10" fill="#94A3B8" stroke="#F8FAFC" strokeWidth="2" />
          <line x1="185" y1="155" x2="275" y2="125" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
        </svg>
      )}

      {/* Bottom technical scale bar */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-slate-300">
        <span>CORTE · 6.000 mm / SOB MEDIDA</span>
        <span className="text-amber-400">ALAGOINHAS - BA</span>
      </div>
    </div>
  );
};
