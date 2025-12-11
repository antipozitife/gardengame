import React from 'react';
import { SlideProvider } from '../components/SlideContext';
import Header from '../components/Header/Header';
import Hero from '../components/Hero/Hero';
import HowToPlay from '../components/HowToPlay/HowToPlay';
import FlowerTypes from '../components/FlowerTypes/FlowerTypes';
import FLWToken from '../components/FLWToken/FLWToken';
import Footer from '../components/Footer/Footer';

const MainPage: React.FC = () => {
  return (
    <SlideProvider>
      <Header />
      <Hero />
      <HowToPlay />
      <FlowerTypes />
      <FLWToken />
      <Footer />
    </SlideProvider>
  );
};

export default MainPage;
