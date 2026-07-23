import React, { useEffect, useRef, useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SlideContext } from '../../components/SlideContext';
import { useTheme } from '../../context/ThemeContext';
import logo from '../../assets/logo.png';
import flower1 from '../../assets/flowers1.jpeg';
import flower2 from '../../assets/flowers2.jpg';
import flower3 from '../../assets/flowers3.jpg';
import flower4 from '../../assets/flowers4.jpg';
import flower5 from '../../assets/flowers5.jpg';
import './Header.css';

const Header: React.FC = () => {
  const { currentSlide } = useContext(SlideContext);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const coinRef = useRef<HTMLDivElement>(null);
  const [currentFlowerIndex, setCurrentFlowerIndex] = useState(0);
  const flowers = [flower1, flower2, flower3, flower4, flower5];

  const isMainPage = location.pathname === '/';

  useEffect(() => {
    const triggerSpin = () => {
      if (coinRef.current) {
        coinRef.current.classList.remove('spinning');
        void coinRef.current.offsetWidth;
        coinRef.current.classList.add('spinning');
        setCurrentFlowerIndex((prev) => (prev + 1) % flowers.length);
      }
    };

    let inactivityTimeout: NodeJS.Timeout | null = null;
    let spinInterval: NodeJS.Timeout | null = null;
    let lastMouseX = 0;
    let lastMouseY = 0;

    const stopSpinning = () => {
      if (spinInterval) {
        clearInterval(spinInterval);
        spinInterval = null;
      }
    };

    const startSpinning = () => {
      if (!spinInterval) {
        spinInterval = setInterval(triggerSpin, 5000);
      }
    };

    const resetInactivityTimer = (e: MouseEvent) => {
      const currentX = e.clientX;
      const currentY = e.clientY;
      const movedSignificantly =
        Math.abs(currentX - lastMouseX) > 5 || Math.abs(currentY - lastMouseY) > 5;

      if (movedSignificantly) {
        lastMouseX = currentX;
        lastMouseY = currentY;
        stopSpinning();

        if (inactivityTimeout) {
          clearTimeout(inactivityTimeout);
        }

        inactivityTimeout = setTimeout(() => {
          startSpinning();
        }, 5000);
      }
    };

    triggerSpin();
    document.addEventListener('mousemove', resetInactivityTimer);

    return () => {
      document.removeEventListener('mousemove', resetInactivityTimer);
      if (inactivityTimeout) {
        clearTimeout(inactivityTimeout);
      }
      if (spinInterval) {
        clearInterval(spinInterval);
      }
    };
  }, [flowers.length]);

  const getHeaderClass = () => {
    if (!isMainPage) {
      return 'header-slide-3';
    }

    switch (currentSlide) {
      case 0:
        return 'header-slide-1';
      case 1:
        return 'header-slide-2';
      case 2:
        return 'header-slide-3';
      default:
        return '';
    }
  };

  return (
    <header className={`header ${getHeaderClass()}`}>
      <div className="header-container">
        <span className="header-text">Flower Garden</span>

        <Link to="/" className="nav-link-logo" aria-label="Garden Game home">
          <div className="coin" ref={coinRef}>
            <div className="coin-face coin-front">
              <img src={logo} alt="Garden Game logo" />
            </div>
            <div className="coin-face coin-back">
              <img src={flowers[currentFlowerIndex]} alt="" />
            </div>
          </div>
        </Link>

        <div className="header-actions">
          <span className="header-text">Play with Crypto</span>
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
