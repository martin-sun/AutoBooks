import Link from 'next/link';

// 使用客户端组件封装来处理翻译
import { HomePageContent } from '@/components/home/HomePageContent';

// 这是一个静态的服务器组件，不会导致params.locale错误
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24">
      <HomePageContent />
    </main>
  );
}
