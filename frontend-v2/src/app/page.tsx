/**
 * 根页面 - 由 middleware 处理语言重定向
 * 这个页面通常不会被直接访问，因为 middleware 会处理重定向
 */
export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">AutoBooks</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
