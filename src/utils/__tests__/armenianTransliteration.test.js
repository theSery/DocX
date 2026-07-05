import {
  includesSearchQuery,
  normalizeSearchText,
  transliterateArmenian,
} from '../armenianTransliteration';

describe('transliterateArmenian', () => {
  it('transliterates single Armenian letters', () => {
    expect(transliterateArmenian('Հ')).toBe('H');
    expect(transliterateArmenian('ա')).toBe('a');
  });

  it('transliterates digraphs before single-character mapping', () => {
    expect(transliterateArmenian('ու')).toBe('u');
    expect(transliterateArmenian('Ու')).toBe('U');
    expect(transliterateArmenian('և')).toBe('ev');
  });

  it('transliterates multi-letter Armenian characters', () => {
    expect(transliterateArmenian('խ')).toBe('kh');
    expect(transliterateArmenian('շ')).toBe('sh');
    expect(transliterateArmenian('չ')).toBe('ch');
  });

  it('leaves Latin characters unchanged', () => {
    expect(transliterateArmenian('Hello')).toBe('Hello');
  });

  it('transliterates mixed Armenian and Latin text', () => {
    expect(transliterateArmenian('Հay')).toBe('Hay');
  });
});

describe('normalizeSearchText', () => {
  it('lowercases transliterated output', () => {
    expect(normalizeSearchText('Հայ')).toBe('hay');
    expect(normalizeSearchText('  Hello  ')).toBe('hello');
  });

  it('normalizes Armenian place names', () => {
    expect(normalizeSearchText('Երևան')).toBe('erevan');
    expect(normalizeSearchText('Հայաստան')).toBe('hayastan');
  });
});

describe('includesSearchQuery', () => {
  it('matches Latin query against Armenian haystack', () => {
    expect(includesSearchQuery('Հայաստան', 'hay')).toBe(true);
    expect(includesSearchQuery('Երևան, Աբովյան 1', 'abovyan')).toBe(true);
  });

  it('matches Armenian query against Armenian haystack', () => {
    expect(includesSearchQuery('Հայաստան', 'Հայ')).toBe(true);
    expect(includesSearchQuery('Երևան', 'եր')).toBe(true);
  });

  it('matches Latin query against Latin haystack', () => {
    expect(includesSearchQuery('Hello World', 'world')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(includesSearchQuery('Հայաստան', 'HAY')).toBe(true);
    expect(includesSearchQuery('Hello', 'HELLO')).toBe(true);
  });

  it('returns false for empty query', () => {
    expect(includesSearchQuery('Հայաստան', '')).toBe(false);
    expect(includesSearchQuery('Հայաստան', '   ')).toBe(false);
  });

  it('returns false when there is no match', () => {
    expect(includesSearchQuery('Հայաստան', 'xyz')).toBe(false);
  });
});
