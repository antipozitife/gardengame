import React from 'react';
import Skeleton from '../Skeleton/Skeleton';
import './FlowerCardSkeleton.css';

interface FlowerCardSkeletonProps {
  count?: number;
}

const FlowerCardSkeleton: React.FC<FlowerCardSkeletonProps> = ({ count = 3 }) => {
  return (
    <div className="flowers-grid flower-card-skeleton-grid" aria-busy="true" aria-label="Загрузка">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flower-card flower-card-skeleton">
          <Skeleton
            width={72}
            height={24}
            borderRadius={999}
            className="flower-card-skeleton__badge"
          />
          <Skeleton width="100%" height={140} borderRadius={16} />
          <Skeleton width="70%" height={22} />
          <Skeleton width="40%" height={18} />
          <Skeleton width="100%" height={42} borderRadius={12} />
        </div>
      ))}
    </div>
  );
};

export default FlowerCardSkeleton;
