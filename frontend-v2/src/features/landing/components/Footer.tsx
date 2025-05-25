'use client';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div
                className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center"
              >
                <i className="fas fa-chart-line text-white text-sm"></i>
              </div>
              <span className="text-xl font-bold text-white">AutoBooks</span>
            </div>
            <p className="text-sm">
              AI-powered bookkeeping assistant for Canadian accountants.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#features" className="hover:text-white transition">Features</a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition">Pricing</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">Security</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">Integrations</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition"
                  >Documentation</a
                >
              </li>
              <li>
                <a href="#" className="hover:text-white transition"
                  >API Reference</a
                >
              </li>
              <li><a href="#" className="hover:text-white transition">Blog</a></li>
              <li>
                <a href="#" className="hover:text-white transition">Webinars</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition">About Us</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">Contact</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition"
                  >Privacy Policy</a
                >
              </li>
              <li>
                <a href="#" className="hover:text-white transition"
                  >Terms of Service</a
                >
              </li>
            </ul>
          </div>
        </div>
        <div
          className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center"
        >
          <p className="text-sm mb-4 md:mb-0">
            © 2025 AutoBooks. Made with ❤️ in Canada 🇨🇦
          </p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition"
              ><i className="fab fa-twitter"></i
            ></a>
            <a href="#" className="hover:text-white transition"
              ><i className="fab fa-linkedin"></i
            ></a>
            <a href="#" className="hover:text-white transition"
              ><i className="fab fa-facebook"></i
            ></a>
            <a href="#" className="hover:text-white transition"
              ><i className="fab fa-youtube"></i
            ></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
