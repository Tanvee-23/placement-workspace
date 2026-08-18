import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to trigger scroll animations.
 * Observes all '.reveal' elements and adds the '.in' class when they enter the viewport.
 * Re-runs whenever the route path changes.
 */
export default function useScrollReveal() {
  const location = useLocation();

  useEffect(() => {
    // A brief timeout ensures React has committed the DOM changes for the new route
    const timer = setTimeout(() => {
      const reveals = document.querySelectorAll('.reveal');
      
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('in');
              io.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.1,
        }
      );

      reveals.forEach((el) => {
        // Reset animation state to allow clean animation trigger
        el.classList.remove('in');
        io.observe(el);
      });

      return () => {
        io.disconnect();
      };
    }, 50);

    return () => clearTimeout(timer);
  }, [location.pathname]);
}
