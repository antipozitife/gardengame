import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SlideContext } from '../../components/SlideContext';
import WalletModal from '../../components/WalletModal/WalletModal';
import romashka from '../../assets/growing.avif';
import roza from '../../assets/bukets.jpg';
import gvozdika from '../../assets/earning.jpg';
import bgFlowers1 from '../../assets/growingBackground.jpg';
import bgFlowers2 from '../../assets/buketsBackground.webp';
import bgFlowers3 from '../../assets/money.jpeg';
import './Hero.css';
import { useWallet } from '../../hooks/useWallet';
import { GAME_ACCESS_MODE } from '../../constants/gameMode';

const Hero = () => {
  const navigate = useNavigate();
  const { startDemo } = useWallet();
  const { setCurrentSlide } = useContext(SlideContext);
  const [currentSlide, setLocalSlide] = useState(0);
  const [showWalletModal, setShowWalletModal] = useState(false);

  const slides = [
    {
      id: 1,
      title: 'Выращивай красивые цветы',
      image: romashka,
      bgImage: bgFlowers1,
      bgClass: 'bg-slide-1',
      titleColor: 'var(--theme-on-dark)',
      shadowBlur: 'rgba(0, 0, 0, 0.6)',
    },
    {
      id: 2,
      title: 'Поливай и ухаживай за садом',
      image: roza,
      bgImage: bgFlowers2,
      bgClass: 'bg-slide-2',
      titleColor: 'var(--theme-on-dark)',
      shadowBlur: 'rgba(0, 0, 0, 0.6)',
    },
    {
      id: 3,
      title: 'Играй с настоящей криптовалютой',
      image: gvozdika,
      bgImage: bgFlowers3,
      bgClass: 'bg-slide-3',
      titleColor: '#2d3748',
      shadowBlur: 'rgb(var(--theme-white-rgb) / 0.9)',
    },
  ];

  // Функция обновления слайда с передачей в контекст
  const updateSlide = (index: number) => {
    setLocalSlide(index);
    setCurrentSlide(index); // ← Передаем в контекст для Header
  };

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const interval = setInterval(() => {
      setLocalSlide((prev) => {
        const next = (prev + 1) % slides.length;
        setCurrentSlide(next);
        return next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length, setCurrentSlide]);

  // Функция переключения слайда с обнулением таймера
  const nextSlide = () => {
    updateSlide((currentSlide + 1) % slides.length);
  };

  const prevSlide = () => {
    updateSlide((currentSlide - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    updateSlide(index);
  };

  const scrollToHowToPlay = () => {
    const element = document.getElementById('how-to-play-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePlayClick = () => {
    if (GAME_ACCESS_MODE === 'demo') {
      startDemo();
      navigate('/game');
      return;
    }

    setShowWalletModal(true);
  };

  const handleConnectWallet = () => {
    setShowWalletModal(false);
    navigate('/game');
  };

  const currentBg = slides[currentSlide].bgImage;
  const currentTitleColor = slides[currentSlide].titleColor;
  const currentShadowColor = slides[currentSlide].shadowBlur;

  return (
    <>
      <section
        className={`hero ${slides[currentSlide].bgClass}`}
        id="hero"
        aria-roledescription="carousel"
        aria-label="Презентация Garden Game"
        style={
          {
            backgroundImage: `url(${currentBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            '--slide-title-color': currentTitleColor,
            '--slide-shadow-color': currentShadowColor,
          } as React.CSSProperties
        }
      >
        <div className="hero-overlay" aria-hidden="true"></div>

        <div className="hero-background" aria-hidden="true">
          <div className="flower-pattern flower-pattern-1"></div>
          <div className="flower-pattern flower-pattern-2"></div>
          <div className="flower-pattern flower-pattern-3"></div>
        </div>

        <div className="hero-slider">
          <div className="slider-container" aria-live="polite">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`slide ${index === currentSlide ? 'active' : ''}`}
                style={{
                  transform: `translateX(${(index - currentSlide) * 100}%)`,
                }}
                aria-hidden={index !== currentSlide}
              >
                <div className="slide-content">
                  <div className="slide-text-wrapper">
                    <h1 className="slide-title">{slide.title}</h1>
                  </div>
                  <div className="slide-image-wrapper">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="slide-image"
                      loading={index === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            className="slider-btn slider-btn-prev"
            onClick={prevSlide}
            aria-label="Предыдущий слайд"
            type="button"
          >
            ‹
          </button>
          <button
            className="slider-btn slider-btn-next"
            onClick={nextSlide}
            aria-label="Следующий слайд"
            type="button"
          >
            ›
          </button>

          <div className="slider-dots" role="tablist" aria-label="Слайды">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={index === currentSlide}
                className={`dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Перейти на слайд ${index + 1}`}
              ></button>
            ))}
          </div>
        </div>

        <div className="hero-actions">
          <button type="button" className="btn-primary" onClick={handlePlayClick}>
            Начать играть
          </button>
          <button type="button" className="btn-secondary" onClick={scrollToHowToPlay}>
            Узнать больше
          </button>
        </div>
      </section>

      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onConnect={handleConnectWallet}
      />
    </>
  );
};

export default Hero;
