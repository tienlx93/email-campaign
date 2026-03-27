export const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
};

/** Returns true when the Quill HTML output contains no visible text content. */
export function isQuillEmpty(html: string): boolean {
  return html.replace(/<[^>]*>/g, '').trim().length === 0;
}

/**
 * Converts a raw HTML string into the value expected by ReactQuill.
 * ReactQuill accepts HTML directly, so this is an identity conversion — the
 * function exists to make the data-flow intent explicit at call sites.
 */
export function htmlToQuillValue(html: string): string {
  return html;
}

/**
 * Extracts the HTML string produced by ReactQuill's onChange handler.
 * ReactQuill emits HTML directly, so this is an identity conversion — the
 * function exists to make the data-flow intent explicit at call sites.
 */
export function quillValueToHtml(value: string): string {
  return value;
}
