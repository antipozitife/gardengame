import collection from '../../assets/collection.png';
import { FLOWERS } from '../../data/flowers';
import './FlowerTypes.css';

const FlowerTypes: React.FC = () => {
  const triplicatedFlowers = [...FLOWERS, ...FLOWERS, ...FLOWERS];

  return (
    <section className="flower-types" id="flower-types-section">
      <div className="flower-types-container">
        <h2 className="flower-types-title">
          <img src={collection} alt="Коллекция" className="title-icon" />
          Виды цветов
        </h2>
        <div className="flowers-carousel-wrapper">
          <div className="flowers-carousel-track">
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
