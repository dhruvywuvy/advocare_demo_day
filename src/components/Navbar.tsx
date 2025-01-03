'use client'
//import React, { useEffect } from 'react';
import React from 'react';

import Link from 'next/link';  // Import Next.js Link
import Image from 'next/image';
import { useAuth } from '../context/AuthContext'; // You'll need to create this
import { signOut } from '../lib/supabase';
import { useRouter } from 'next/navigation';

function Navbar() {
  const { user, loading } = useAuth();
  console.log('Auth state:', { user, loading });
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      router.push('/');  // Redirect to home page after logout
    }
  };

  return (
    <header className="w-full fixed top-0 left-0 flex items-center content-between z-[99] h-14 backdrop-blur-2xl">
      <Link href="/"><Image
          src="/logo.png"  // Path relative to public directory
          alt="Advocare Logo"
          width={200}     // Adjust size as needed
          height={60}     // Adjust size as needed
          className="ml-4"  // Add margin if needed
        /></Link>
      <nav className="flex w-full flex-row justify-end items-center">
        {/* <a href="/" className="dark-green-text">Home</a>
        <a href="/support" className="dark-green-text">Support</a> */}
        <Link href="/about">About</Link>
        <Link href="/waitlist">Contact</Link>
        {/*<Link href="/dashboard">Dashboard</Link>
        {user ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <Link href="/login">Login</Link>
        )}*/}
      </nav>
    </header>
  );
}

export default Navbar;