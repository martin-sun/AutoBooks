import './globals.css';

export const metadata = {
  title: 'AutoBooks',
  description: 'Professional Bookkeeping Solution',
};

// Root layout now just passes children through to locale layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
