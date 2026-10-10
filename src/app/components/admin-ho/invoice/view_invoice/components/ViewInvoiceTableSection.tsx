import React from 'react'
import {Table, Spin, Pagination, PaginationProps} from 'antd'
import {LoadingOutlined} from '@ant-design/icons'
import type {ColumnsType} from 'antd/es/table'
import {DataType} from '../types'

interface ViewInvoiceTableSectionProps {
  loadData: boolean
  columns: ColumnsType<DataType>
  invoiceData: DataType[]
  currentPage: number
  pageSize: number
  totalData: number
  itemRender: PaginationProps['itemRender']
  handlePageChange: (page: number, size?: number) => void
}

export const ViewInvoiceTableSection: React.FC<ViewInvoiceTableSectionProps> = ({
  loadData,
  columns,
  invoiceData,
  currentPage,
  pageSize,
  totalData,
  itemRender,
  handlePageChange,
}) => {
  return (
    <>
      <Spin
        tip='Loading...'
        spinning={loadData}
        size='large'
        indicator={<LoadingOutlined style={{fontSize: 24}} spin />}
      >
        <div className='table-custom-wrapper'>
          <Table
            className='table-striped-rows'
            bordered
            columns={columns}
            dataSource={invoiceData}
            pagination={false}
            sticky={true}
            tableLayout='auto'
            scroll={{x: 'max-content'}}
          />
        </div>
      </Spin>

      <div className='pagination-container mt-5'>
        <span className='total-text'>
          Showing {(currentPage - 1) * pageSize + 1} -{' '}
          {Math.min(currentPage * pageSize, totalData)} of {totalData} Invoice
        </span>

        <Pagination
          className='pagination'
          pageSize={pageSize}
          current={currentPage}
          total={totalData}
          showSizeChanger
          pageSizeOptions={[5, 10, 20, 50, 100, 250, 500]}
          itemRender={itemRender}
          onChange={(page, newPageSize) => {
            handlePageChange(page, newPageSize)
          }}
        />
      </div>
    </>
  )
}
