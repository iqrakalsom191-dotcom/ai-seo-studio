'use client';

import Link from 'next/link';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <div className="mb-6">
        <SearchX className="w-16 h-16 mx-auto mb-4" style={{ color: '#6C47FF' }} />
        <h1 className="text-7xl font-bold mb-3" style={{ color: '#6C47FF' }}>404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Page Not Found</h2>
        <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
          Looks like this page has a <span className="font-semibold text-gray-700">bounce rate of 100%</span> — even Google couldn't index it.
        </p>
        <p className="text-gray-400 text-xs mt-2">
          Maybe it needs better internal linking. 🤔
        </p>
      </div>

      <Link
        href="/dashboard"
        className="mt-4 px-6 py-3 rounded-xl text-white text-sm font-semibold transition hover:opacity-90"
        style={{ backgroundColor: '#6C47FF' }}
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
