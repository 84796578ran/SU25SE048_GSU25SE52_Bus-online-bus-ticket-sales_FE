/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
import React, { ReactNode } from 'react';

interface BookingLayoutProps {
  children: ReactNode;
}

// Server Component layout to avoid hydration mismatch.
export default function BookingLayout({ children }: BookingLayoutProps) {
  return <>{children}</>;
}
