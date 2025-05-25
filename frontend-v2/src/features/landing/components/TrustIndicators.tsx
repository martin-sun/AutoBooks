'use client';

export function TrustIndicators() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-6">
        <div
          className="flex flex-wrap justify-center items-center gap-8 md:gap-16 text-gray-400"
        >
          <div className="flex items-center space-x-2">
            <i className="fas fa-shield-alt text-2xl"></i>
            <span className="font-semibold">Bank-Level Security</span>
          </div>
          <div className="flex items-center space-x-2">
            <i className="fas fa-maple-leaf text-2xl text-red-500"></i>
            <span className="font-semibold">100% Canadian</span>
          </div>
          <div className="flex items-center space-x-2">
            <i className="fas fa-clock text-2xl"></i>
            <span className="font-semibold">99.9% Uptime</span>
          </div>
          <div className="flex items-center space-x-2">
            <i className="fas fa-headset text-2xl"></i>
            <span className="font-semibold">24/7 Support</span>
          </div>
        </div>
      </div>
    </section>
  );
}
