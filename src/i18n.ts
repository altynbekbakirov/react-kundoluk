import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import ru from './languages/ru/translation.json'
import ky from './languages/ky/translation.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'ky',
    supportedLngs: ['ru', 'ky'],
    resources: {
      ru: { translation: ru },
      ky: { translation: ky },
    },
    interpolation: { escapeValue: false },
    detection: {
      order: ['querystring', 'localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n


