import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './StatusPage.css';

interface StatusPageProps {
  code: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
}

const StatusPage: React.FC<StatusPageProps> = ({
  code,
  title,
  description,
  actionLabel = 'На главную',
  actionTo = '/',
}) => {
  return (
    <div className="status-page">
      <motion.div
        className="status-page__card glass-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <p className="status-page__code">{code}</p>
        <h1>{title}</h1>
        <p className="status-page__description">{description}</p>
        <Link className="btn btn-primary" to={actionTo}>
          {actionLabel}
        </Link>
      </motion.div>
    </div>
  );
};

export default StatusPage;
