import React from 'react'
import {Row, Col, Form, InputGroup, Button} from 'react-bootstrap'
import Select from 'react-select'
import {Table, PaginationProps, Spin, Pagination, DatePicker} from 'antd'
import {LoadingOutlined} from '@ant-design/icons'
import type {ColumnsType} from 'antd/es/table'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faSearch} from '@fortawesome/free-solid-svg-icons'
import {DataType, StoreItem} from '../types'

const {RangePicker} = DatePicker

interface NewManagerTableSectionProps {
  exportToExcel: () => void
  loadingExport: boolean
  handleKeyPress: (event: React.KeyboardEvent<HTMLDivElement>) => void
  setDateFrom: (val: any) => void
  setDateTo: (val: any) => void
  handleChangeSearchFilter: (event: React.ChangeEvent<HTMLInputElement>) => void
  userRole: string | null
  storeOptions: StoreItem[]
  setSelectedStore: (val: any) => void
  loadingButton: boolean
  handleSubmitFilter: () => void
  loadData: boolean
  columns: ColumnsType<DataType>
  managerData: DataType[]
  totalData: number
  currentPage: number
  pageSize: number
  itemRender: PaginationProps['itemRender']
  setPageSize: (size: number) => void
  setCurrentPage: (page: number) => void
  fetchData: (page: number, pageSize: number, queryparams: any) => void
}

export const NewManagerTableSection: React.FC<NewManagerTableSectionProps> = ({
  exportToExcel,
  loadingExport,
  handleKeyPress,
  setDateFrom,
  setDateTo,
  handleChangeSearchFilter,
  userRole,
  storeOptions,
  setSelectedStore,
  loadingButton,
  handleSubmitFilter,
  loadData,
  columns,
  managerData,
  totalData,
  currentPage,
  pageSize,
  itemRender,
  setPageSize,
  setCurrentPage,
  fetchData,
}) => {
  return (
    <section id='view-sales'>
      <div className='card'>
        <div className='card-body table-view-order'>
          <div className='d-flex justify-content-end mb-4'>
            <button className='button-export' onClick={exportToExcel}>
              <h3 className='fs-5 fw-semibold'>
                {loadingExport ? 'Exporting..' : 'Export To Excel'}
              </h3>
            </button>
          </div>

          <Row className='table-head-wrapper' onKeyDown={handleKeyPress}>
            <Col xxl={4} xl={4} lg={4} md={4} sm={12}>
              <Form.Group as={Row}>
                <Form.Label className='fs-3' column sm='4'>
                  Date :
                </Form.Label>

                <Col sm='8'>
                  <RangePicker
                    className='date-range ms-3'
                    onChange={(values) => {
                      if (values && values.length === 2) {
                        const dateFromFormatted = values[0]?.format('YYYY-MM-DD')
                        const dateToFormatted = values[1]?.format('YYYY-MM-DD')

                        setDateFrom(dateFromFormatted)
                        setDateTo(dateToFormatted)
                      } else {
                        setDateFrom('')
                        setDateTo('')
                      }
                    }}
                  />
                </Col>
              </Form.Group>
            </Col>

            <Col xxl={4} xl={4} lg={4} md={4} sm={12}>
              <div className='filter-search'>
                <InputGroup>
                  <InputGroup.Text className='filter-ltr'>
                    <FontAwesomeIcon icon={faSearch} size='sm' />
                  </InputGroup.Text>

                  <Form.Control
                    placeholder='Search'
                    className='filter-ltr'
                    onChange={handleChangeSearchFilter}
                  />
                </InputGroup>
              </div>
            </Col>

            <Col xxl={4} xl={4} lg={4} md={4} sm={12}>
              {userRole === 'Admin HO' || userRole === 'Super User' ? (
                <div className='d-flex'>
                  <Select
                    name='store_id'
                    className='form-control p-0'
                    classNamePrefix='select'
                    placeholder='Pilih Toko'
                    isSearchable={true}
                    isClearable={true}
                    options={storeOptions}
                    onChange={(newValue) => setSelectedStore(newValue)}
                  />

                  <Button
                    className='btn-dark-primary button-submit'
                    disabled={loadingButton}
                    onClick={handleSubmitFilter}
                  >
                    {loadingButton ? 'Filtering..' : 'Submit'}
                  </Button>
                </div>
              ) : (
                <Button
                  className='btn-dark-primary button-submit'
                  disabled={loadingButton}
                  onClick={handleSubmitFilter}
                >
                  {loadingButton ? 'Filtering..' : 'Submit'}
                </Button>
              )}
            </Col>
          </Row>

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
                dataSource={managerData}
                rowKey={(record) => record.manager_id}
                pagination={false}
                sticky={true}
                tableLayout='auto'
                scroll={{x: 'max-content'}}
              />
            </div>
          </Spin>

          <div className='pagination-container mt-5'>
            <span className='total-text'>
              Showing {totalData === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, totalData)} of {totalData} Total Manager
            </span>

            <Pagination
              className='pagination'
              current={currentPage}
              pageSize={pageSize}
              total={totalData}
              showSizeChanger
              pageSizeOptions={[5, 10, 20, 50, 100, 250, 500]}
              itemRender={itemRender}
              onChange={(page, newPageSize) => {
                setPageSize(newPageSize)
                setCurrentPage(page)
                fetchData(page, newPageSize, '')
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
