import React from 'react'
import {Row, Col, Form, Button, Card} from 'react-bootstrap'
import Select from 'react-select'
import makeAnimated from 'react-select/animated'
import {StoreItem, BankSelect, CategorySelect, Sales} from '../types'

interface NewSalesFormSectionProps {
  userRole: string | null
  staffStoreName: string
  store: StoreItem[]
  setSelectedStore: (value: any) => void
  salesId: any
  bank: BankSelect[]
  setSelectedBank: (value: any) => void
  salesInfo: Sales
  salesInfoFormHandler: (e: any) => void
  categories: CategorySelect[]
  selectedCategories: CategorySelect[]
  handleChangeCategories: (element: any) => void
  handleCancelCreateSales: () => void
  handleSubmitNewSales: () => void
  isLoading: boolean
}

export const NewSalesFormSection: React.FC<NewSalesFormSectionProps> = ({
  userRole,
  staffStoreName,
  store,
  setSelectedStore,
  salesId,
  bank,
  setSelectedBank,
  salesInfo,
  salesInfoFormHandler,
  categories,
  selectedCategories,
  handleChangeCategories,
  handleCancelCreateSales,
  handleSubmitNewSales,
  isLoading,
}) => {
  const animatedComponents = makeAnimated()

  return (
    <section id='new-sales'>
      <Card className='mb-5'>
        <Card.Header>
          <Card.Title>Profile</Card.Title>
        </Card.Header>

        <Card.Body>
          <div className='form-wrapper'>
            <Row className='form-header'>
              <Form.Group as={Row}>
                <Form.Label column sm='4'>
                  Nama Toko
                  {userRole === 'Admin HO' || userRole === 'Super User' ? (
                    <Select
                      name='store_id'
                      className='form-control p-0'
                      classNamePrefix='select'
                      placeholder='Pilih Toko'
                      isSearchable={true}
                      options={store}
                      onChange={(newValue) => setSelectedStore(newValue)}
                    />
                  ) : (
                    <span className='fs-6 ms-2 pt-2 pb-2 fw-semibold bg-secondary'>
                      {staffStoreName}
                    </span>
                  )}
                </Form.Label>
              </Form.Group>
            </Row>

            <Row>
              <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                <Form.Group className='mb-5'>
                  <Form.Label>Sales ID</Form.Label>
                  <Form.Control readOnly type='number' value={salesId} />
                </Form.Group>
              </Col>

              <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                <Form.Group className='mb-5'>
                  <Form.Label>Nama Bank</Form.Label>

                  <Select
                    classNamePrefix='select'
                    placeholder='Pilih Nama Bank'
                    isSearchable={true}
                    options={bank}
                    onChange={(newValue) => setSelectedBank(newValue)}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                <Form.Group className='mb-5'>
                  <Form.Label>Brands</Form.Label>

                  <Form.Control
                    name='sales_brand'
                    type='text'
                    value={salesInfo.sales_brand}
                    onChange={(e) => salesInfoFormHandler(e)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                <Form.Group className='mb-5'>
                  <Form.Label>Nama Sales Consultant</Form.Label>
                  <Form.Control
                    name='full_name'
                    type='text'
                    value={salesInfo.full_name}
                    onChange={(e) => salesInfoFormHandler(e)}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                <Form.Group className='mb-5'>
                  <Form.Label>Nomor Akun Bank</Form.Label>
                  <Form.Control
                    name='account_number'
                    type='number'
                    value={salesInfo.account_number}
                    onChange={(e) => salesInfoFormHandler(e)}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                <Form.Group className='mb-5'>
                  <Form.Label>Category</Form.Label>
                  <Select
                    placeholder='Pilih Category'
                    closeMenuOnSelect={false}
                    components={animatedComponents}
                    isMulti
                    options={categories}
                    value={selectedCategories}
                    onChange={(element) => handleChangeCategories(element)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                <Form.Group className='mb-5'>
                  <Form.Label>WA / Phone Number</Form.Label>
                  <Form.Control
                    name='phone_number'
                    type='number'
                    value={salesInfo.phone_number}
                    onChange={(e) => salesInfoFormHandler(e)}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                <Form.Group className='mb-5'>
                  <Form.Label>Nama Pemilik Akun Bank</Form.Label>
                  <Form.Control
                    name='account_name'
                    type='text'
                    value={salesInfo.account_name}
                    onChange={(e) => salesInfoFormHandler(e)}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                <Form.Group className='mb-5'>
                  <Form.Label>NIK</Form.Label>
                  <Form.Control
                    name='nik'
                    type='number'
                    value={salesInfo.nik}
                    onChange={(e) => salesInfoFormHandler(e)}
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>
        </Card.Body>
      </Card>

      <hr />

      <Card className='mb-5'>
        <Card.Header>
          <Card.Title>Account</Card.Title>
        </Card.Header>

        <Card.Body>
          <Row>
            <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
              <Form.Group className='mb-5'>
                <Form.Label>Username</Form.Label>

                <Form.Control
                  name='username'
                  type='text'
                  value={salesInfo.username}
                  onChange={(e) => salesInfoFormHandler(e)}
                />

                <Form.Text className='fs-8 fs-l text-dark-danger'>
                  *Jika username kosong, maka sistem akan menghasilkan username secara otomatis
                  dari nama lengkap, nama toko dengan format semua huruf kecil dan spasi diganti
                  menjadi underscore ( _ ). Contoh : john_doe_mitra10_gading_serpong
                </Form.Text>
              </Form.Group>
            </Col>

            <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
              <Form.Group className='mb-5'>
                <Form.Label>Default Password</Form.Label>
                <Form.Control
                  name='password'
                  type='text'
                  value={salesInfo.password}
                  onChange={(e) => salesInfoFormHandler(e)}
                />

                <Form.Text className='fs-8 fs-l text-dark-danger'>
                  *Default password yang digenerate oleh sistem jika kosong adalah{' '}
                  <b>"password"</b>
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <div className='d-flex justify-content-center mt-5'>
            <Button variant='dark-danger' type='submit' onClick={handleCancelCreateSales}>
              Cancel
            </Button>

            <Button
              className='d-flex justify-content-center align-items-center'
              variant='dark-primary'
              type='submit'
              disabled={isLoading}
              onClick={handleSubmitNewSales}
            >
              {isLoading ? 'Saving..' : 'Save'}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </section>
  )
}
