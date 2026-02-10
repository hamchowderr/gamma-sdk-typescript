/**
 * Gamma SDK - Language Code Definitions
 *
 * This module contains the union type of all supported language codes.
 * Use these codes with `textOptions.language` to specify the output language.
 */

/**
 * Supported language codes for gamma generation.
 *
 * The language code determines the language of the generated text content.
 * Default is 'en' (English US).
 *
 * Regional variants are available for some languages:
 * - English: en (US), en-gb (UK), en-in (India)
 * - Spanish: es (default), es-es (Spain), es-mx (Mexico), es-419 (Latin America)
 * - Portuguese: pt-br (Brazil), pt-pt (Portugal)
 * - Chinese: zh-cn (Simplified), zh-tw (Traditional)
 * - Arabic: ar (default), ar-sa (Saudi Arabia)
 * - Japanese: ja (polite/desu-masu), ja-da (plain/da-dearu)
 */
export type LanguageCode =
  // A
  | 'af'      // Afrikaans
  | 'sq'      // Albanian
  | 'ar'      // Arabic
  | 'ar-sa'   // Arabic (Saudi Arabia)
  // B
  | 'bn'      // Bengali
  | 'bs'      // Bosnian
  | 'bg'      // Bulgarian
  // C
  | 'ca'      // Catalan
  | 'hr'      // Croatian
  | 'cs'      // Czech
  | 'cy'      // Welsh
  // D
  | 'da'      // Danish
  | 'nl'      // Dutch
  // E
  | 'en'      // English (US) - default
  | 'en-gb'   // English (UK)
  | 'en-in'   // English (India)
  | 'et'      // Estonian
  | 'el'      // Greek
  // F
  | 'fi'      // Finnish
  | 'fr'      // French
  | 'fa'      // Persian
  // G
  | 'de'      // German
  | 'gu'      // Gujarati
  // H
  | 'ha'      // Hausa
  | 'he'      // Hebrew
  | 'hi'      // Hindi
  | 'hu'      // Hungarian
  // I
  | 'is'      // Icelandic
  | 'id'      // Indonesian
  | 'it'      // Italian
  // J
  | 'ja'      // Japanese (polite/desu-masu form)
  | 'ja-da'   // Japanese (plain/da-dearu form)
  // K
  | 'kn'      // Kannada
  | 'kk'      // Kazakh
  | 'ko'      // Korean
  // L
  | 'lv'      // Latvian
  | 'lt'      // Lithuanian
  // M
  | 'mk'      // Macedonian
  | 'ms'      // Malay
  | 'ml'      // Malayalam
  | 'mr'      // Marathi
  // N
  | 'nb'      // Norwegian (Bokmal)
  // P
  | 'pl'      // Polish
  | 'pt-br'   // Portuguese (Brazil)
  | 'pt-pt'   // Portuguese (Portugal)
  // R
  | 'ro'      // Romanian
  | 'ru'      // Russian
  // S
  | 'sr'      // Serbian
  | 'sl'      // Slovenian
  | 'es'      // Spanish (default)
  | 'es-es'   // Spanish (Spain)
  | 'es-mx'   // Spanish (Mexico)
  | 'es-419'  // Spanish (Latin America)
  | 'sw'      // Swahili
  | 'sv'      // Swedish
  // T
  | 'tl'      // Tagalog
  | 'ta'      // Tamil
  | 'te'      // Telugu
  | 'th'      // Thai
  | 'tr'      // Turkish
  // U
  | 'uk'      // Ukrainian
  | 'ur'      // Urdu
  | 'uz'      // Uzbek
  // V
  | 'vi'      // Vietnamese
  // Y
  | 'yo'      // Yoruba
  // Z
  | 'zh-cn'   // Simplified Chinese
  | 'zh-tw';  // Traditional Chinese

/**
 * Map of language codes to their human-readable names.
 * Useful for displaying language options in UIs.
 */
export const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  'af': 'Afrikaans',
  'sq': 'Albanian',
  'ar': 'Arabic',
  'ar-sa': 'Arabic (Saudi Arabia)',
  'bn': 'Bengali',
  'bs': 'Bosnian',
  'bg': 'Bulgarian',
  'ca': 'Catalan',
  'hr': 'Croatian',
  'cs': 'Czech',
  'cy': 'Welsh',
  'da': 'Danish',
  'nl': 'Dutch',
  'en': 'English (US)',
  'en-gb': 'English (UK)',
  'en-in': 'English (India)',
  'et': 'Estonian',
  'el': 'Greek',
  'fi': 'Finnish',
  'fr': 'French',
  'fa': 'Persian',
  'de': 'German',
  'gu': 'Gujarati',
  'ha': 'Hausa',
  'he': 'Hebrew',
  'hi': 'Hindi',
  'hu': 'Hungarian',
  'is': 'Icelandic',
  'id': 'Indonesian',
  'it': 'Italian',
  'ja': 'Japanese (Polite)',
  'ja-da': 'Japanese (Plain)',
  'kn': 'Kannada',
  'kk': 'Kazakh',
  'ko': 'Korean',
  'lv': 'Latvian',
  'lt': 'Lithuanian',
  'mk': 'Macedonian',
  'ms': 'Malay',
  'ml': 'Malayalam',
  'mr': 'Marathi',
  'nb': 'Norwegian',
  'pl': 'Polish',
  'pt-br': 'Portuguese (Brazil)',
  'pt-pt': 'Portuguese (Portugal)',
  'ro': 'Romanian',
  'ru': 'Russian',
  'sr': 'Serbian',
  'sl': 'Slovenian',
  'es': 'Spanish',
  'es-es': 'Spanish (Spain)',
  'es-mx': 'Spanish (Mexico)',
  'es-419': 'Spanish (Latin America)',
  'sw': 'Swahili',
  'sv': 'Swedish',
  'tl': 'Tagalog',
  'ta': 'Tamil',
  'te': 'Telugu',
  'th': 'Thai',
  'tr': 'Turkish',
  'uk': 'Ukrainian',
  'ur': 'Urdu',
  'uz': 'Uzbek',
  'vi': 'Vietnamese',
  'yo': 'Yoruba',
  'zh-cn': 'Simplified Chinese',
  'zh-tw': 'Traditional Chinese',
};
