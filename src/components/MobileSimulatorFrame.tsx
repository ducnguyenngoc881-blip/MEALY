import React from 'react';

// Neutral pass-through wrapper now that the app has transitioned to full native mobile-first architecture
export const MobileSimulatorFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};
