import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { AdminAuthProvider } from '@/context/admin-auth-context';
import { CartProvider } from '@/context/cart-context';
import CartDrawer from '@/components/storefront/CartDrawer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nocfinity Commerce | Modern E-Commerce Store',
  description: 'Full-stack e-commerce storefront and role-based administration platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="max-w-full overflow-x-hidden">
      <body className={`${inter.className} bg-slate-50/30 text-slate-900 antialiased min-h-screen flex flex-col w-full max-w-full overflow-x-hidden`}>
        <AuthProvider>
          <AdminAuthProvider>
            <CartProvider>
              {children}
              <CartDrawer />
            </CartProvider>
          </AdminAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
