import React, { useState, useEffect, useContext } from "react";
import { SlideContext } from '../../components/SlideContext';
import WalletModal from '../../components/WalletModal/WalletModal';
import romashka from '../../assets/growing.avif';
import roza from '../../assets/bukets.jpg';
import gvozdika from '../../assets/earning.jpg';
import bgFlowers1 from '../../assets/growingBackground.jpg';
import bgFlowers2 from '../../assets/buketsBackground.webp';
import bgFlowers3 from '../../assets/money.jpeg';
import "./Hero.css";

const Hero = () => {
  const { setCurrentSlide } = useContext(SlideContext);
  const [currentSlide, setLocalSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [showWalletModal, setShowWalletModal] = useState(false);

  const slides = [
    {
      id: 1,
      title: "Выращивай красивые цветы",
      image: romashka,
      bgImage: bgFlowers1,
      bgClass: "bg-slide-1",
      titleColor: "#ffffff",
      shadowBlur: "rgba(0, 0, 0, 0.6)",
    },
    {
      id: 2,
      title: "Собирай цветочные букеты",
      image: roza,
      bgImage: bgFlowers2,
      bgClass: "bg-slide-2",
      titleColor: "#ffffff",
      shadowBlur: "rgba(0, 0, 0, 0.6)",
    },
    {
      id: 3,
      title: "Зарабатывай криптовалюту",
      image: gvozdika,
      bgImage: bgFlowers3,
      bgClass: "bg-slide-3",
      titleColor: "#2d3748",
      shadowBlur: "rgba(255, 255, 255, 0.9)",
    },
  ];

  // Функция обновления слайда с передачей в контекст
  const updateSlide = (index: number) => {
    setLocalSlide(index);
    setCurrentSlide(index); // ← Передаем в контекст для Header
  };

  // Автоматическая ротация слайдов
  useEffect(() => {
    if (!autoplay) return;

    const interval = setInterval(() => {
      updateSlide((currentSlide + 1) % slides.length);
    }, 5000); // Смена слайда каждые 5 секунд

    return () => clearInterval(interval);
  }, [autoplay, slides.length, currentSlide]);

  // Функция переключения слайда с обнулением таймера
  const nextSlide = () => {
    updateSlide((currentSlide + 1) % slides.length);
    setAutoplay(true); // Перезапускаем автоплей
  };

  const prevSlide = () => {
    updateSlide((currentSlide - 1 + slides.length) % slides.length);
    setAutoplay(true); // Перезапускаем автоплей
  };

  const goToSlide = (index: number) => {
    updateSlide(index);
    setAutoplay(true); // Перезапускаем автоплей
  };

  const scrollToHowToPlay = () => {
    const element = document.getElementById('how-to-play-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePlayClick = () => {
    setShowWalletModal(true);
  };

  const handleConnectWallet = (publicKey: string) => {
    // Сохраняем публичный ключ в localStorage
    localStorage.setItem('walletPublicKey', publicKey);
    
    // Закрываем модальное окно
    setShowWalletModal(false);
    
    // Переходим на страницу игры
    window.location.href = '/game';
  };

  const currentBg = slides[currentSlide].bgImage;
  const currentTitleColor = slides[currentSlide].titleColor;
  const currentShadowColor = slides[currentSlide].shadowBlur;

  return (
    <>
    <section 
      className={`hero ${slides[currentSlide].bgClass}`}
      id="hero"
      style={{
        backgroundImage: `url(${currentBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        '--slide-title-color': currentTitleColor,
        '--slide-shadow-color': currentShadowColor,
      } as React.CSSProperties}
    >
      {/* Полупрозрачный оверлей для читаемости */}
      <div className="hero-overlay"></div>

      {/* Декоративный фоновый паттерн */}
      <div className="hero-background">
        <div className="flower-pattern flower-pattern-1"></div>
        <div className="flower-pattern flower-pattern-2"></div>
        <div className="flower-pattern flower-pattern-3"></div>
      </div>

      {/* Основной слайдер */}
      <div className="hero-slider">
        <div className="slider-container">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`slide ${index === currentSlide ? 'active' : ''}`}
              style={{
                transform: `translateX(${(index - currentSlide) * 100}%)`,
              }}
            >
              <div className="slide-content">
                <div className="slide-text-wrapper">
                  <h1 className="slide-title">{slide.title}</h1>
                </div>
                <div className="slide-image-wrapper">
                  <img src={slide.image} alt={slide.title} className="slide-image" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Кнопки навигации */}
        <button 
          className="slider-btn slider-btn-prev" 
          onClick={prevSlide}
          aria-label="Предыдущий слайд"
        >
          ‹
        </button>
        <button 
          className="slider-btn slider-btn-next" 
          onClick={nextSlide}
          aria-label="Следующий слайд"
        >
          ›
        </button>

        {/* Точки навигации */}
        <div className="slider-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Перейти на слайд ${index + 1}`}
            ></button>
          ))}
        </div>
      </div>

      {/* Кнопки действия */}
      <div className="hero-actions">
        <button className="btn-primary" onClick={handlePlayClick}>
          Начать играть
        </button>
        <button className="btn-secondary" onClick={scrollToHowToPlay}>
          Узнать больше
        </button>
      </div>
    </section>

    {/* Модальное окно для подключения кошелька */}
      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onConnect={handleConnectWallet}
      />
    </>
  );
};

export default Hero;
