export function IBMQuantumLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="quantumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#78a9ff', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#a56eff', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      
      {/* IBM stripes pattern */}
      <g fill="url(#quantumGradient)">
        <rect x="10" y="15" width="80" height="8" />
        <rect x="10" y="31" width="80" height="8" />
        <rect x="10" y="47" width="80" height="8" />
        <rect x="10" y="63" width="80" height="8" />
        <rect x="10" y="79" width="80" height="8" />
      </g>
      
      {/* Quantum orbitals */}
      <circle cx="50" cy="50" r="35" fill="none" stroke="url(#quantumGradient)" strokeWidth="1.5" opacity="0.3" />
      <circle cx="50" cy="50" r="25" fill="none" stroke="url(#quantumGradient)" strokeWidth="1.5" opacity="0.5" />
      <circle cx="50" cy="50" r="15" fill="none" stroke="url(#quantumGradient)" strokeWidth="1.5" opacity="0.7" />
      
      {/* Center quantum particle */}
      <circle cx="50" cy="50" r="4" fill="#78a9ff">
        <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}
