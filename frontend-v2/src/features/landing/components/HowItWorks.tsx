'use client';

export function HowItWorks() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Get Started in <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 text-transparent bg-clip-text">3 Simple Steps</span>
          </h2>
          <p className="text-xl text-gray-600">
            Up and running in less than 15 minutes
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div
              className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6"
            >
              1
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Connect Your Clients
            </h3>
            <p className="text-gray-600">
              Import from QuickBooks, Excel, or connect bank feeds directly
            </p>
          </div>
          <div className="text-center">
            <div
              className="w-20 h-20 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6"
            >
              2
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              AI Does the Heavy Lifting
            </h3>
            <p className="text-gray-600">
              Transactions are automatically categorized and reconciled
            </p>
          </div>
          <div className="text-center">
            <div
              className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6"
            >
              3
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Focus on Advisory
            </h3>
            <p className="text-gray-600">
              Spend your time on high-value services that grow your revenue
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
