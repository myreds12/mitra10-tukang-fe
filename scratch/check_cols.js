const fs = require('fs');
const content = fs.readFileSync('src/app/components/admin-ho/order/view_order/ViewOrder.tsx', 'utf8');
const lines = content.split('\n');

const colLines = lines.slice(3302, 3658).join('\n');
const headLines = lines.slice(0, 3302).join('\n');

const words = new Set(colLines.match(/\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g));
const found = [];
for (const w of words) {
  const re = new RegExp(`\\b(const|let|var|function)\\s+\\b${w}\\b`);
  if (re.test(headLines)) {
    found.push(w);
  }
}
console.log('Outer vars in columns:', found);
