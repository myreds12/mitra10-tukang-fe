import React from 'react'
import {Pagination, Spin, Table, PaginationProps} from 'antd'
import {LoadingOutlined} from '@ant-design/icons'
import type {ColumnsType} from 'antd/es/table'
import type {TableCurrentDataSource} from 'antd/es/table/interface'
import {OrderListRow} from './order-list.mapper'

interface OrderListTableProps {
  columns: ColumnsType<OrderListRow>
  data: OrderListRow[]
  loading: boolean
  currentPage: number
  pageSize: number
  totalData: number
  itemRender: PaginationProps['itemRender']
  onFilter: (pagination: PaginationProps, filters: Record<string, any>, sorter: any, extra: TableCurrentDataSource<OrderListRow>) => void
  onPageChange: (page: number, pageSize: number) => void
}

const OrderListTable: React.FC<OrderListTableProps> = ({
  columns,
  data,
  loading,
  currentPage,
  pageSize,
  totalData,
  itemRender,
  onFilter,
  onPageChange,
}) => (
  <>
    <Spin
      tip='Loading...'
      spinning={loading}
      size='large'
      indicator={<LoadingOutlined style={{fontSize: 24}} spin />}
    >
      <div className='table-custom-wrapper'>
        <Table
          className='table-striped-rows'
          bordered
          columns={columns}
          dataSource={data}
          rowKey={(record) => record.order_id}
          pagination={false}
          sticky={true}
          tableLayout='auto'
          scroll={{x: 'max-content'}}
          onChange={onFilter}
        />
      </div>
    </Spin>

    <div className='pagination-container mt-5'>
      <span className='total-text'>
        Showing {totalData === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
        {Math.min(currentPage * pageSize, totalData)} of {totalData} Orders
      </span>

      <Pagination
        className='pagination'
        pageSize={pageSize}
        current={currentPage}
        total={totalData}
        showSizeChanger
        pageSizeOptions={[5, 10, 20, 50, 100, 250, 500]}
        itemRender={itemRender}
        onChange={onPageChange}
      />
    </div>
  </>
)

export default OrderListTable
