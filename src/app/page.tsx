/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
'use client';
import dynamic from 'next/dynamic';

const DynamicHomePage = dynamic(() => import('./home-client'), {
  ssr: false,
  loading: () => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px'
    }}>
      Loading...
    </div>
  ),
});

export default function Page() {
  return <DynamicHomePage />;
}
