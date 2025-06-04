'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
const parseQueryString = (queryString: string): Record<string, string> => {
  const params: Record<string, string> = {};
  if (!queryString) return params;
  
  queryString.split('&').forEach(param => {
    if (!param) return;
    const [key, value] = param.split('=');
    if (key && value) {
      params[decodeURIComponent(key)] = decodeURIComponent(value);
      try {
        params[decodeURIComponent(key)] = decodeURIComponent(value);
      } catch (error) {
       console.warn('Failed to decode URL parameter:', param);
    }
    }
  });
  return params;
};

const HashBasedRedirectHandler: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;

    if (hash.startsWith('#/settings/email-confirmation')) {
      const queryString = hash.split('?')[1];
      if (queryString) {
        const params = parseQueryString(queryString);
        const address = params['address'];
        const token = params['token'];

        if (address && token) {
          const newPath = `/confirm-email?address=${encodeURIComponent(address)}&token=${encodeURIComponent(token)}`;
          router.replace(newPath);
        }
      }
    }
  }, [router]);

  return null;
};

export default HashBasedRedirectHandler; 