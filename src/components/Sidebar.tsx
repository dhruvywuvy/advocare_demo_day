'use client'
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Users, MessageSquare, Settings } from 'lucide-react';

export const Sidebar = () => {
  const pathname = usePathname();

  const navigation = [
    { name: 'Bill Analysis', href: '/form', icon: FileText },
    { name: 'Find an Advocate', href: '/marketplace', icon: Users },
    { name: 'Message your Advocate', href: '/messages', icon: MessageSquare },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white border-r min-h-screen p-4">
      {/* Logo */} bil
      {/* <div className="mb-8">
        <Link href="/" className="flex items-center">
          <span className="text-teal-600 text-xl font-semibold">advocare</span>
        </Link>
      </div> */}

      {/* Navigation Links */}
      <nav className="space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors
                ${isActive 
                  ? 'bg-gray-100 text-teal-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};