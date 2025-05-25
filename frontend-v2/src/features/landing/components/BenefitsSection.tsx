'use client';

export function BenefitsSection() {
  return (
    <section
      id="benefits"
      className="py-20 px-6 bg-gradient-to-br from-blue-50 to-purple-50"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Transform Your Practice,
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 text-transparent bg-clip-text"> Transform Your Life</span>
          </h2>
          <p className="text-xl text-gray-600">
            Real results from real accountants using AutoBooks
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 text-transparent bg-clip-text mb-2">73%</div>
            <p className="text-gray-700 font-semibold">Time Saved</p>
            <p className="text-sm text-gray-600">on routine bookkeeping</p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 text-transparent bg-clip-text mb-2">2.5x</div>
            <p className="text-gray-700 font-semibold">More Clients</p>
            <p className="text-sm text-gray-600">served per accountant</p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 text-transparent bg-clip-text mb-2">45%</div>
            <p className="text-gray-700 font-semibold">Revenue Increase</p>
            <p className="text-sm text-gray-600">within first year</p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 text-transparent bg-clip-text mb-2">98%</div>
            <p className="text-gray-700 font-semibold">Client Satisfaction</p>
            <p className="text-sm text-gray-600">faster turnaround times</p>
          </div>
        </div>

        {/* Testimonial */}
        <div
          className="bg-white rounded-3xl shadow-xl p-8 md:p-12 max-w-4xl mx-auto"
        >
          <div className="flex items-start space-x-4 mb-6">
            <img
              src="https://via.placeholder.com/64"
              alt="Sarah Chen"
              className="w-16 h-16 rounded-full"
            />
            <div>
              <p className="font-semibold text-gray-900">Sarah Chen, CPA</p>
              <p className="text-gray-600">Chen & Associates Accounting</p>
              <div className="flex text-yellow-400 mt-1">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
              </div>
            </div>
          </div>
          <blockquote className="text-lg text-gray-700 italic">
            "AutoBooks transformed my practice. I've gone from managing 30
            clients to over 75, while actually working fewer hours. The AI
            categorization alone saves me 20+ hours per week. My clients love
            the faster turnaround, and I love focusing on advisory work instead
            of data entry."
          </blockquote>
        </div>
      </div>
    </section>
  );
}
