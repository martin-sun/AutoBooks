'use client';

import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="fixed w-full bg-white/90 backdrop-blur-md z-50 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <div
                className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center"
              >
                <i className="fas fa-chart-line text-white text-sm"></i>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 text-transparent bg-clip-text">AutoBooks</span>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Features
            </a>
            <a
              href="#benefits"
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Benefits
            </a>
            <a
              href="#pricing"
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Pricing
            </a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition"
            >
              Contact
            </a>
            <Link
              href="/auth/signin"
              className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
            >
              Start Free Trial
            </Link>
          </div>
          <button className="md:hidden text-gray-700">
            <i className="fas fa-bars text-2xl"></i>
          </button>
        </div>
      </div>
    </nav>
  );
}
