'use client';
import { Suspense } from 'react';
import ValidationManager from './components/ValidationManager';

export default function Home() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <ValidationManager />
    </Suspense>
  );
}