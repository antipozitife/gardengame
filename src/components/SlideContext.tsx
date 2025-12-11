import React, { createContext, useState } from 'react';

export const SlideContext = createContext<{
  currentSlide: number;
  setCurrentSlide: (slide: number) => void;
}>({
  currentSlide: 0,
  setCurrentSlide: () => {},
});

export const SlideProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <SlideContext.Provider value={{ currentSlide, setCurrentSlide }}>
      {children}
    </SlideContext.Provider>
  );
};
