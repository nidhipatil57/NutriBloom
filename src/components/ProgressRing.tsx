"use client";

import React, { useEffect, useState } from "react";

interface ProgressRingProps {
  percentage: number;
  size: number;
  strokeWidth: number;
  color: string;
  value?: string | number;
  label?: string;
  sublabel?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  size,
  strokeWidth,
  color,
  value,
  label,
  sublabel,
}) => {
  const [offset, setOffset] = useState(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    // Clamp percentage between 0 and 100
    const clampedPercentage = Math.max(0, Math.min(100, percentage));
    const progressOffset = circumference - (clampedPercentage / 100) * circumference;
    // Set offset after mount to animate
    const timer = setTimeout(() => {
      setOffset(progressOffset);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage, circumference]);

  // Generate a drop shadow filter ID unique to this color to prevent conflicts
  const shadowId = `glow-${color.replace("#", "")}`;

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(148, 163, 184, 0.08)"
          strokeWidth={strokeWidth}
        />
        {/* Foreground (Progress) Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          filter={`url(#${shadowId})`}
          style={{
            transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </svg>
      {/* Centered Text Panel */}
      <div
        style={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        {value !== undefined && (
          <span
            style={{
              fontSize: `${size * 0.16}px`,
              fontWeight: 800,
              color: "var(--text-primary)",
              lineHeight: 1.1,
            }}
          >
            {value}
          </span>
        )}
        {label && (
          <span
            style={{
              fontSize: `${size * 0.08}px`,
              fontWeight: 600,
              color: "var(--text-secondary)",
              marginTop: "4px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {label}
          </span>
        )}
        {sublabel && (
          <span
            style={{
              fontSize: `${size * 0.07}px`,
              color: "var(--text-muted)",
              marginTop: "2px",
            }}
          >
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProgressRing;
