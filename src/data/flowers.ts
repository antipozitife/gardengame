import astra from '../assets/astra.avif';
import romashka from '../assets/romashka.png';
import gvozdika from '../assets/gvozdika.png';
import roza from '../assets/roza.png';
import eustoma from '../assets/eustoma.png';

export interface Flower {
  id: number;
  name: string;
  image: string;
  price: number;
  incomeValue: number;
  rarity: string;
  rarityColor: string;
}

export const FLOWERS: Flower[] = [
  {
    id: 1,
    name: 'Астра',
    image: astra,
    price: 10,
    incomeValue: 0.5,
    rarity: 'Обычная',
    rarityColor: '#718096',
  },
  {
    id: 2,
    name: 'Ромашка',
    image: romashka,
    price: 25,
    incomeValue: 1.2,
    rarity: 'Необычная',
    rarityColor: '#48BB78',
  },
  {
    id: 3,
    name: 'Гвоздика',
    image: gvozdika,
    price: 50,
    incomeValue: 3,
    rarity: 'Редкая',
    rarityColor: '#4299E1',
  },
  {
    id: 4,
    name: 'Роза',
    image: roza,
    price: 100,
    incomeValue: 7,
    rarity: 'Эпическая',
    rarityColor: '#9F7AEA',
  },
  {
    id: 5,
    name: 'Эустома',
    image: eustoma,
    price: 200,
    incomeValue: 15,
    rarity: 'Легендарная',
    rarityColor: '#ED8936',
  },
];

export const getFlowerById = (id: number): Flower | undefined =>
  FLOWERS.find((flower) => flower.id === id);
