const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'components', 'admin-ho', 'order', 'view_order', 'ViewOrder.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add imports at top
const importStatement = `import {CustomerIndexModal} from './components/CustomerIndexModal'
import {QuotationModal} from './components/QuotationModal'
import {RefundModal} from './components/RefundModal'
`;

content = content.replace("import './ViewOrder.css'", `import './ViewOrder.css'\n${importStatement}`);

// Now replace the 3 inline modal blocks
// 1. CustomerIndexModal is lines 1404 to 1970
// 2. QuotationModal is lines 1973 to 2736
// 3. RefundModal is lines 2737 to 3216
// Together lines 1404 to 3216 is one continuous chunk!

const lines = content.split(/\r?\n/);
let startIndex = -1;
let endIndex = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('// CSI Modal')) {
    startIndex = i;
  }
  if (lines[i].includes('// Vendor Availbility')) {
    endIndex = i;
    break;
  }
}

console.log('Replacing from line', startIndex + 1, 'to', endIndex);
if (startIndex !== -1 && endIndex !== -1) {
  lines.splice(startIndex, endIndex - startIndex);
}

content = lines.join('\n');

// Now update the JSX calls for the 3 modals
const oldCustomerCall = `<CustomerIndexModal
              mailLogs={mailLogs}
              orderDetail={orderDetail}
              loadingModal={loadingModal}
            />`;

const newCustomerCall = `<CustomerIndexModal
              mailLogs={mailLogs}
              orderDetail={orderDetail}
              loadingModal={loadingModal}
              activeKey={activeKey}
              setActiveKey={setActiveKey}
              userRole={userRole}
              csiData={csiData}
              selectedCSI={selectedCSI}
              setSelectedCSI={setSelectedCSI}
              loadingUpdate={loadingUpdate}
              handleTriggerEmail={handleTriggerEmail}
            />`;

content = content.replace(oldCustomerCall, newCustomerCall);

const oldQuotationCall = `<QuotationModal
              show={showModal}
              handleClose={handleCloseModal}
              orderDetail={orderDetail}
              loadingModal={loadingModal}
              handleReceiptClick={handleReceiptClick}
              handleReceiptChange={handleReceiptChange}
              handleUpdateQuotation={handleUpdateQuotation}
              loadingUpdate={loadingUpdate}
              receiptQuotation={receiptQuotation}
              quotationFiles={quotationFiles}
              handleFileReceipt={handleFileReceipt}
              handleRemoveReceipt={handleRemoveReceipt}
              handleImageClick={handleImageClick}
              handleFileChange={handleFileChange}
              handleFileClick={handleFileClick}
              handleRemoveFile={handleRemoveFile}
            />`;

const newQuotationCall = `<QuotationModal
              show={showModal}
              handleClose={handleCloseModal}
              orderDetail={orderDetail}
              loadingModal={loadingModal}
              handleReceiptClick={handleReceiptClick}
              handleReceiptChange={handleReceiptChange}
              handleUpdateQuotation={handleUpdateQuotation}
              loadingUpdate={loadingUpdate}
              receiptQuotation={receiptQuotation}
              quotationFiles={quotationFiles}
              handleFileReceipt={handleFileReceipt}
              handleRemoveReceipt={handleRemoveReceipt}
              handleImageClick={handleImageClick}
              handleFileChange={handleFileChange}
              handleFileClick={handleFileClick}
              handleRemoveFile={handleRemoveFile}
              singleReceipt={singleReceipt}
              handleMultiReceiptChange={handleMultiReceiptChange}
              receiptRefs={receiptRefs}
              evidenceRef={evidenceRef}
              notes={notes}
              quotation={quotation}
              setQuotation={setQuotation}
              paymentStages={paymentStages}
              visibleReceipt={visibleReceipt}
              setVisibleReceipt={setVisibleReceipt}
              previewReceipt={previewReceipt}
              setPreviewReceipt={setPreviewReceipt}
              visible={visible}
              setVisible={setVisible}
              previewImage={previewImage}
              setPreviewImage={setPreviewImage}
              apiUrl={apiUrl}
              setFocusedIndex={setFocusedIndex}
              selectedReceiptIndex={selectedReceiptIndex}
              selectedFileIndex={selectedFileIndex}
              orderForm={orderForm}
              setOrderForm={setOrderForm}
              vendor={vendor}
              vendorAvailbility={vendorAvailbility}
            />`;

content = content.replace(oldQuotationCall, newQuotationCall);

const oldRefundCall = `<RefundModal orderDetail={orderDetail} loadingModal={loadingModal} />`;
const newRefundCall = `<RefundModal
              orderDetail={orderDetail}
              loadingModal={loadingModal}
              handleCancelRefund={handleCancelRefund}
            />`;

content = content.replace(oldRefundCall, newRefundCall);

fs.writeFileSync(filePath, content);
console.log('ViewOrder.tsx updated with extracted modals!');
