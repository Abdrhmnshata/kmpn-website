/**
 * Shown the moment a portal page is opened, while its Notion data loads, so
 * a click always answers at once instead of seeming to do nothing.
 */
export default function PortalLoading() {
  return (
    <div className="p-loading" role="status" aria-live="polite">
      <span className="p-spinner" aria-hidden="true" />
      <span>جارٍ تحميل بياناتك…</span>
    </div>
  );
}
