import { escapeHtml } from './escapeHtml';

/**
 * Demo data shaped like the reference complaint PDF.
 * Replace with API / Redux values when wiring the real backend.
 */
export const FAKE_DOCUMENT_PLACEHOLDERS = {
  referenceNumber: '46-042026-5506',
  portalName: 'www.e-court.am',
  portalDescription: 'Էլեկտրոնային դատական համակարգ',
  documentTitle: 'ԲՈՂՈԿ',
  documentSubtitle: '№ 06045454 որոշման դեպքում',
  section1Heading: 'Բողոքի առարկան',
  section1Paragraph:
    '27.04.2026 թ. կայացված № 06045454 որոշումը կայացվել է օրինականության և հիմնավորվածության պահանջները խախտելով, ինչը հակասում է ՀՀ Ադմինիստրատիվ դատավարության օրենսգրքի 255-րդ հոդվածի 1-ին պարբերությանը։',
  section2Heading: 'Բողոքի պահանջները',
  section2Paragraph:
    'Հաշվի առնելով վերոնշյալը, խնդրում եմ № 06045454 որոշումը ճանաչել անվավեր և վերադարձնել գործը նոր քննության։',
};

export function buildFakeComplainantBlockHtml() {
  const complainantName = 'UX UI Designer';
  const passportSeries = 'Ա4';
  const passportIssuedAt = '05.04.2022';
  const passportAuthority = '12';
  const registrationAddress = 'ՍՖԴԱՏ5';
  const notificationAddress = 'դ5դս';
  const phone = '+37498091081';
  const courtName = 'ՀՀ վարչական դատարանի Երևանի մասնաճյուղ';

  return `
    <div class="party-block">
      <p><strong>ԲՈՂՈԿ ԲԵՐՈՂ ԱՆՁ՝</strong> ${escapeHtml(complainantName)}</p>
      <p>Անձնագիր՝ ${escapeHtml(passportSeries)}, տրված՝ ${escapeHtml(passportIssuedAt)}, տրված է՝ ${escapeHtml(passportAuthority)}</p>
      <p>Գրանցման հասցե՝ ${escapeHtml(registrationAddress)}</p>
      <p>Ծանուցման հասցե՝ ${escapeHtml(notificationAddress)}</p>
      <p>Հեռախոս՝ ${escapeHtml(phone)}</p>
      <p style="margin-top: 12pt;"><strong>${escapeHtml(courtName)}</strong></p>
    </div>
  `.trim();
}

export const FAKE_DOCUMENT_SLOTS = {
  'complainant-block': buildFakeComplainantBlockHtml(),
};
