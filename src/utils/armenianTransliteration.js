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

const RUSSIAN_CHAR_MAP = new Map([
  ['\u0410', 'A'],
  ['\u0430', 'a'],
  ['\u0411', 'B'],
  ['\u0431', 'b'],
  ['\u0412', 'V'],
  ['\u0432', 'v'],
  ['\u0413', 'G'],
  ['\u0433', 'g'],
  ['\u0414', 'D'],
  ['\u0434', 'd'],
  ['\u0415', 'E'],
  ['\u0435', 'e'],
  ['\u0401', 'E'],
  ['\u0451', 'e'],
  ['\u0416', 'Zh'],
  ['\u0436', 'zh'],
  ['\u0417', 'Z'],
  ['\u0437', 'z'],
  ['\u0418', 'I'],
  ['\u0438', 'i'],
  ['\u0419', 'Y'],
  ['\u0439', 'y'],
  ['\u041A', 'K'],
  ['\u043A', 'k'],
  ['\u041B', 'L'],
  ['\u043B', 'l'],
  ['\u041C', 'M'],
  ['\u043C', 'm'],
  ['\u041D', 'N'],
  ['\u043D', 'n'],
  ['\u041E', 'O'],
  ['\u043E', 'o'],
  ['\u041F', 'P'],
  ['\u043F', 'p'],
  ['\u0420', 'R'],
  ['\u0440', 'r'],
  ['\u0421', 'S'],
  ['\u0441', 's'],
  ['\u0422', 'T'],
  ['\u0442', 't'],
  ['\u0423', 'U'],
  ['\u0443', 'u'],
  ['\u0424', 'F'],
  ['\u0444', 'f'],
  ['\u0425', 'Kh'],
  ['\u0445', 'kh'],
  ['\u0426', 'Ts'],
  ['\u0446', 'ts'],
  ['\u0427', 'Ch'],
  ['\u0447', 'ch'],
  ['\u0428', 'Sh'],
  ['\u0448', 'sh'],
  ['\u0429', 'Sh'],
  ['\u0449', 'sh'],
  ['\u042A', ''],
  ['\u044A', ''],
  ['\u042B', 'E'],
  ['\u044B', 'e'],
  ['\u042C', ''],
  ['\u044C', ''],
  ['\u042D', 'E'],
  ['\u044D', 'e'],
  ['\u042E', 'Yu'],
  ['\u044E', 'yu'],
  ['\u042F', 'Ya'],
  ['\u044F', 'ya'],
]);

/**
 * Collapses equivalent romanizations so search matches common variants:
 * x ≡ kh ≡ gh ≡ х, c ≡ ts ≡ ts' ≡ ц, ch ≡ tch ≡ ч.
 * Longer sequences are folded first so "tch" / "ts'" are not split.
 */
function foldRomanizationVariants(text) {
  return text
    .replace(/tch/g, 'ch')
    .replace(/ts['\u2019\u02BB\u2032\u02B9]?/g, 'c')
    .replace(/c['\u2019\u02BB\u2032\u02B9]/g, 'c')
    .replace(/kh/g, 'x')
    .replace(/gh/g, 'x');
}

/**
 * Eastern Armenian romanization for search matching, including Russian
 * Cyrillic. Handles digraphs (ու, և, дж, дз) before single-character mapping.
 */
export function transliterateArmenian(text) {
  if (text == null || text === '') {
    return '';
  }

  const withDigraphs = String(text)
    .replace(/\u0548\u0582/g, 'U')
    .replace(/\u0578\u0582/g, 'u')
    .replace(/\u0587/g, 'ev')
    .replace(/\u0414\u0416/g, 'J')
    .replace(/\u0414\u0436/g, 'J')
    .replace(/\u0434\u0436/g, 'j')
    .replace(/\u0414\u0417/g, 'Dz')
    .replace(/\u0414\u0437/g, 'Dz')
    .replace(/\u0434\u0437/g, 'dz');

  let output = '';
  for (const char of withDigraphs) {
    output +=
      ARMENIAN_CHAR_MAP.get(char) ?? RUSSIAN_CHAR_MAP.get(char) ?? char;
  }

  return output;
}

/**
 * Normalizes text for search: transliterates Armenian and Russian Cyrillic,
 * folds romanization variants (x/kh/gh/х, c/ts/ts'/ц, ch/tch/ч), lowercases, trims.
 */
export function normalizeSearchText(text) {
  return foldRomanizationVariants(
    transliterateArmenian(text).toLowerCase().trim().replace(/\s+/g, ' '),
  );
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
