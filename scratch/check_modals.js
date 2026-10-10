const fs = require('fs');
const content = fs.readFileSync('src/app/components/admin-ho/order/view_order/ViewOrder.tsx', 'utf8');
const lines = content.split('\n');

function checkSection(name, startLine, endLine) {
  const code = lines.slice(startLine - 1, endLine).join('\n');
  const viewOrdersHead = lines.slice(0, startLine - 1).join('\n');
  const words = new Set(code.match(/\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g));
  const found = [];
  for (const w of words) {
    const re = new RegExp(`\\b(const|let|var|function)\\s+\\b${w}\\b`);
    if (re.test(viewOrdersHead)) {
      found.push(w);
    }
  }
  console.log(name, 'outer vars:', found);
}

checkSection('CustomerIndexModal', 1405, 1971);
checkSection('QuotationModal', 1974, 2736);
checkSection('RefundModal', 2738, 3217);
