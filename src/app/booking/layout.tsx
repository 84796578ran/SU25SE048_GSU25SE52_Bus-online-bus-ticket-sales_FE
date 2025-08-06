'use client';
import React from 'react';

interface BookingLayoutProps {
  children: React.ReactNode;
}

export default function BookingLayout({ children }: BookingLayoutProps) {
  return (
    <div className="booking-layout">
      {children}
    </div>
  );
}
