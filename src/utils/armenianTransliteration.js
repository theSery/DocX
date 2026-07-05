const ARMENIAN_CHAR_MAP = new Map([
  ['\u0531', 'A'],
  ['\u0561', 'a'],
  ['\u0532', 'B'],
  ['\u0562', 'b'],
  ['\u0533', 'G'],
  ['\u0563', 'g'],
  ['\u0534', 'D'],
  ['\u0564', 'd'],
  ['\u0535', 'E'],
  ['\u0565', 'e'],
  ['\u0536', 'Z'],
  ['\u0566', 'z'],
  ['\u0537', 'E'],
  ['\u0567', 'e'],
  ['\u0538', 'E'],
  ['\u0568', 'e'],
  ['\u0539', 'T'],
  ['\u0569', 't'],
  ['\u053A', 'Zh'],
  ['\u056A', 'zh'],
  ['\u053B', 'I'],
  ['\u056B', 'i'],
  ['\u053C', 'L'],
  ['\u056C', 'l'],
  ['\u053D', 'Kh'],
  ['\u056D', 'kh'],
  ['\u053E', 'Ts'],
  ['\u056E', 'ts'],
  ['\u053F', 'K'],
  ['\u056F', 'k'],
  ['\u0540', 'H'],
  ['\u0570', 'h'],
  ['\u0541', 'Dz'],
  ['\u0571', 'dz'],
  ['\u0542', 'Gh'],
  ['\u0572', 'gh'],
  ['\u0543', 'Tch'],
  ['\u0573', 'tch'],
  ['\u0544', 'M'],
  ['\u0574', 'm'],
  ['\u0545', 'Y'],
  ['\u0575', 'y'],
  ['\u0546', 'N'],
  ['\u0576', 'n'],
  ['\u0547', 'Sh'],
  ['\u0577', 'sh'],
  ['\u0548', 'O'],
  ['\u0578', 'o'],
  ['\u0549', 'Ch'],
  ['\u0579', 'ch'],
  ['\u054A', 'P'],
  ['\u057A', 'p'],
  ['\u054B', 'J'],
  ['\u057B', 'j'],
  ['\u054C', 'R'],
  ['\u057C', 'r'],
  ['\u054D', 'S'],
  ['\u057D', 's'],
  ['\u054E', 'V'],
  ['\u057E', 'v'],
  ['\u054F', 'T'],
  ['\u057F', 't'],
  ['\u0550', 'R'],
  ['\u0580', 'r'],
  ['\u0551', 'Ts'],
  ['\u0581', 'ts'],
  ['\u0552', 'W'],
  ['\u0582', 'w'],
  ['\u0553', 'P'],
  ['\u0583', 'p'],
  ['\u0554', 'K'],
  ['\u0584', 'k'],
  ['\u0555', 'O'],
  ['\u0585', 'o'],
  ['\u0556', 'F'],
  ['\u0586', 'f'],
]);

/**
 * Eastern Armenian romanization for search matching.
 * Handles digraphs (ու, Ու, և) before single-character mapping.
 */
export function transliterateArmenian(text) {
  if (text == null || text === '') {
    return '';
  }

  const withDigraphs = String(text)
    .replace(/\u0548\u0582/g, 'U')
    .replace(/\u0578\u0582/g, 'u')
    .replace(/\u0587/g, 'ev');

  let output = '';
  for (const char of withDigraphs) {
    output += ARMENIAN_CHAR_MAP.get(char) ?? char;
  }

  return output;
}

/**
 * Normalizes text for search: transliterates Armenian, lowercases, trims.
 */
export function normalizeSearchText(text) {
  return transliterateArmenian(text).toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Case-insensitive, transliteration-aware substring match for search filters.
 */
export function includesSearchQuery(haystack, query) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return false;
  }

  return normalizeSearchText(haystack).includes(normalizedQuery);
}
