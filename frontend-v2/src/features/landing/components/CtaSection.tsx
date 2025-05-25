'use client';

import Link from 'next/link';

export function CtaSection() {
  return (
    <section className="py-20 px-6 bg-gradient-to-br from-blue-600 to-purple-600">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Transform Your Practice?
        </h2>
        <p className="text-xl text-blue-100 mb-8">
          Join thousands of Canadian accountants who are serving more clients
          and earning more revenue with AutoBooks.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/signup"
            className="bg-white text-blue-600 px-8 py-4 rounded-full hover:bg-gray-100 transition font-semibold"
          >
            Start Your 3-Month Free Trial
          </Link>
          <button
            className="border-2 border-white text-white px-8 py-4 rounded-full hover:bg-white/10 transition font-semibold"
          >
            Schedule a Demo
          </button>
        </div>
        <p className="text-sm text-blue-100 mt-6">
          No credit card required • Setup in 15 minutes • Cancel anytime
        </p>
      </div>
    </section>
  );
}
