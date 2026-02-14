import React from 'react';

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 230 40"
      xmlns="http://www.w3.org/2000/svg"
      aria-labelledby="logo-title"
    >
      <title id="logo-title">Sateri Medical</title>
      <text
        x="0"
        y="30"
        fontFamily="sans-serif"
        fontSize="30"
        fontWeight="bold"
        fill="#16a34a" // green-600
      >
        Sateri
      </text>
      <text
        x="90"
        y="30"
        fontFamily="sans-serif"
        fontSize="30"
        fontWeight="bold"
        fill="#f97316" // orange-500
      >
        Medical
      </text>
    </svg>
  );
}
