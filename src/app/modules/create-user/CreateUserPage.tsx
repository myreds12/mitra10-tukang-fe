import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Card,
  Form,
  Input,
  Button,
  Alert,
  Spin,
  message,
} from 'antd'
import { CheckCircleOutlined, LockOutlined } from '@ant-design/icons'

interface TokenValidation {
  valid: boolean
  registration_id: number
  company_name: string
  expires_at: string
}

const CreateUserPage: React.FC = () => {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState(false)
  const [tokenData, setTokenData] = useState<TokenValidation | null>(null)
  const [error, setError] = useState('')
  const [form] = Form.useForm()

  useEffect(() => {
    validateToken()
  }, [token])

  const validateToken = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/vendor-registration/validate-token`,
        { params: { token } }
      )
      setTokenData(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Token tidak valid atau sudah kadaluarsa')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values: any) => {
    setValidating(true)
    setError('')
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/vendor-registration/create-user`,
        { token, ...values }
      )
      message.success('Akun berhasil dibuat! Silakan login.')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Terjadi kesalahan')
    } finally {
      setValidating(false)
    }
  }

  if (loading) {
    return (
      <div className='d-flex justify-content-center align-items-center' style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Spin size='large' tip='Memvalidasi token...' />
      </div>
    )
  }

  if (error && !tokenData) {
    return (
      <div className='d-flex justify-content-center align-items-center' style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Card style={{ width: 500 }}>
          <Alert
            message='Token Tidak Valid'
            description={error}
            type='error'
            showIcon
          />
          <Button type='link' onClick={() => navigate('/login')} className='mt-3'>
            Kembali ke Login
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className='d-flex justify-content-center align-items-center' style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Card
        title={
          <div className='text-center'>
            <img
              src='https://seeklogo.com/images/M/mitra-10-logo-5C2346D8FD-seeklogo.com.png'
              alt='Mitra10'
              style={{ width: 80, marginBottom: 10 }}
            />
            <div className='fs-4 fw-bold'>Buat Akun Vendor</div>
            <div className='text-muted small'>{tokenData?.company_name}</div>
          </div>
        }
        style={{ width: 500 }}
        className='shadow'
      >
        <Alert
          message={`Pendaftaran Vendor: ${tokenData?.company_name}`}
          description={
            <div>
              <p>Token valid. Silakan buat username dan password untuk akun Anda.</p>
              <p className='mb-0'>
                <small>
                  Kadaluarsa: {new Date(tokenData?.expires_at || '').toLocaleString('id-ID')}
                </small>
              </p>
            </div>
          }
          type='success'
          showIcon
          icon={<CheckCircleOutlined />}
          className='mb-3'
        />

        {error && (
          <Alert message={error} type='error' showIcon className='mb-3' />
        )}

        <Form form={form} layout='vertical' onFinish={handleSubmit}>
          <Form.Item
            label='Username'
            name='username'
            rules={[
              { required: true, message: 'Wajib diisi' },
              { min: 4, message: 'Minimal 4 karakter' },
              { max: 20, message: 'Maksimal 20 karakter' },
            ]}
          >
            <Input prefix={<LockOutlined />} placeholder='Username untuk login' />
          </Form.Item>

          <Form.Item
            label='Password'
            name='password'
            rules={[
              { required: true, message: 'Wajib diisi' },
              { min: 6, message: 'Minimal 6 karakter' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder='Password' />
          </Form.Item>

          <Form.Item
            label='Konfirmasi Password'
            name='confirmPassword'
            dependencies={['password']}
            rules={[
              { required: true, message: 'Wajib diisi' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('Password tidak cocok'))
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder='Konfirmasi password' />
          </Form.Item>

          <Form.Item className='mb-2'>
            <Button
              type='primary'
              htmlType='submit'
              loading={validating}
              block
              size='large'
            >
              Buat Akun
            </Button>
          </Form.Item>

          <div className='text-center'>
            <Button type='link' onClick={() => navigate('/login')}>
              Kembali ke Login
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default CreateUserPage
