'use client';

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Automate the Mundane,
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 text-transparent bg-clip-text"> Amplify Your Expertise</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Let AI handle the repetitive bookkeeping tasks while you focus on
            strategic advisory services
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition"
          >
            <div
              className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6"
            >
              <i className="fas fa-brain text-2xl text-blue-600"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              AI-Powered Categorization
            </h3>
            <p className="text-gray-600 mb-6">
              Automatically categorize transactions with 95% accuracy. Our AI
              learns from your corrections and improves over time.
            </p>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <i className="fas fa-check text-green-500 mr-3 mt-1"></i>
                Smart receipt scanning & OCR
              </li>
              <li className="flex items-start">
                <i className="fas fa-check text-green-500 mr-3 mt-1"></i>
                Learns client-specific rules
              </li>
              <li className="flex items-start">
                <i className="fas fa-check text-green-500 mr-3 mt-1"></i>
                Bulk categorization in seconds
              </li>
            </ul>
          </div>

          {/* Feature 2 */}
          <div
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition"
          >
            <div
              className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6"
            >
              <i className="fas fa-file-invoice text-2xl text-purple-600"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Canadian Tax Compliance
            </h3>
            <p className="text-gray-600 mb-6">
              Built specifically for Canadian tax requirements. Generate
              CRA-ready reports with one click.
            </p>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <i className="fas fa-check text-green-500 mr-3 mt-1"></i>
                Automatic GST/HST calculations
              </li>
              <li className="flex items-start">
                <i className="fas fa-check text-green-500 mr-3 mt-1"></i>
                T2125 & T2 report generation
              </li>
              <li className="flex items-start">
                <i className="fas fa-check text-green-500 mr-3 mt-1"></i>
                Provincial tax compliance
              </li>
            </ul>
          </div>

          {/* Feature 3 */}
          <div
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition"
          >
            <div
              className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center mb-6"
            >
              <i className="fas fa-users text-2xl text-cyan-600"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Multi-Client Management
            </h3>
            <p className="text-gray-600 mb-6">
              Seamlessly switch between clients. Manage hundreds of books from a
              single dashboard.
            </p>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <i className="fas fa-check text-green-500 mr-3 mt-1"></i>
                One-click client switching
              </li>
              <li className="flex items-start">
                <i className="fas fa-check text-green-500 mr-3 mt-1"></i>
                Bulk operations across clients
              </li>
              <li className="flex items-start">
                <i className="fas fa-check text-green-500 mr-3 mt-1"></i>
                Client portal access
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
