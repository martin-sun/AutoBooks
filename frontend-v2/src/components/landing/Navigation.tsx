"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { LanguageSwitcher } from "@/components/landing/LanguageSwitcher";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faXmark,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // 获取当前语言
  const currentLocale = useLocale();
  // 使用 Landing 命名空间的翻译
  const t = useTranslations("Landing");
  // 使用 Index 命名空间的翻译（用于登录/注册按钮）
  const tIndex = useTranslations("Index");

  // 组件已经使用直接的翻译方法，不再需要调试信息

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="fixed w-full bg-white/90 backdrop-blur-md z-50 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faChartLine}
                  className="h-5 w-5 text-white"
                />
              </div>
              <span className="text-2xl font-bold gradient-text">
                AutoBooks
              </span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-gray-700 hover:text-primary transition"
            >
              {t("navigation.features")}
            </a>
            <a
              href="#benefits"
              className="text-gray-700 hover:text-primary transition"
            >
              {t("navigation.benefits")}
            </a>
            <a
              href="#pricing"
              className="text-gray-700 hover:text-primary transition"
            >
              {t("navigation.pricing")}
            </a>
            <a href="#" className="text-gray-700 hover:text-primary transition">
              {t("navigation.contact")}
            </a>
            <LanguageSwitcher />
            <Link
              href="/auth/signup"
              className="bg-primary text-white px-6 py-2 rounded-full hover:bg-blue-600 transition"
            >
              {tIndex("auth.signUp")}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <FontAwesomeIcon
              icon={mobileMenuOpen ? faXmark : faBars}
              className="h-6 w-6"
            />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white flex flex-col p-6 shadow-lg">
            <a
              href="#features"
              className="text-gray-700 py-2 hover:text-primary transition"
            >
              {t("navigation.features")}
            </a>
            <a
              href="#benefits"
              className="text-gray-700 py-2 hover:text-primary transition"
            >
              {t("navigation.benefits")}
            </a>
            <a
              href="#pricing"
              className="text-gray-700 py-2 hover:text-primary transition"
            >
              {t("navigation.pricing")}
            </a>
            <a
              href="#"
              className="text-gray-700 py-2 hover:text-primary transition"
            >
              {t("navigation.contact")}
            </a>
            <div className="py-2">
              <LanguageSwitcher />
            </div>
            <Link
              href="/auth/signup"
              className="bg-primary text-white px-6 py-2 mt-4 rounded-full hover:bg-blue-600 transition text-center"
            >
              {tIndex("auth.signUp")}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
