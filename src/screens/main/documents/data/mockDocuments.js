export const DOCUMENT_FILTERS = [
  { id: 'all', label: 'Բոլորը' },
  { id: 'state', label: 'Պետ. մարմին' },
  { id: 'lawyer', label: 'Փաստաբան' },
  { id: 'email', label: 'Էլ-փոստ' },
];

export const MOCK_DOCUMENTS = [
  {
    id: '1',
    date: '24 Ապրիլ 2026',
    title: '1-10 կմ/ժ-ով արագությունը գերազանցելը',
    organization: 'ՆԳՆ Պարեկային ծառայություն',
    status: 'draft',
    hasAttachment: true,
    category: 'state',
  },
  {
    id: '2',
    date: '24 Ապրիլ 2026',
    title: '1-10 կմ/ժ-ով արագությունը գերազանցելը',
    organization: 'ՆԳՆ Պարեկային ծառայություն',
    status: 'signed',
    hasAttachment: false,
    category: 'state',
  },
  {
    id: '3',
    date: '24 Ապրիլ 2026',
    title: '1-10 կմ/ժ-ով արագությունը գերազանցելը',
    organization: 'ՆԳՆ Պարեկային ծառայություն',
    status: 'sent',
    hasAttachment: true,
    category: 'email',
  },
];
