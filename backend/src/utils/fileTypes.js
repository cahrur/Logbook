const fs = require('fs');
const path = require('path');
const { ValidationError } = require('./errors');

// ----- Magic-byte helpers (content sniffing, defense-in-depth) -----
function startsWith(buf, bytes, offset = 0) {
  if (buf.length < offset + bytes.length) return false;
  return bytes.every((b, i) => buf[offset + i] === b);
}

const isPdf = (b) => startsWith(b, [0x25, 0x50, 0x44, 0x46, 0x2d]); // %PDF-
const isPng = (b) => startsWith(b, [0x89, 0x50, 0x4e, 0x47]);
const isJpg = (b) => startsWith(b, [0xff, 0xd8, 0xff]);
const isWebp = (b) => startsWith(b, [0x52, 0x49, 0x46, 0x46]) && startsWith(b, [0x57, 0x45, 0x42, 0x50], 8); // RIFF....WEBP
// ZIP-based OOXML (.xlsx / .docx): PK\x03\x04 (also empty/spanned archive markers).
const isZip = (b) =>
  startsWith(b, [0x50, 0x4b, 0x03, 0x04]) ||
  startsWith(b, [0x50, 0x4b, 0x05, 0x06]) ||
  startsWith(b, [0x50, 0x4b, 0x07, 0x08]);
// Legacy OLE compound file (.xls / .doc).
const isOle = (b) => startsWith(b, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
const isEps = (b) => startsWith(b, [0x25, 0x21, 0x50, 0x53]); // %!PS
// Adobe Illustrator: modern files are PDF, older ones are EPS.
const isAi = (b) => isPdf(b) || isEps(b);
// SVG is text — scan the head for an <svg root (may follow an xml decl/comment).
const isSvg = (b) => b.toString('utf8').toLowerCase().includes('<svg');

// Each descriptor: which extensions/MIME types map to it, the magic-byte check,
// and whether the browser can safely preview it inline (open in a new tab).
const DOCUMENT_TYPES = [
  { label: 'PDF', exts: ['.pdf'], mimes: ['application/pdf'], magic: isPdf, preview: true },
  {
    label: 'Excel',
    exts: ['.xls'],
    mimes: ['application/vnd.ms-excel', 'application/octet-stream'],
    magic: isOle,
  },
  {
    label: 'Excel',
    exts: ['.xlsx'],
    mimes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip',
      'application/octet-stream',
    ],
    magic: isZip,
  },
  {
    label: 'Word',
    exts: ['.doc'],
    mimes: ['application/msword', 'application/octet-stream'],
    magic: isOle,
  },
  {
    label: 'Word',
    exts: ['.docx'],
    mimes: [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip',
      'application/octet-stream',
    ],
    magic: isZip,
  },
  { label: 'PNG', exts: ['.png'], mimes: ['image/png'], magic: isPng, preview: true },
  { label: 'JPG', exts: ['.jpg', '.jpeg'], mimes: ['image/jpeg'], magic: isJpg, preview: true },
  { label: 'WEBP', exts: ['.webp'], mimes: ['image/webp'], magic: isWebp, preview: true },
  {
    label: 'SVG',
    exts: ['.svg'],
    mimes: ['image/svg+xml', 'text/xml', 'application/xml', 'text/plain', 'application/octet-stream'],
    magic: isSvg,
  },
  {
    label: 'AI',
    exts: ['.ai'],
    mimes: [
      'application/postscript',
      'application/illustrator',
      'application/pdf',
      'application/octet-stream',
    ],
    magic: isAi,
  },
];

const ACCEPTED_EXTS = DOCUMENT_TYPES.flatMap((t) => t.exts);

function findTypeByExt(ext) {
  const lower = String(ext || '').toLowerCase();
  return DOCUMENT_TYPES.find((t) => t.exts.includes(lower)) || null;
}

// MIME is treated as advisory (browsers are inconsistent for office/AI files);
// the extension whitelist + magic bytes are the strong gates.
function mimeAllowed(type, mime) {
  if (!mime) return true;
  return type.mimes.includes(String(mime).toLowerCase());
}

function extFor(originalname) {
  return path.extname(originalname || '').toLowerCase();
}

// Reads the file head once and verifies it matches the type's magic bytes.
function assertDocumentContent(filePath, ext) {
  const type = findTypeByExt(ext);
  if (!type) throw new ValidationError('Tipe berkas tidak didukung');
  const fd = fs.openSync(filePath, 'r');
  let head;
  try {
    const buf = Buffer.alloc(8192);
    const bytes = fs.readSync(fd, buf, 0, buf.length, 0);
    head = buf.subarray(0, bytes);
  } finally {
    fs.closeSync(fd);
  }
  if (!type.magic(head)) {
    throw new ValidationError(`Isi berkas tidak sesuai dengan tipe ${type.label}`);
  }
  return type;
}

function isPreviewable(mimeOrExt) {
  const type =
    findTypeByExt(mimeOrExt) ||
    DOCUMENT_TYPES.find((t) => t.mimes.includes(String(mimeOrExt || '').toLowerCase()));
  return Boolean(type && type.preview);
}

module.exports = {
  DOCUMENT_TYPES,
  ACCEPTED_EXTS,
  findTypeByExt,
  mimeAllowed,
  extFor,
  assertDocumentContent,
  isPreviewable,
};
