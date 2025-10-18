export const webUrl = 'https://kundoluk.edu.gov.kg/api';
// export const webUrl = 'https://testkundoluk.site/api';

export const formatCurrentDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTerm = (date: Date): number => {
  // Academic year starts in September
  const startYear = date.getMonth() >= 8 ? date.getFullYear() : date.getFullYear() - 1;
  const nextYear = startYear + 1;

  // Term 1: Sep 1 - Nov 9
  const term1Start = new Date(startYear, 8, 1); // Month is 0-indexed, so 8 = September
  const term1End = new Date(startYear, 10, 9); // 10 = November

  // Term 2: Nov 10 - Dec 31
  const term2Start = new Date(startYear, 10, 10);
  const term2End = new Date(startYear, 11, 31); // 11 = December

  // Term 3: Jan 1 - Mar 8 (next year)
  const term3Start = new Date(nextYear, 0, 1); // 0 = January
  const term3End = new Date(nextYear, 2, 8); // 2 = March

  // Term 4: after Mar 8
  if (date >= new Date(term1Start.getTime() - 86400000) && 
      date <= new Date(term1End.getTime() + 86400000)) {
    return 1;
  }

  if (date >= new Date(term2Start.getTime() - 86400000) && 
      date <= new Date(term2End.getTime() + 86400000)) {
    return 2;
  }

  if (date >= new Date(term3Start.getTime() - 86400000) && 
      date <= new Date(term3End.getTime() + 86400000)) {
    return 3;
  }

  return 4;
};

export const getDayName = (day: string, month: string, year: string, languageCode: string): string => {
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  return date.toLocaleDateString(languageCode === 'ky' ? 'ky-KG' : 'ru-RU', options);
};

export const getLocale = (language: string): string => {
  const localeMap: { [key: string]: string } = {
    'ky': 'ky-KG',
    'ru': 'ru-RU',
    'en': 'en-US',
  };
  
  return localeMap[language] || language;
};

const kyrgyzDays = ['Жек', 'Дүй', 'Шей', 'Шар', 'Бей', 'Жум', 'Ише'];
const kyrgyzMonths = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

export const getLocalizedDay = (date: Date, locale: string) => {
  if (locale.startsWith('ky')) return kyrgyzDays[date.getDay()];
  return date.toLocaleDateString(locale, { weekday: 'short' });
};

export const getLocalizedMonth = (date: Date, locale: string) => {
  if (locale.startsWith('ky')) return kyrgyzMonths[date.getMonth()];
  return date.toLocaleDateString(locale, { month: 'short' });
};
