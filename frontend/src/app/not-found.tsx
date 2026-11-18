import Link from 'next/link';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-6xl font-black text-black mb-4">404</h1>
        <h2 className="text-xl font-bold text-black mb-2">Page Not Found</h2>
        <p className="text-black/60 max-w-md text-sm mb-6">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link
          href="/"
          className="px-8 py-3 bg-black hover:bg-black/80 text-white rounded-full font-medium text-sm transition-all"
        >
          Return to Shop
        </Link>
      </main>
      <Footer />
    </>
  );
}

