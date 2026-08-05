'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export default function PageLoader() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // This perfectly replicates your animation.js timing logic
    const slideOutTimer = setTimeout(() => {
      setIsLoaded(true); // Adds the 'loaded' class
      
      // Fully hide the component after the 0.8s CSS transition finishes
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 800);

      return () => clearTimeout(hideTimer);
    }, 1000);

    return () => clearTimeout(slideOutTimer);
  }, []);

  // Once the animation finishes, remove it from the DOM entirely
  if (!isVisible) return null;

  return (
    // We bind the 'loaded' class dynamically based on the state
    <div id="loader-wrapper" className={isLoaded ? 'loaded' : ''} style={{ display: 'flex' }}>
      <div className="loader-content">
        <Image 
            src="/branding/logo-nav.png" 
            alt="Touch Domain Logo" 
            id="loader-logo" 
            width={200} 
            height={60} 
            priority // Ensures the logo loads instantly before anything else
            className="w-auto h-auto"
        />
        <div className="loader-progress-container">
          <div className="loader-progress-bar"></div>
        </div>
      </div>
    </div>
  );
}