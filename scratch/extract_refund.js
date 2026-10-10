const fs = require('fs');
const path = require('path');

const viewOrderPath = path.join(__dirname, '..', 'src', 'app', 'components', 'admin-ho', 'order', 'view_order', 'ViewOrder.tsx');
const raw = fs.readFileSync(viewOrderPath, 'utf8');
const lines = raw.split(/\r?\n/);

// RefundModal lines: 2737 to 3216 (0-indexed)
const refundLines = lines.slice(2737, 3217);

const componentContent = `import React, {FC} from 'react'
import {Skeleton} from 'antd'
import {Modal, Row, Col, Form, Button} from 'react-bootstrap'

export interface RefundModalProps {
  orderDetail: any
  loadingModal: boolean
  handleCancelRefund: (type: number) => Promise<void>
}

export const RefundModal: FC<RefundModalProps> = ({
  orderDetail,
  loadingModal,
  handleCancelRefund,
}) => {
${refundLines.slice(1, -1).join('\n')}
}
`;

const targetPath = path.join(__dirname, '..', 'src', 'app', 'components', 'admin-ho', 'order', 'view_order', 'components', 'RefundModal.tsx');
fs.writeFileSync(targetPath, componentContent);

console.log('RefundModal created successfully');
