'use server';

import {cookies} from 'next/headers';

const COOKIE_NAME = 'NEXT_LOCALE';
const defaultLocale = 'es';

export async function getUserLocale() {
  const c = await cookies();
  return c.get(COOKIE_NAME)?.value || defaultLocale;
}

export async function setUserLocale(locale: string) {
  const c = await cookies();
  c.set(COOKIE_NAME, locale);
}
