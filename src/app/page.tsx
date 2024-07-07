"use client"

import { useEffect } from 'react';

export default function Home() {

  useEffect(() => {
    window.location.href = 'https://www.validators.app/ping-thing?locale=en&network=mainnet';
  }, []);

  return (
    <div>
      <h1>Redirecting...</h1>
    </div>
  );
}