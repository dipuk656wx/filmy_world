import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const ScrollRestoration = () => {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    // Only scroll to top on PUSH navigation (new navigation)
    // For POP navigation (back/forward), let browser handle scroll restoration
    if (navigationType === 'PUSH') {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.search, navigationType]);

  return null;
};

export default ScrollRestoration;
