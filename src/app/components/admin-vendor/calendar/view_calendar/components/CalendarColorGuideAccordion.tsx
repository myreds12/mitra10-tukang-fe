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
                  <td>Order permintaan survey/pengerjaan</td>
                  <td>
                    <div className='box-primary'></div>
                  </td>
                </tr>

                <tr>
                  <td>Order sedang survey/pengerjaan</td>
                  <td>
                    <div className='box-brown'></div>
                  </td>
                </tr>

                <tr>
                  <td>Order Selesai</td>
                  <td>
                    <div className='box-success'></div>
                  </td>
                </tr>

                <tr>
                  <td>Order yang dijadwalkan ulang</td>
                  <td>
                    <div className='box-warning'></div>
                  </td>
                </tr>

                <tr>
                  <td>Order yang dikomplain</td>
                  <td>
                    <div className='box-danger'></div>
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
