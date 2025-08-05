import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export const useScrollToTop = () => {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    // Only scroll to top on PUSH navigation (new navigation)
    // For POP navigation (back/forward), let browser handle scroll restoration
    if (navigationType === 'PUSH') {
      // Use setTimeout to ensure the component has rendered
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 0);
    }
  }, [location.pathname, location.search, navigationType]);
};
