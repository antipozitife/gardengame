import React from 'react';
import './Spinner.css';

interface SpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Spinner: React.FC<SpinnerProps> = ({ label, size = 'md' }) => {
  return (
    <div className={`spinner spinner--${size}`} role="status" aria-live="polite">
      <span className="spinner__orbit" aria-hidden="true" />
      {label && <span className="spinner__label">{label}</span>}
    </div>
  );
};

export default Spinner;
