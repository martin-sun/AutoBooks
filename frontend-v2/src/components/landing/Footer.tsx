'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';

export function Footer() {
  const currentLocale = useLocale();
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">📊</span>
              </div>
              <span className="text-xl font-bold text-white">AutoBooks</span>
            </div>
            <p className="text-sm">
              {currentLocale === 'zh' ? 'AI 驱动的加拿大会计师记账助手。' : 
               currentLocale === 'fr' ? 'Assistant de comptabilité alimenté par l\'IA pour les comptables canadiens.' : 
               'AI-powered bookkeeping assistant for Canadian accountants.'}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">
              {currentLocale === 'zh' ? '产品' : 
               currentLocale === 'fr' ? 'Produit' : 
               'Product'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#features" className="hover:text-white transition">
                  {currentLocale === 'zh' ? '功能' : 
                   currentLocale === 'fr' ? 'Fonctionnalités' : 
                   'Features'}
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-white transition">
                  {currentLocale === 'zh' ? '价格' : 
                   currentLocale === 'fr' ? 'Tarifs' : 
                   'Pricing'}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  {currentLocale === 'zh' ? '安全性' : 
                   currentLocale === 'fr' ? 'Sécurité' : 
                   'Security'}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  {currentLocale === 'zh' ? '集成' : 
                   currentLocale === 'fr' ? 'Intégrations' : 
                   'Integrations'}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">
              {currentLocale === 'zh' ? '资源' : 
               currentLocale === 'fr' ? 'Ressources' : 
               'Resources'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-white transition">
                  {currentLocale === 'zh' ? '文档' : 
                   currentLocale === 'fr' ? 'Documentation' : 
                   'Documentation'}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  {currentLocale === 'zh' ? 'API 参考' : 
                   currentLocale === 'fr' ? 'Référence API' : 
                   'API Reference'}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  {currentLocale === 'zh' ? '博客' : 
                   currentLocale === 'fr' ? 'Blog' : 
                   'Blog'}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  {currentLocale === 'zh' ? '网络研讨会' : 
                   currentLocale === 'fr' ? 'Webinaires' : 
                   'Webinars'}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">
              {currentLocale === 'zh' ? '公司' : 
               currentLocale === 'fr' ? 'Entreprise' : 
               'Company'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-white transition">
                  {currentLocale === 'zh' ? '关于我们' : 
                   currentLocale === 'fr' ? 'À propos de nous' : 
                   'About Us'}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  {currentLocale === 'zh' ? '联系我们' : 
                   currentLocale === 'fr' ? 'Contact' : 
                   'Contact'}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  {currentLocale === 'zh' ? '隐私政策' : 
                   currentLocale === 'fr' ? 'Politique de confidentialité' : 
                   'Privacy Policy'}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  {currentLocale === 'zh' ? '服务条款' : 
                   currentLocale === 'fr' ? 'Conditions d\'utilisation' : 
                   'Terms of Service'}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} AutoBooks. 
            {currentLocale === 'zh' ? '在加拿大用 ❤️ 制造 🇨🇦' : 
             currentLocale === 'fr' ? 'Fait avec ❤️ au Canada 🇨🇦' : 
             'Made with ❤️ in Canada 🇨🇦'}
          </p>
          <div className="flex space-x-6">
            <Link href="#" className="hover:text-white transition">
              <span className="sr-only">Twitter</span>
              <span>𝕏</span>
            </Link>
            <Link href="#" className="hover:text-white transition">
              <span className="sr-only">LinkedIn</span>
              <span>in</span>
            </Link>
            <Link href="#" className="hover:text-white transition">
              <span className="sr-only">Facebook</span>
              <span>f</span>
            </Link>
            <Link href="#" className="hover:text-white transition">
              <span className="sr-only">YouTube</span>
              <span>▶</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
