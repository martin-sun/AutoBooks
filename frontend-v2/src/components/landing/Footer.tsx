'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTwitter,
  faLinkedin,
  faFacebook,
  faYoutube
} from '@fortawesome/free-brands-svg-icons';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';

export function Footer() {
  const t = useTranslations('Landing.footer');
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faChartLine} className="text-white text-sm" />
              </div>
              <span className="text-xl font-bold text-white">AutoBooks</span>
            </div>
            <p className="text-sm">
              {t('description')}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">
              {t('sections.product.title')}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#features" className="hover:text-white transition">
                  {t('sections.product.links.features')}
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-white transition">
                  {t('sections.product.links.pricing')}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  {t('sections.product.links.security')}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  {t('sections.product.links.integrations')}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">
              {t('sections.resources.title')}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-white transition">
                  {t('sections.resources.links.documentation')}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  {t('sections.resources.links.api')}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  {t('sections.resources.links.blog')}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  {t('sections.resources.links.webinars')}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">
              {t('sections.company.title')}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-white transition">
                  {t('sections.company.links.about')}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  {t('sections.company.links.contact')}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  {t('sections.company.links.privacy')}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  {t('sections.company.links.terms')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} AutoBooks. 
            {t('copyright')}
          </p>
          <div className="flex space-x-6">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
              <FontAwesomeIcon icon={faTwitter} className="fa-icon" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
              <FontAwesomeIcon icon={faLinkedin} className="fa-icon" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
              <FontAwesomeIcon icon={faFacebook} className="fa-icon" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
              <FontAwesomeIcon icon={faYoutube} className="fa-icon" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
