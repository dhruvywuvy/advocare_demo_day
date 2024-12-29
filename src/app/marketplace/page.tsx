'use client'
import React from 'react';
import Marketplace from '@/src/components/Marketplace';
import { Sidebar } from '@/src/components/Sidebar';

export default function MarketplacePage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">
        <Marketplace />
      </main>
    </div>
  );
}