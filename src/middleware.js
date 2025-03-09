import createMiddleware from 'next-intl/middleware';
import routing from './i18n/routing';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'pl'],

  // Used when no locale matches
  defaultLocale: 'en'
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(pl|en)/:path*']
};
