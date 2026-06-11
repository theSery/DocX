/**
 * Simulates HTML returned by the backend (fragment only — no <html> wrapper).
 * Placeholders and INJECT slots are filled on the client before PDF generation.
 */
export const FAKE_BACKEND_DOCUMENT_HTML = `
<div class="doc">
  <p class="reference">{{referenceNumber}}</p>
  <p class="site-line">{{portalName}} · {{portalDescription}}</p>

  <!-- INJECT:complainant-block -->

  <h1>{{documentTitle}}</h1>
  <p class="doc-subtitle">({{documentSubtitle}})</p>

  <section class="section">
    <p class="section-heading"><strong>1.</strong> {{section1Heading}}</p>
    <p>{{section1Paragraph}}</p>
  </section>

  <section class="section">
    <p class="section-heading"><strong>1.</strong> {{section2Heading}}</p>
    <p>{{section2Paragraph}}</p>
  </section>
</div>
`.trim();

