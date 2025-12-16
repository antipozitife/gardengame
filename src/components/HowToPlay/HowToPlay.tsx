import React from 'react';

import './HowToPlay.css';

import dzhoistik from '../../assets/dzhoistik.png'

const HowToPlay: React.FC = () => {

const steps = [
  {
    id: 1,
    icon: '🌱',
    title: 'Купи цветок',
    description: 'Начни с простой астры за 1 FLW токен',
  },
  {
    id: 2,
    icon: '💧',
    title: 'Поливай его',
    description: 'Поливай свой цветок каждый день за 0.5 FLW',
  },
  {
    id: 3,
    icon: '💐',
    title: 'Собирай букеты',
    description: 'Продавай букеты дороже чем одиночный цветок',
  },
  {
    id: 4,
    icon: '🌸',
    title: 'Расширяй сад',
    description: 'Покупай редкие цветы и увеличивай доход',
  },
];

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
