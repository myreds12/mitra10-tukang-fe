import {useState, useEffect} from 'react'
import './Login.css'

import {Link, useNavigate} from 'react-router-dom'
import {Form, Button, Modal} from 'react-bootstrap'
import Swal from 'sweetalert2'
import axios from 'axios'
import {toAbsoluteUrl} from '../../../_metronic/helpers'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faEye, faEyeSlash} from '@fortawesome/free-solid-svg-icons'

import ModalNotification from './ModalNotification'
import TermsAndConditionsViewer from './TermsAndConditionsViewer'

interface Status {
  value: number
  description: string
  category: string
}

export function Login() {
  const navigate = useNavigate()
  const apiUrl = process.env.REACT_APP_API_URL

  // eslint-disable-next-line
  const [status, setStatus] = useState<Status[]>([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showTerms, setShowTerms] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [handleTogglePassword, setHandleTogglePassword] = useState(false)
  const togglePasswordVisiblity = () => {
    setHandleTogglePassword(handleTogglePassword ? false : true)
  }

  // Get Status
  const getStatus = async () => {
    try {
      const response = await axios.get(`${apiUrl}/status?take=0`, {
        headers: {
          Accept: 'application/json',
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
        timeout: 2500,
      })

      if (Array.isArray(response.data.data)) {
        const tempStatus = response.data.data.map((item: any) => ({
          value: item.id,
          category: item.category,
          description: item.description,
        }))

        setStatus(tempStatus)

        sessionStorage.setItem('statusData', JSON.stringify(tempStatus))
      } else {
        console.error('API response data is not an array:', response.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  // Handle Login
  const handleLogin = () => {
    setIsLoading(true)

    axios
      .post(
        `${apiUrl}/auth/login`,
        {
          username,
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
          const user = res.data.data.user

          const isSales = user.roles.name === 'Sales'
          const isManager = user.roles.name === 'Manager Store'
          const isStore = ['Store Staff', 'Store CS'].includes(user.roles.name)
          const isAdminHO = ['Admin HO', 'Super User'].includes(user.roles.name)
          const isVendor = ['Owner Vendor', 'Admin Vendor'].includes(user.roles.name)
          const isTukang = user.roles.name === 'Tukang'
          const isFinance = user.roles.name === 'Finance'
          const isPayroll = user.roles.name === 'Payroll'
          const isRegistrant = user.roles.name === 'Pendaftar Vendor'
          const isEmployee =
            user.employee !== null &&
            !isStore &&
            !isSales &&
            !isVendor &&
            !isTukang &&
            !isAdminHO &&
            !isRegistrant

          localStorage.setItem('user_id', user.id)
          localStorage.setItem('username', user.username)
          localStorage.setItem('userRole', user.roles.name)
          localStorage.setItem('accessToken', res.data.data.accessToken)

          if (isSales) {
            localStorage.setItem('sales_id', user?.sales[0]?.id)
            localStorage.setItem('salesName', user?.sales[0]?.full_name)
            localStorage.setItem('storeId', user?.sales[0]?.store?.id)
            localStorage.setItem('storeName', user?.sales[0]?.store?.store_name)
            localStorage.setItem('areaId', user?.sales[0]?.store?.area?.id)
          } else if (isManager) {
            localStorage.setItem('storeId', user?.manager[0]?.store?.id)
          } else if (isStore) {
            localStorage.setItem(
              'storeId',
              user.employee ? user?.employee?.store?.id : user?.store[0]?.id
            )

            localStorage.setItem(
              'storeName',
              user.employee ? user?.employee?.store?.store_name : user?.store[0]?.store_name
            )

            localStorage.setItem(
              'areaId',
              user.employee ? user?.employee?.store?.area?.id : user?.store[0]?.area?.id
            )
          } else if (isEmployee) {
            localStorage.setItem('storeId', user?.employee?.store?.id)
            localStorage.setItem('employeeName', user?.employee?.full_name)
            localStorage.setItem('storeName', user?.employee?.store?.store_name)
            localStorage.setItem('areaId', user?.employee?.store?.area?.id)
          } else if (isVendor) {
            localStorage.setItem('vendor_id', user?.pic_vendor[0]?.vendor_id)
            localStorage.setItem('max_order', user?.pic_vendor[0]?.vendor?.max_order)
            localStorage.setItem('vendorName', user?.pic_vendor[0]?.vendor?.company_name)
          } else if (isTukang) {
            localStorage.setItem('tukang_id', user?.tukang[0]?.id)
          } else if (isPayroll) {
            localStorage.setItem('payrollid', user?.id)
            localStorage.setItem('financeName', user?.username)
          } else if (isRegistrant) {
            // Pendaftar vendor: tidak perlu localStorage tambahan (vendor_id dsb
            // belum ada - pendaftaran belum disetujui). Redirect ditangani
            // AppRoutes navigateUrl() -> /pendaftar/home.
          } else if (!isSales && !isAdminHO && !isEmployee && !isVendor) {
            window.location.reload()
          }

          Swal.fire({
            title: 'Login Success',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
          }).then(() => {
            window.location.reload()
          })
        } else {
          navigate('/login')
          Swal.fire({
            title: 'Login Failed',
            icon: 'error',
          })

          setIsLoading(false)
        }
      })
      .catch((err) => {
        setIsLoading(false)
        Swal.fire({
          title: 'Login Failed',
          text: err.response.data.message,
          icon: 'error',
        })
        console.error(err)
      })
  }

  useEffect(() => {
    localStorage.setItem('kt_theme_mode_menu', 'light')
    localStorage.setItem('kt_theme_mode_value', 'light')
  }, [])

  // const handleLoginSuccess = async () => {
  //   await getStatus()

  //   Swal.fire({
  //     title: 'Login Success',
  //     icon: 'success',
  //     timer: 1500,
  //     showConfirmButton: false,
  //   }).then(() => {
  //     window.location.reload()
  //   })

  //   setIsLoading(false)
  // }

  return (
    <section id='login-page'>
      <div className='d-flex flex-column flex-column-fluid bgi-position-y-bottom position-x-center bgi-no-repeat bgi-size-contain bgi-attachment-fixed'>
        <div className='d-flex flex-center flex-column flex-column-fluid p-10 pb-lg-20'>
          <a href='/' className='mb-12'>
            <img alt='Logo' src={toAbsoluteUrl('/media/auth/logo-mitra.png')} className='h-100px' />
          </a>

          <div className='w-lg-500px bg-body rounded shadow-sm p-10 p-lg-15 mx-auto'>
            <form className='form w-100' onSubmit={handleLogin}>
              <div className='text-center mb-10'>
                <h1 className='text-dark mb-3'>Sign In to Instalasi Website</h1>
              </div>

              <div className='fv-row mb-10'>
                <Form.Group className='mb-3'>
                  <Form.Label className='fs-6 fw-bolder text-dark'>Username</Form.Label>
                  <Form.Control
                    placeholder='Username'
                    type='text'
                    name='username'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </Form.Group>
              </div>

              <div className='fv-row mb-10'>
                <Form.Group className='mb-3'>
                  <div className='d-flex justify-content-between mt-n5'>
                    <div className='d-flex flex-stack mb-2'>
                      <Form.Label className='fw-bolder text-dark fs-6 mb-0'>Password</Form.Label>
                      <Link
                        to='/forgot-password'
                        className='link-primary fs-6 fw-bolder'
                        style={{marginLeft: '5px'}}
                      >
                        Forgot Password ?
                      </Link>
                    </div>
                  </div>

                  <Form.Control
                    placeholder='Password'
                    type={handleTogglePassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <div className='text-center'>
                <Button
                  type='submit'
                  id='kt_sign_in_submit'
                  className='btn btn-lg btn-primary w-100 mb-5'
                  onClick={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging In...' : 'Login'}
                </Button>
              </div>
              <div className='text-center mt-5 pt-5 border-top'>
                <p className='text-muted mb-2'>Belum punya akun vendor?</p>
                <Link
                  to='/vendor-register'
                  className='btn btn-outline-primary w-100'
                >
                  Daftar sebagai Vendor
                </Link>

                {/* Tombol Syarat & Ketentuan - viewer read-only (HTML, tanpa download) */}
                <Button
                  type='button'
                  variant='link'
                  className='mt-3 p-0 text-muted'
                  onClick={() => setShowTerms(true)}
                >
                  Syarat &amp; Ketentuan
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showModal && <ModalNotification onClose={() => setShowModal(false)} />}

      {/* Viewer T&C read-only (HTML dari DB, tanpa download) */}
      <TermsAndConditionsViewer show={showTerms} onClose={() => setShowTerms(false)} />
    </section>
  )
}
