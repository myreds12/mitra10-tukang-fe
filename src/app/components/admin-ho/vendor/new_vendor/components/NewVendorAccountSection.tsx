import React from 'react'
import {Card, Row, Col, Form} from 'react-bootstrap'

interface NewVendorAccountSectionProps {
  username: any
  handleChangeUsernameVendor: (event: React.ChangeEvent<HTMLInputElement>) => void
  password: any
  handleChangePasswordVendor: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export const NewVendorAccountSection: React.FC<NewVendorAccountSectionProps> = ({
  username,
  handleChangeUsernameVendor,
  password,
  handleChangePasswordVendor,
}) => {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Akun</Card.Title>
      </Card.Header>

      <Card.Body>
        <Row>
          <Col xxl={6}>
            <Form.Group className='tukang-info'>
              <Form.Label>Username</Form.Label>
              <Form.Control
                type='text'
                name='username'
                onChange={handleChangeUsernameVendor}
                value={username}
              />

              <Form.Text className='fs-8 fs-l text-dark-danger'>
                *Jika username kosong, maka sistem akan menghasilkan username secara otomatis dari
                alamat email
              </Form.Text>
            </Form.Group>
          </Col>

          <Col xxl={6}>
            <Form.Group className='tukang-info'>
              <Form.Label>Password</Form.Label>
              <Form.Control
                type='text'
                name='password'
                onChange={handleChangePasswordVendor}
                value={password}
              />
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}
