import { useEffect, useRef } from 'react';
import collection from '../../assets/collection.png';
import { FLOWERS } from '../../data/flowers';
import './FlowerTypes.css';

const FlowerTypes: React.FC = () => {
  const triplicatedFlowers = [...FLOWERS, ...FLOWERS, ...FLOWERS];
  const carouselRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef<number>();

  useEffect(() => {
    const carousel = carouselRef.current;
    const track = trackRef.current;
    if (!carousel || !track) return;
    if (!window.matchMedia?.('(max-width: 768px)').matches) return;

    let animationFrame = 0;
    let previousTime = performance.now();
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const getSegmentWidth = () => {
      const firstCard = track.children[0] as HTMLElement | undefined;
      const repeatedFirstCard = track.children[FLOWERS.length] as HTMLElement | undefined;
      return firstCard && repeatedFirstCard
        ? repeatedFirstCard.offsetLeft - firstCard.offsetLeft
        : track.scrollWidth / 3;
    };
    const normalizePosition = () => {
      const segmentWidth = getSegmentWidth();
      if (!segmentWidth) return;

      if (carousel.scrollLeft < segmentWidth * 0.5) {
        carousel.scrollLeft += segmentWidth;
      } else if (carousel.scrollLeft > segmentWidth * 1.5) {
        carousel.scrollLeft -= segmentWidth;
      }
    };

    carousel.scrollLeft = getSegmentWidth();

    const animate = (time: number) => {
      const elapsed = Math.min(time - previousTime, 40);
      previousTime = time;

      normalizePosition();
      if (!pausedRef.current && !prefersReducedMotion) {
        carousel.scrollLeft += elapsed * 0.018;
      }

      animationFrame = window.requestAnimationFrame(animate);
    };

    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      if (resumeTimerRef.current) {
        window.clearTimeout(resumeTimerRef.current);
      }
    };
  }, []);

  const pauseCarousel = () => {
    pausedRef.current = true;
    if (resumeTimerRef.current) {
      window.clearTimeout(resumeTimerRef.current);
    }
  };

  const resumeCarousel = () => {
    if (resumeTimerRef.current) {
      window.clearTimeout(resumeTimerRef.current);
    }
    resumeTimerRef.current = window.setTimeout(() => {
      pausedRef.current = false;
    }, 1200);
  };

  return (
    <section className="flower-types" id="flower-types-section">
      <div className="flower-types-container">
        <h2 className="flower-types-title">
          <img src={collection} alt="Коллекция" className="title-icon" />
          Виды цветов
        </h2>
        <div
          className="flowers-carousel-wrapper"
          ref={carouselRef}
          onPointerDown={pauseCarousel}
          onPointerUp={resumeCarousel}
          onPointerCancel={resumeCarousel}
          onMouseEnter={pauseCarousel}
          onMouseLeave={resumeCarousel}
        >
          <div className="flowers-carousel-track" ref={trackRef}>
            {triplicatedFlowers.map((flower, index) => (
              <div key={`${flower.id}-${index}`} className="flower-card">
                <div className="flower-image-wrapper">
                  <img
                    src={flower.image}
                    alt={flower.name}
                    className="flower-image"
                    style={{ objectFit: 'scale-down' }}
                  />
                </div>
                <h3 className="flower-name">{flower.name}</h3>
                <p className="flower-price">Стоимость: {flower.price} XLM</p>
                <div
                  className="rarity-badge"
                  style={{ backgroundColor: flower.rarityColor }}
                >
                  {flower.rarity}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlowerTypes;
