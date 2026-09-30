import {useState, useEffect} from 'react'
import './reset-password.css'

import {useNavigate, useLocation} from 'react-router-dom'
import {Form, Button} from 'react-bootstrap'
import Swal from 'sweetalert2'
import axios from 'axios'
import {toAbsoluteUrl} from '../../../_metronic/helpers'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faEye, faEyeSlash} from '@fortawesome/free-solid-svg-icons'

export function ResetPassword() {
  const apiUrl = process.env.REACT_APP_API_URL
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const urlUsername = queryParams.get('username')

  // User Info
  const [username, setUsername] = useState()
  const userInfoData = async (username: string | null) => {
    try {
      await axios
        .get(`${apiUrl}/auth/get-user/${username}`, {
          headers: {
            Accept: 'application/json',
          },
        })
        .then((response) => {
          const data = response.data.data

          setUsername(data.username)

          if (data.forget_password === null) {
            navigate('/error')
          }
        })
    } catch (error: any) {
      if (error?.response?.data?.status === 400 || error?.response?.data?.statusCode === 404) {
        navigate('/error')
      }
    }
  }

  useEffect(() => {
    if (urlUsername) {
      userInfoData(urlUsername)
    }
  }, [urlUsername])

  const [passwordMatch, setPasswordMatch] = useState(true)
  const [passwordUser, setPasswordUser] = useState({
    value: '',
    confirmPassword: '',
  })

  const handlerPasswordChange = (e: any) => {
    setPasswordUser({
      ...passwordUser,
      [e.target.name]: e.target.value,
    })
  }

  const [isLoading, setIsLoading] = useState(false)

  const [handleTogglePassword, setHandleTogglePassword] = useState(false)
  const togglePasswordVisiblity = () => {
    setHandleTogglePassword(handleTogglePassword ? false : true)
  }

  const [handleToggleConfirmPassword, setHandleToggleConfirmPassword] = useState(false)
  const toggleConfirmPasswordVisiblity = () => {
    setHandleToggleConfirmPassword(handleToggleConfirmPassword ? false : true)
  }

  useEffect(() => {
    setPasswordMatch(true)
  }, [passwordUser.confirmPassword])

  // Password Validation
  const PasswordValidation = () => {
    let valid = true

    if (!passwordUser.value) {
      Swal.fire({
        title: 'Warning',
        text: 'Please fill Password form',
        icon: 'warning',
      })

      valid = false
    } else if (!passwordUser.confirmPassword) {
      Swal.fire({
        title: 'Warning',
        text: 'Please fill Confirm Password form',
        icon: 'warning',
      })

      valid = false
    } else if (passwordUser.value !== passwordUser.confirmPassword) {
      setPasswordMatch(false)
      valid = false
    }

    return valid
  }

  const handleResetPassword = () => {
    if (!PasswordValidation()) {
      return false
    }

    setIsLoading(true)

    const password = passwordUser.value

    axios
      .post(
        `${apiUrl}/auth/update-password/${username}`,
        {
          password,
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
            title: 'Reset Password Success',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
          }).then(() => {
            navigate('/login')
          })

          setIsLoading(false)
        } else {
          navigate('/reset-password')

          Swal.fire({
            title: 'Reset Password Failed',
            icon: 'error',
          })

          setIsLoading(true)
        }
      })
      .catch((err) => {
        setIsLoading(false)

        Swal.fire({
          title: 'Reset Password Failed',
          text: err?.response?.data?.message || err?.message || 'Terjadi kesalahan saat mereset password',
          icon: 'error',
        })
      })
  }

  return (
    <section id='reset-password'>
      <div className='d-flex flex-column flex-column-fluid bgi-position-y-bottom position-x-center bgi-no-repeat bgi-size-contain bgi-attachment-fixed'>
        <div className='d-flex flex-center flex-column flex-column-fluid p-10 pb-lg-20'>
          <a href='/' className='mb-12'>
            <img alt='Logo' src={toAbsoluteUrl('/media/auth/logo-mitra.png')} className='h-100px' />
          </a>

          <div className='w-lg-500px bg-body rounded shadow-sm p-10 p-lg-15 mx-auto'>
            <div className='form w-100'>
              <div className='text-center mb-10'>
                <h1 className='text-dark mb-3'>Reset Password</h1>
              </div>

              <div className='fv-row mb-10'>
                <Form.Group className='mb-3'>
                  <div className='d-flex justify-content-between mt-n5'>
                    <div className='d-flex flex-stack mb-2'>
                      <Form.Label className='fw-bolder text-dark fs-6 mb-0'>Password</Form.Label>
                    </div>
                  </div>

                  <Form.Control
                    name='value'
                    placeholder='Password'
                    type={handleTogglePassword ? 'text' : 'password'}
                    value={passwordUser.value}
                    onChange={(e) => handlerPasswordChange(e)}
                  />

                  <span className='show-hide-password' onClick={togglePasswordVisiblity}>
                    <FontAwesomeIcon
                      icon={handleTogglePassword ? faEye : faEyeSlash}
                      className='text-black'
                      size='lg'
                    />
                  </span>
                </Form.Group>
              </div>

              <div className='fv-row mb-10'>
                <Form.Group className='mb-3'>
                  <div className='d-flex justify-content-between mt-n5'>
                    <div className='d-flex flex-stack mb-2'>
                      <Form.Label className='fw-bolder text-dark fs-6 mb-0'>
                        Confirm Password
                      </Form.Label>
                    </div>
                  </div>

                  <Form.Control
                    name='confirmPassword'
                    placeholder='Confirm Password'
                    type={handleToggleConfirmPassword ? 'text' : 'password'}
                    value={passwordUser.confirmPassword}
                    onChange={(e) => handlerPasswordChange(e)}
                  />

                  {!passwordMatch && (
                    <Form.Text className='text-danger'>Confirm password is not matched</Form.Text>
                  )}

                  <span className='show-hide-password' onClick={toggleConfirmPasswordVisiblity}>
                    <FontAwesomeIcon
                      icon={handleToggleConfirmPassword ? faEye : faEyeSlash}
                      className='text-black'
                      size='lg'
                    />
                  </span>
                </Form.Group>
              </div>

              <div className='text-center'>
                <Button
                  type='submit'
                  id='kt_sign_in_submit'
                  className='btn btn-lg btn-primary w-100 mb-5'
                  onClick={handleResetPassword}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save New Password'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
