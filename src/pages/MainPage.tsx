import React, { memo } from 'react';
import { SlideProvider } from '../components/SlideContext';
import Header from '../components/Header/Header';
import Hero from '../components/Hero/Hero';
import HowToPlay from '../components/HowToPlay/HowToPlay';
import FlowerTypes from '../components/FlowerTypes/FlowerTypes';
import XLMToken from '../components/XLMToken/XLMToken';
import Footer from '../components/Footer/Footer';

const MainPage: React.FC = () => {
  return (
    <SlideProvider>
      <a className="skip-link" href="#main-content">
        Перейти к содержимому
      </a>
      <Header />
      <main id="main-content">
        <Hero />
        <HowToPlay />
        <FlowerTypes />
        <XLMToken />
      </main>
      <Footer />
    </SlideProvider>
  );
};

export default memo(MainPage);
