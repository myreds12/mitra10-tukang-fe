const fs = require('fs');
const path = require('path');

const viewOrderPath = path.join(__dirname, '..', 'src', 'app', 'components', 'admin-ho', 'order', 'view_order', 'ViewOrder.tsx');
const raw = fs.readFileSync(viewOrderPath, 'utf8');
const lines = raw.split(/\r?\n/);

// CustomerIndexModal lines: 1404 to 1970 (0-indexed)
const csiLines = lines.slice(1404, 1971);

// We need to define props interface and export the component
const componentContent = `import React, {FC} from 'react'
import {Skeleton} from 'antd'
import {Modal, Tab, Nav, Row, Col, Form, Button} from 'react-bootstrap'
import Select from 'react-select'
import {formatDateWithTimeZone} from '../../../../../../_metronic/helpers'

export interface CustomerIndexModalProps {
  orderDetail: any
  loadingModal: boolean
  mailLogs: any[]
  activeKey: number
  setActiveKey: (key: number) => void
  userRole: string
  csiData: any[]
  selectedCSI: any
  setSelectedCSI: (val: any) => void
  loadingUpdate: boolean
  handleTriggerEmail: () => Promise<void>
}

export const CustomerIndexModal: FC<CustomerIndexModalProps> = ({
  orderDetail,
  loadingModal,
  mailLogs,
  activeKey,
  setActiveKey,
  userRole,
  csiData,
  selectedCSI,
  setSelectedCSI,
  loadingUpdate,
  handleTriggerEmail,
}) => {
${csiLines.slice(1, -1).join('\n')}
}
`;

const targetPath = path.join(__dirname, '..', 'src', 'app', 'components', 'admin-ho', 'order', 'view_order', 'components', 'CustomerIndexModal.tsx');
fs.writeFileSync(targetPath, componentContent);

console.log('CustomerIndexModal created successfully');
