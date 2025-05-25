'use client';

import Link from 'next/link';

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 px-6 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Pricing That <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 text-transparent bg-clip-text">Grows With You</span>
          </h2>
          <p className="text-xl text-gray-600">Start free, scale as you grow</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Starter Plan */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
            <p className="text-gray-600 mb-6">Perfect for new practices</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">$0</span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <i className="fas fa-check text-green-500 mr-3"></i>
                Up to 5 clients
              </li>
              <li className="flex items-center">
                <i className="fas fa-check text-green-500 mr-3"></i>
                AI categorization
              </li>
              <li className="flex items-center">
                <i className="fas fa-check text-green-500 mr-3"></i>
                Basic reports
              </li>
              <li className="flex items-center">
                <i className="fas fa-check text-green-500 mr-3"></i>
                Email support
              </li>
            </ul>
            <Link
              href="/auth/signup"
              className="block w-full text-center border border-gray-300 text-gray-700 py-3 rounded-full hover:border-blue-600 hover:text-blue-600 transition"
            >
              Start Free
            </Link>
          </div>

          {/* Professional Plan */}
          <div
            className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 shadow-xl text-white relative"
          >
            <div
              className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-semibold"
            >
              MOST POPULAR
            </div>
            <h3 className="text-2xl font-bold mb-2">Professional</h3>
            <p className="text-blue-100 mb-6">For growing practices</p>
            <div className="mb-6">
              <span className="text-4xl font-bold">$49</span>
              <span className="text-blue-100">/month per 10 clients</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <i className="fas fa-check text-white mr-3"></i>
                Unlimited clients
              </li>
              <li className="flex items-center">
                <i className="fas fa-check text-white mr-3"></i>
                Advanced AI features
              </li>
              <li className="flex items-center">
                <i className="fas fa-check text-white mr-3"></i>
                All CRA reports
              </li>
              <li className="flex items-center">
                <i className="fas fa-check text-white mr-3"></i>
                Priority support
              </li>
              <li className="flex items-center">
                <i className="fas fa-check text-white mr-3"></i>
                Client portal
              </li>
            </ul>
            <Link
              href="/auth/signup"
              className="block w-full text-center bg-white text-blue-600 py-3 rounded-full hover:bg-gray-100 transition font-semibold"
            >
              Start 3-Month Trial
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
            <p className="text-gray-600 mb-6">For large firms</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">Custom</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <i className="fas fa-check text-green-500 mr-3"></i>
                Everything in Pro
              </li>
              <li className="flex items-center">
                <i className="fas fa-check text-green-500 mr-3"></i>
                Custom integrations
              </li>
              <li className="flex items-center">
                <i className="fas fa-check text-green-500 mr-3"></i>
                Dedicated account manager
              </li>
              <li className="flex items-center">
                <i className="fas fa-check text-green-500 mr-3"></i>
                On-premise option
              </li>
              <li className="flex items-center">
                <i className="fas fa-check text-green-500 mr-3"></i>
                SLA guarantee
              </li>
            </ul>
            <button
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-full hover:border-blue-600 hover:text-blue-600 transition"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
