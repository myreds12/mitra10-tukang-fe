const fs = require('fs');
const path = require('path');

const viewOrderPath = path.join(__dirname, '..', 'src', 'app', 'components', 'admin-ho', 'order', 'view_order', 'ViewOrder.tsx');
let content = fs.readFileSync(viewOrderPath, 'utf8');

// 1. Add imports
content = content.replace(
  "import {RefundModal} from './components/RefundModal'",
  `import {RefundModal} from './components/RefundModal'
import {useOrderColumns} from './components/useOrderColumns'
import {DataType, StoreItem, VendorItem, Order, CSI, Quotation} from './types'`
);

// 2. Remove interfaces DataType ... Quotation
const lines = content.split(/\r?\n/);
let interfaceStart = -1;
let interfaceEnd = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith('interface DataType {')) {
    interfaceStart = i;
  }
  if (lines[i].startsWith('const ViewOrders: FC = () => {')) {
    interfaceEnd = i;
    break;
  }
}

if (interfaceStart !== -1 && interfaceEnd !== -1) {
  lines.splice(interfaceStart, interfaceEnd - interfaceStart);
}

content = lines.join('\n');

// 3. Replace columns definition with useOrderColumns call
const lines2 = content.split(/\r?\n/);
let colStart = -1;
let colEnd = -1;

for (let i = 0; i < lines2.length; i++) {
  if (lines2[i].includes('const renderTooltip =')) {
    colStart = i;
  }
  if (lines2[i].includes('filter(Boolean) as ColumnsType<DataType>')) {
    colEnd = i;
    break;
  }
}

console.log('Replacing columns from line', colStart + 1, 'to', colEnd + 1);

const useColsCall = `  const columns = useOrderColumns({
    userRole,
    statusFilters,
    navigate,
    orderData,
    fetchOrderData,
    getVendor,
    exportToPDF,
    setShowModal,
    setModalType,
    setActiveKey,
    setSelectedCSI,
    selectedPaymentReceiptStatus,
    selectedOrderStatus,
    selectedPaymentQuotationStatus,
  })`;

lines2.splice(colStart, colEnd - colStart + 1, useColsCall);

content = lines2.join('\n');
fs.writeFileSync(viewOrderPath, content);
console.log('ViewOrder.tsx updated with types and useOrderColumns!');
