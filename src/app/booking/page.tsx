'use client';
import dynamic from 'next/dynamic';

const DynamicBookingPage = dynamic(() => import('./booking-client'), {
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

export default function BookingPage() {
  return <DynamicBookingPage />;
}
