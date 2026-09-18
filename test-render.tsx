import React from 'react';
import { renderToString } from 'react-dom/server';
import { LandingPage } from './src/pages/LandingPage';

try {
  const html = renderToString(<LandingPage onNavigate={() => {}} />);
  console.log("RENDER SUCCESS, length:", html.length);
} catch (e) {
  console.error("RENDER ERROR:", e);
}
