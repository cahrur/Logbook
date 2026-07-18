// Client-side mirror of the backend's accepted document types. Drives the
// file picker's `accept` attribute, pre-upload validation, and per-file icons.

const GROUPS = [
  { key: 'pdf', label: 'PDF', exts: ['.pdf'], preview: true,
    mimes: ['application/pdf'] },
  { key: 'excel', label: 'Excel', exts: ['.xls', '.xlsx'], preview: false,
    mimes: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'] },
  { key: 'word', label: 'Word', exts: ['.doc', '.docx'], preview: false,
    mimes: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] },
  { key: 'image', label: 'Gambar', exts: ['.png', '.jpg', '.jpeg', '.webp'], preview: true,
    mimes: ['image/png', 'image/jpeg', 'image/webp'] },
  { key: 'svg', label: 'SVG', exts: ['.svg'], preview: false,
    mimes: ['image/svg+xml'] },
  { key: 'ai', label: 'Illustrator', exts: ['.ai'], preview: false,
    mimes: ['application/postscript', 'application/illustrator'] },
];

export const ACCEPTED_EXTS = GROUPS.flatMap((g) => g.exts);

// Comma-separated list for the <input accept="..."> attribute.
export const ACCEPT_ATTR = [...ACCEPTED_EXTS, ...GROUPS.flatMap((g) => g.mimes)].join(',');

function extOf(name) {
  const i = String(name || '').lastIndexOf('.');
  return i >= 0 ? name.slice(i).toLowerCase() : '';
}

export function isAcceptedFile(name) {
  return ACCEPTED_EXTS.includes(extOf(name));
}

// Returns the display group for a file, defaulting to a neutral document.
export function fileGroup(name) {
  const ext = extOf(name);
  return GROUPS.find((g) => g.exts.includes(ext)) || { key: 'other', label: 'Berkas', preview: false };
}

export function isPreviewable(name) {
  return fileGroup(name).preview;
}
