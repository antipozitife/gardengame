import astra from '../../assets/astra.avif';
import romashka from '../../assets/romashka.png';
import gvozdika from '../../assets/gvozdika.png';
import roza from '../../assets/roza.png';
import eustoma from '../../assets/eustoma.png';
import collection from '../../assets/collection.png';

import './FlowerTypes.css';

const FlowerTypes: React.FC = () => {

  const flowers = [
    {
      id: 1,
      name: 'Астра',
      image: astra,
      price: '1 FLW',
      rarity: 'Обычный',
      rarityClass: 'common',
      rarityColor: '#718096',
    },
    {
      id: 2,
      name: 'Ромашка',
      image: romashka,
      price: '1.5 FLW',
      rarity: 'Необычный',
      rarityClass: 'uncommon',
      rarityColor: '#48BB78',
    },
    {
      id: 3,
      name: 'Гвоздика',
      image: gvozdika,
      price: '2 FLW',
      rarity: 'Редкий',
      rarityClass: 'rare',
      rarityColor: '#4299E1',
    },
    {
      id: 4,
      name: 'Роза',
      image: roza,
      price: '3 FLW',
      rarity: 'Эпический',
      rarityClass: 'epic',
      rarityColor: '#9F7AEA',
    },
    {
      id: 5,
      name: 'Эустома',
      image: eustoma,
      price: '5 FLW',
      rarity: 'Легендарный',
      rarityClass: 'legendary',
      rarityColor: '#ED8936',
    },
  ];

  // Утраиваем массив для бесконечной прокрутки
  const triplicatedFlowers = [...flowers, ...flowers, ...flowers];

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
              <div key={index} className="flower-card">
                <div className="flower-image-wrapper">
                  <img 
                    src={flower.image} 
                    alt={flower.name} 
                    className="flower-image"
                    style={{ objectFit: 'scale-down' }}
                  />
                </div>
                <h3 className="flower-name">{flower.name}</h3>
                <p className="flower-price">Стоимость: {flower.price}</p>
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
