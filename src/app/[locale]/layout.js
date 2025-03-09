export const dynamic = "force-dynamic";

import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '../../i18n/routing';

import "../../App.css";

export async function generateMetadata({ params }) {
  const {locale} = await params;
  // Load translations for the current locale
  try {
    const messages = require(`../../locales/${locale || 'en'}/strings.json`);
    return {
      title: messages.app.title,
      description: messages.app.description,
      themeColor: "#6a0dad",
    };
  } catch (error) {
    return {
      title: "Mystic AI - Tarot Readings",
      description: "AI-powered Tarot reading application",
      themeColor: "#6a0dad",
    };
  }
}


export default async function LocaleLayout({
  children,
  params
}) {
  // Ensure that the incoming `locale` is valid
  const {locale} = await params;
  if (!routing.locales.includes(locale)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
