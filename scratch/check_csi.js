const fs = require('fs');
const content = fs.readFileSync('src/app/components/admin-ho/order/view_order/ViewOrder.tsx', 'utf8');
const lines = content.split('\n');
const csiLines = lines.slice(1404, 1971).join('\n');

const viewOrdersHead = lines.slice(190, 1404).join('\n');

// Find all words in csiLines
const words = new Set(csiLines.match(/\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g));

const found = [];
for (const w of words) {
  const re = new RegExp(`\\b(const|let|var)\\s+\\b${w}\\b`);
  if (re.test(viewOrdersHead)) {
    found.push(w);
  }
}
console.log('Outer vars in CustomerIndexModal:', found);
