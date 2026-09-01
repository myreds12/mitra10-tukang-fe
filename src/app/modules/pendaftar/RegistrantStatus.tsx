import {useEffect, useState} from 'react'
import axios from 'axios'
import {Table, Spin} from 'antd'
import {LoadingOutlined} from '@ant-design/icons'
import type {ColumnsType} from 'antd/es/table'
import './RegistrantStatus.css'

interface MyRegistration {
  id: number
  company_name: string
  pic_name: string
  pic_email: string
  pic_phone: string
  status: number
  rejection_reason: string | null
  created_at: string
  updated_at: string | null
}

/**
 * Mapping status RegistrationStatus (enum backend) ke tahapan alur:
 * Pendaftaran -> Verifikasi -> Review Admin -> Approval -> Diterima sebagai Vendor.
 *
 * Status enum existing di backend:
 * 1 = MENUNGGU_APPROVE, 2 = PROSES_PITCHING, 3 = DISETUJUI, 4 = DITOLAK
 * Mapping ke tahapan (lihat [ASUMSI] di laporan):
 * - 1 (Menunggu Approve)  -> "Pendaftaran" / "Menunggu Approve" (badge kuning)
 * - 2 (Proses Pitching)   -> "Verifikasi & Review Admin" (badge biru)
 * - 3 (Disetujui)          -> "Diterima sebagai Vendor" (badge hijau)
 * - 4 (Ditolak)            -> "Ditolak" (badge merah)
 */
const STATUS_CONFIG: Record<number, {label: string; stage: string; className: string}> = {
  1: {
    label: 'Menunggu Approve',
    stage: 'Pendaftaran - menunggu verifikasi admin',
    className: 'registrant-status-badge registrant-status-pending',
  },
  2: {
    label: 'Proses Pitching',
    stage: 'Verifikasi & Review Admin',
    className: 'registrant-status-badge registrant-status-review',
  },
  3: {
    label: 'Disetujui',
    stage: 'Diterima sebagai Vendor',
    className: 'registrant-status-badge registrant-status-approved',
  },
  4: {
    label: 'Ditolak',
    stage: 'Ditolak',
    className: 'registrant-status-badge registrant-status-rejected',
  },
}

/**
 * Halaman Status dashboard Pendaftar Vendor.
 * Menampilkan pendaftaran milik user yang login SAJA (ownership via user_id
 * di-check backend). Data di-fetch on page load (tidak perlu polling).
 */
const RegistrantStatus: React.FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL

  const [isLoading, setIsLoading] = useState(true)
  const [registrations, setRegistrations] = useState<MyRegistration[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchMyRegistrations = async () => {
      setIsLoading(true)
      setError('')
      try {
        const token = localStorage.getItem('accessToken')
        const response = await axios.get(`${apiUrl}/vendor-registration/me/registrations`, {
          headers: {Accept: 'application/json', Authorization: `Bearer ${token}`},
          timeout: 10000,
        })
        const data = response.data?.data ?? response.data
        setRegistrations(data?.data ?? [])
      } catch (err: any) {
        console.error('Error fetching my registrations:', err)
        setError(
          err?.response?.status === 403
            ? 'Anda tidak memiliki akses ke halaman ini.'
            : 'Gagal memuat data pendaftaran. Silakan coba beberapa saat lagi.'
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchMyRegistrations()
  }, [apiUrl])

  const columns: ColumnsType<MyRegistration> = [
    {
      title: 'No',
      key: 'no',
      align: 'center',
      width: 60,
      render: (_text, _record, index) => index + 1,
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      align: 'center',
      width: 70,
    },
    {
      title: 'Nama Perusahaan',
      dataIndex: 'company_name',
      key: 'company_name',
      align: 'left',
      width: 180,
    },
    {
      title: 'Nama PIC',
      dataIndex: 'pic_name',
      key: 'pic_name',
      align: 'left',
      width: 130,
    },
    {
      title: 'Email PIC',
      dataIndex: 'pic_email',
      key: 'pic_email',
      align: 'left',
      width: 180,
    },
    {
      title: 'Telepon',
      dataIndex: 'pic_phone',
      key: 'pic_phone',
      align: 'left',
      width: 120,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 170,
      render: (status: number, record: MyRegistration) => {
        const config = STATUS_CONFIG[status] ?? {
          label: 'Unknown',
          stage: '',
          className: 'registrant-status-badge registrant-status-unknown',
        }
        return (
          <div className='registrant-status-cell'>
            <span className={config.className}>{config.label}</span>
            {status === 4 && record.rejection_reason ? (
              <div className='registrant-status-reason' title={record.rejection_reason}>
                {record.rejection_reason}
              </div>
            ) : null}
          </div>
        )
      },
    },
    {
      title: 'Tanggal Pendaftaran',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center',
      width: 160,
      render: (date: string) =>
        new Date(date).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
    },
  ]

  return (
    <section id='registrant-status' className='registrant-page'>
      <div className='card'>
        <div className='card-body'>
          <h1 className='registrant-status-title'>Status Pendaftaran</h1>
          <p className='registrant-status-subtitle'>
            Tahapan pendaftaran vendor: Pendaftaran &rarr; Verifikasi &rarr; Review Admin &rarr;
            Approval &rarr; Diterima sebagai Vendor.
          </p>

          <Spin
            tip='Loading...'
            spinning={isLoading}
            size='large'
            indicator={<LoadingOutlined style={{fontSize: 24}} spin />}
          >
            {error ? (
              <div className='registrant-status-error'>{error}</div>
            ) : registrations.length === 0 ? (
              <div className='registrant-status-empty'>
                Belum ada data pendaftaran yang terkait dengan akun ini.
              </div>
            ) : (
              <Table
                className='table-striped-rows registrant-status-table'
                bordered
                columns={columns}
                dataSource={registrations}
                rowKey={(record) => record.id}
                pagination={false}
                sticky
                tableLayout='auto'
                scroll={{x: 'max-content'}}
              />
            )}
          </Spin>
        </div>
      </div>
    </section>
  )
}

export default RegistrantStatus
