export const webUrl = 'https://kundoluk.edu.gov.kg/api';
// export const webUrl = 'https://testkundoluk.site/api';

export const formatCurrentDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};