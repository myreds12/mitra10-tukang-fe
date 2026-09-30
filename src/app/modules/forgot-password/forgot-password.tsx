import {useState, useEffect} from 'react'

import {useNavigate} from 'react-router-dom'
import {Form, Button} from 'react-bootstrap'
import Swal from 'sweetalert2'
import axios from 'axios'
import {toAbsoluteUrl} from '../../../_metronic/helpers'

export function ForgotPassword() {
  const navigate = useNavigate()
  const apiUrl = process.env.REACT_APP_API_URL

  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  //  Validation
  const validation = () => {
    let valid = true

    if (!username) {
      Swal.fire({
        title: 'Warning',
        text: 'Please fill Username/Email form',
        icon: 'warning',
      })

      valid = false
    }

    return valid
  }

  const handleForgotPassword = () => {
    if (!validation()) {
      return false
    }

    setIsLoading(true)

    axios
      .post(
        `${apiUrl}/auth/reset-password`,
        {
          username,
        },
        {
          headers: {
            Accept: 'application/json',
            // 'Access-Control-Allow-Origin': '*',
           // 'ngrok-skip-browser-warning':  'true',
          },
        }
      )
      .then((res) => {
        if (res.data.status === 200) {
          Swal.fire({
            title: 'Please Check Email',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
          }).then(() => {
            navigate('/login')
          })

          setIsLoading(false)
        } else {
          navigate('/login')

          Swal.fire({
            title: 'Forgot Password Failed',
            icon: 'error',
          })

          setIsLoading(true)
        }
      })
      .catch((err) => {
        setIsLoading(false)

        Swal.fire({
          title: 'Forgot Password Failed',
          text: err?.response?.data?.message || err?.message || 'Terjadi kesalahan saat memproses permintaan',
          icon: 'error',
        })
      })
  }

  useEffect(() => {
    localStorage.setItem('kt_theme_mode_menu', 'light')
    localStorage.setItem('kt_theme_mode_value', 'light')
  }, [])

  return (
    <section id='login-page'>
      <div className='d-flex flex-column flex-column-fluid bgi-position-y-bottom position-x-center bgi-no-repeat bgi-size-contain bgi-attachment-fixed'>
        <div className='d-flex flex-center flex-column flex-column-fluid p-10 pb-lg-20'>
          <a href='/' className='mb-12'>
            <img alt='Logo' src={toAbsoluteUrl('/media/auth/logo-mitra.png')} className='h-100px' />
          </a>

          <div className='w-lg-500px bg-body rounded shadow-sm p-10 p-lg-15 mx-auto'>
            <div className='form w-100'>
              <div className='text-center mb-10'>
                <h1 className='text-dark mb-3'>Forgot Password</h1>
              </div>

              <div className='fv-row mb-10'>
                <Form.Group className='mb-3'>
                  <Form.Label className='fs-6 fw-bolder text-dark'>Username/Email</Form.Label>
                  <Form.Control
                    type='text'
                    name='username'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </Form.Group>

                <Form.Text className='text-muted'>
                  Isi Username/Email didalam form dan kami akan memberitahukan lewat email tersebut
                  untuk reset password
                </Form.Text>
              </div>

              <div className='text-center'>
                <Button
                  type='submit'
                  id='kt_sign_in_submit'
                  className='btn btn-lg btn-primary w-100 mb-5'
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                >
                  {isLoading ? 'Submitting..' : 'Submit'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
