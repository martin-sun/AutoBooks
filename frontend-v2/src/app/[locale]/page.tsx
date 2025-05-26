import { LandingPage } from "@/components/landing/LandingPage";

/**
 * Home 页面组件
 * 
 * 这是一个服务器组件，不需要 'use client' 指令
 * 使用 LandingPage 组件作为主页内容，遵循 DRY 原则，避免代码重复
 */
export default function Home() {
  return <LandingPage />;
}
