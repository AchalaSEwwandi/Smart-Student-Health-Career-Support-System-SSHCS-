const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/delivery/StoreDashboard.jsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Find both occurrences of "function ViewModal"
const viewModalLines = [];
lines.forEach((line, i) => {
  if (line.includes('function ViewModal')) {
    viewModalLines.push({ lineNo: i + 1, idx: i, content: line.substring(0, 80) });
  }
});
console.log('ViewModal occurrences:', viewModalLines);

if (viewModalLines.length !== 2) {
  console.log('Expected 2 ViewModal occurrences, found', viewModalLines.length);
  process.exit(1);
}

// The FIRST occurrence is bad (orphaned), the SECOND is real.
// Find what's between the generateFullReport end (};) and the second ViewModal.
// We want to delete from the first "/* ─ View Modal ─ */" comment (line before first ViewModal)
// up to (not including) the second "/* ─ View Modal ─ */" comment.

const firstVm = viewModalLines[0].idx;  // 0-indexed
const secondVm = viewModalLines[1].idx; // 0-indexed

// Walk back from firstVm to find the comment line
let commentStart = firstVm - 1;
while (commentStart >= 0 && !lines[commentStart].includes('View Modal')) {
  commentStart--;
}
console.log(`Orphaned section: lines ${commentStart+1} to ${secondVm-1} (1-indexed)`);

// Also find the comment before the second ViewModal
let secondComment = secondVm - 1;
while (secondComment >= 0 && !lines[secondComment].includes('View Modal')) {
  secondComment--;
}
console.log(`Good section starts at comment line: ${secondComment+1}`);

// Build new content: keep lines 0..commentStart-1, skip commentStart..secondComment-1, keep secondComment..end
const newLines = [
  ...lines.slice(0, commentStart),
  ...lines.slice(secondComment)
];

fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
console.log(`Done! Removed ${secondComment - commentStart} lines. File now has ${newLines.length} lines.`);
