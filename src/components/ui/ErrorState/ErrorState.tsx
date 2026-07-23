import React from 'react';
import './ErrorState.css';

interface ErrorStateProps {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Что-то пошло не так',
  message,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="error-state" role="alert">
      <div className="error-state__icon" aria-hidden="true">
        ⚠️
      </div>
      <h3 className="error-state__title">{title}</h3>
      <p className="error-state__message">{message}</p>
      {actionLabel && onAction && (
        <button type="button" className="error-state__action" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default ErrorState;
