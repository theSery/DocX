const SERIAL_NUMBER_PATTERN =
  /data-serial-number="true"[^>]*><strong>([^<]+)<\/strong>/i;

/**
 * @param {string} html
 */
export function extractSerialNumberFromHtml(html) {
  const match = html.match(SERIAL_NUMBER_PATTERN);
  return match?.[1]?.trim() ?? '';
}

let lastSerialTimestamp = -1;
let serialSequence = 0;

/**
 * 4-digit time code: scaled Date.now() + increment within the same millisecond.
 * @param {number} [timestamp=Date.now()]
 */
function generateTimeCode(timestamp = Date.now()) {
  if (timestamp === lastSerialTimestamp) {
    serialSequence += 1;
  } else {
    lastSerialTimestamp = timestamp;
    serialSequence = 0;
  }

  const scaled = Math.floor(timestamp / 10) % 10000;
  return String((scaled + serialSequence) % 10000).padStart(4, '0');
}

/**
 * @param {number | string | null | undefined} userId
 * @param {number} [timestamp=Date.now()]
 */
export function generateComplaintSerialNumber(userId, timestamp = Date.now()) {
  const now = new Date(timestamp);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = String(now.getFullYear());
  const monthYear = `${mm}${yyyy}`;
  const timeCode = generateTimeCode(timestamp);
  const prefix = userId != null && userId !== '' ? String(userId) : '00';

  return `${prefix}-${monthYear}-${timeCode}`;
}

const DOCX_HEADER_HTML =
  '<p style="text-align: center;"><a target="_blank" rel="noopener noreferrer nofollow" class="text-blue-600 underline" href="http://DOCX.AM"><strong><u>DOCX.AM</u> - Փաստաթղթերի կազմման էլեկտրոնաին հարթակ</strong></a></p><hr>';

const DOCX_HEADER_PATTERN = /Փաստաթղթերի կազմման էլեկտրոնա(?:յ)?ին հարթակ/i;

/**
 * @param {string} bodyHtml
 * @param {string} serialNumber
 */
export function prependSerialNumberToBodyHtml(bodyHtml, serialNumber) {
  if (extractSerialNumberFromHtml(bodyHtml)) {
    return bodyHtml;
  }

  // Backend templates may already include the DOCX.AM header; avoid duplicating it.
  const headerHtml = DOCX_HEADER_PATTERN.test(bodyHtml) ? '' : DOCX_HEADER_HTML;
  const serialParagraph = `<p data-serial-number="true" style="text-align:left"><strong>${serialNumber}</strong></p>`;
  return `${serialParagraph}${headerHtml}${bodyHtml}`;
}

/**
 * @param {{
 *   templateId: number | string;
 *   documentName: string;
 *   bodyHtml: string;
 *   userId?: number | string | null;
 * }} params
 */
export function buildComplaintPayload({
  templateId,
  documentName,
  bodyHtml,
  userId,
}) {
  let serialNumber = extractSerialNumberFromHtml(bodyHtml);

  if (!serialNumber) {
    serialNumber = generateComplaintSerialNumber(userId);
  }

  const data = prependSerialNumberToBodyHtml(bodyHtml, serialNumber);
  const resolvedDocumentName = documentName.endsWith('.pdf')
    ? documentName
    : `${documentName}.pdf`;

  return {
    templateId,
    documentName: resolvedDocumentName,
    serialNumber,
    data,
  };
}
