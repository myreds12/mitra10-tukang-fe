import React from 'react'
import {Card, Row, Col, Form} from 'react-bootstrap'

interface VendorProfileSectionProps {
  username: string
  handleChangeUsernameVendor: (e: React.ChangeEvent<HTMLInputElement>) => void
  password: string
  handleChangePasswordVendor: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const VendorProfileSection: React.FC<VendorProfileSectionProps> = ({
  username,
  handleChangeUsernameVendor,
  password,
  handleChangePasswordVendor,
}) => {
  return (
    <Card className='mb-5'>
      <Card.Header>
        <Card.Title>Profile</Card.Title>
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
                *Jika username kosong, maka sistem akan menghasilkan username secara otomatis
                dari alamat email
              </Form.Text>
            </Form.Group>
          </Col>

          <Col xxl={6}>
            <Form.Group className='tukang-info'>
              <Form.Label>Reset Password</Form.Label>
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
