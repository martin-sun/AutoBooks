'use client';

import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div
              className="inline-flex items-center bg-blue-50 px-4 py-2 rounded-full mb-6"
            >
              <span
                className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"
              ></span>
              <span className="text-sm text-gray-700"
                >AI-Powered • Built for Canadian Accountants</span
              >
            </div>
            <h1
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Serve More Clients,<br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 text-transparent bg-clip-text">Earn More Revenue</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              AutoBooks is your AI-powered bookkeeping assistant that automates
              repetitive tasks, so you can focus on high-value advisory services
              and grow your practice.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/auth/signup"
                className="bg-blue-600 text-white px-8 py-4 rounded-full hover:bg-blue-700 transition flex items-center justify-center group"
              >
                Start 3-Month Free Trial
                <i
                  className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition"
                ></i>
              </Link>
              <button
                className="border border-gray-300 text-gray-700 px-8 py-4 rounded-full hover:border-blue-600 hover:text-blue-600 transition flex items-center justify-center"
              >
                <i className="fas fa-play-circle mr-2"></i>
                Watch Demo
              </button>
            </div>
            <div className="mt-8 flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <i className="fas fa-check text-green-500 mr-2"></i>
                No credit card required
              </div>
              <div className="flex items-center">
                <i className="fas fa-check text-green-500 mr-2"></i>
                Cancel anytime
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="relative">
              <div
                className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl blur-3xl"
              ></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8">
                {/* AI Assistant Interface Mock */}
                <div className="bg-gray-50 rounded-xl p-6 mb-4">
                  <div className="flex items-start space-x-3">
                    <div
                      className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0"
                    >
                      <i className="fas fa-robot text-white text-sm"></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-2">AI Assistant</p>
                      <p className="text-gray-800">
                        I've categorized 847 transactions this month. GST/HST
                        report is ready with $12,450 in input tax credits
                        identified.
                      </p>
                    </div>
                  </div>
                </div>
                {/* Stats Dashboard Mock */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Time Saved</p>
                    <p className="text-2xl font-bold text-gray-900">18.5 hrs</p>
                    <p className="text-xs text-green-600">This month</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Clients Served</p>
                    <p className="text-2xl font-bold text-gray-900">47</p>
                    <p className="text-xs text-green-600">↑ 32% increase</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
