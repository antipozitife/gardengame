import React from 'react';
import './HowToPlay.css';
import dzhoistik from '../../assets/dzhoistik.png';
import { getFlowerById } from '../../data/flowers';

const WATERING_COST = 1;
const astraPrice = getFlowerById(1)?.price ?? 10;

const steps = [
  {
    id: 1,
    icon: '🌱',
    title: 'Купи цветок',
    description: `Начни с простой астры за ${astraPrice} XLM`,
  },
  {
    id: 2,
    icon: '💧',
    title: 'Поливай его',
    description: `Поливай свой цветок раз в день за ${WATERING_COST} XLM`,
  },
  {
    id: 3,
    icon: '💰',
    title: 'Получай доход',
    description: 'Каждый цветок приносит XLM каждый день',
  },
  {
    id: 4,
    icon: '🌸',
    title: 'Расширяй сад',
    description: 'Покупай редкие цветы и увеличивай доход',
  },
];

const HowToPlay: React.FC = () => {
  return (
    <section className="how-to-play" id="how-to-play-section">
      <div className="how-to-play-container">
        <h2 className="how-to-play-title">
          <img src={dzhoistik} alt="Джойстик" className="title-icon" />
          Как играть?
        </h2>
        <div className="steps-grid">
          {steps.map((step) => (
            <div key={step.id} className="step-card">
              <div className="step-number">{step.id}</div>
              <div className="step-icon">{step.icon}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowToPlay;
