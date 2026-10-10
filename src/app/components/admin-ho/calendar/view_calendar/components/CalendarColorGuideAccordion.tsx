import React from 'react'
import {Accordion, Table} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faCircleInfo} from '@fortawesome/free-solid-svg-icons'

export const CalendarColorGuideAccordion: React.FC = () => {
  return (
    <Accordion className='mb-5'>
      <Accordion.Item eventKey='0'>
        <Accordion.Header>
          <FontAwesomeIcon icon={faCircleInfo} size='lg' className='me-2' />
          <p className='fs-7 fw-bold'>Panduan Warna Kalendar</p>
        </Accordion.Header>

        <Accordion.Body>
          <div className='description fs-7 mb-5'>
            Informasi mengenai keterangan warna didalam kalendar
          </div>

          <div className='vendor-avail'>
            <Table>
              <thead>
                <tr>
                  <th>Status Order</th>
                  <th>Warna</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>Order baru</td>
                  <td>
                    <div className='d-flex gap-2'>
                      <div className='box-primary'></div>
                      <div className='fs-6'>(Biru Tua)</div>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td>Order diterima HO</td>
                  <td>
                    <div className='d-flex gap-2'>
                      <div className='box-light-primary'></div>
                      <div className='fs-6'>(Biru Muda)</div>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td>Order diterima Vendor</td>
                  <td>
                    <div className='d-flex gap-2'>
                      <div className='box-brown'></div>
                      <div className='fs-6'>(Pink)</div>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td>Order Selesai</td>
                  <td>
                    <div className='d-flex gap-2'>
                      <div className='box-success'></div>
                      <div className='fs-6'>(Hijau)</div>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td>Order yang dijadwalkan ulang</td>
                  <td>
                    <div className='d-flex gap-2'>
                      <div className='box-warning'></div>
                      <div className='fs-6'>(Orange)</div>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td>Order yang dikomplain</td>
                  <td>
                    <div className='d-flex gap-2'>
                      <div className='box-danger'></div>
                      <div className='fs-6'>(Merah)</div>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td>Order yang dibatalkan</td>
                  <td>
                    <div className='d-flex gap-2'>
                      <div className='box-black'></div>
                      <div className='fs-6'>(Hitam)</div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  )
}
