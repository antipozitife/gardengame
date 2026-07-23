import React from 'react';
import './Skeleton.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
}

const toCssSize = (value?: string | number): string | undefined => {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
};

const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height = 16,
  borderRadius = 8,
  className = '',
}) => {
  return (
    <span
      className={`skeleton ${className}`.trim()}
      style={{
        width: toCssSize(width),
        height: toCssSize(height),
        borderRadius: toCssSize(borderRadius),
      }}
      aria-hidden="true"
    />
  );
};

export default Skeleton;
