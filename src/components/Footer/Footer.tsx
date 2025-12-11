import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* ЛЕВАЯ КОЛОНКА - ЛОГОТИП И ОПИСАНИЕ */}
        <div className="footer-section footer-brand">
          <h3 className="footer-logo">🌸 Flower Garden</h3>
          <p className="footer-description">
            Play, grow, and earn! Cultivate beautiful flowers on the Stellar blockchain and turn your garden into crypto income.
          </p>
        </div>

        {/* СРЕДНЯЯ КОЛОНКА - БЫСТРЫЕ ССЫЛКИ */}
        <div className="footer-section">
          <h4 className="footer-title">Быстрые ссылки</h4>
          <ul className="footer-links">
            <li>
              <a href="#game">Игра</a>
            </li>
            <li>
              <a href="#how-to-play-section">Как играть</a>
            </li>
            <li>
              <a href="#flower-types-section">Виды цветов</a>
            </li>
            <li>
              <a href="#flw-token-section">FLW Token</a>
            </li>
          </ul>
        </div>

        {/* ЧЕТВЕРТАЯ КОЛОНКА - КОНТАКТЫ */}
        <div className="footer-section">
          <h4 className="footer-title">Контакты</h4>
          <div className="footer-contact-item">
            <span className="contact-icon">📧</span>
            <a href="mailto:info@flowergarden.com">info@flowergarden.com</a>
          </div>
          <div className="footer-contact-item">
            <span className="contact-icon">🌐</span>
            <a href="https://stellar.org" target="_blank" rel="noopener noreferrer">
              Stellar Network
            </a>
          </div>
        </div>
      </div>

      {/* НИЖНЯЯ ЧАСТЬ */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p className="footer-copyright">
            &copy; {currentYear} Flower Garden. Все права защищены.
          </p>
          <p className="footer-note">
            Built on <a href="https://stellar.org" target="_blank" rel="noopener noreferrer">Stellar Blockchain</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
