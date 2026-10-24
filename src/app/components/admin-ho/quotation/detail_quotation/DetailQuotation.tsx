import React, {FC, useEffect, useState, useRef} from 'react'
import {formatDate, toAbsoluteUrl} from '../../../../../_metronic/helpers'
import {useParams} from 'react-router-dom'

import './DetailQuotation.css'

import axios from 'axios'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import {Table, Row, Col, Card, Button} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faDownload} from '@fortawesome/free-solid-svg-icons'

const DetailQuotationHO: FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL
  const params = useParams()
  const pdfRef = useRef<HTMLDivElement>(null)

  const [loadingPDF, setLoadingPDF] = useState(false)
  const [quotationDetail, setQuotationDetail] = useState<any>()

  const fetchQuotationData = async () => {
    try {
      await axios
        .get(`${apiUrl}/quotation/${params.id}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            // 'Access-Control-Allow-Origin': '*',
            // 'ngrok-skip-browser-warning':  'true',
          },
        })
        .then((response) => {
          const data = response.data.data
          setQuotationDetail(data)
        })
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchQuotationData()
  }, [])

  const generatePdf = async () => {
    setLoadingPDF(true)
    const input = pdfRef.current
    try {
      if (!input) return

      const canvas = await html2canvas(input, {
        backgroundColor: '#ffffff',
        useCORS: true,
      })
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const renderedPageHeight = (canvas.width * pdfHeight) / pdfWidth
      let sourceY = 0
      let pageNumber = 0

      while (sourceY < canvas.height) {
        const pageCanvas = document.createElement('canvas')
        pageCanvas.width = canvas.width
        pageCanvas.height = Math.min(renderedPageHeight, canvas.height - sourceY)

        const pageContext = pageCanvas.getContext('2d')
        if (!pageContext) throw new Error('Canvas context tidak tersedia')

        pageContext.fillStyle = '#ffffff'
        pageContext.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
        pageContext.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          pageCanvas.height,
          0,
          0,
          pageCanvas.width,
          pageCanvas.height
        )

        const pageImage = pageCanvas.toDataURL('image/png')
        const pageImageHeight = (pageCanvas.height * pdfWidth) / pageCanvas.width

        if (pageNumber > 0) pdf.addPage()
        pdf.addImage(pageImage, 'PNG', 0, 0, pdfWidth, pageImageHeight)

        sourceY += pageCanvas.height
        pageNumber += 1
      }

      pdf.save(
        `Quotation - ${quotationDetail?.order?.members?.full_name} - ${formatDate(
          quotationDetail?.quotation_date
        )}.pdf`
      )
    } catch (error) {
      console.error('Gagal membuat PDF quotation', error)
    } finally {
      setLoadingPDF(false)
    }
  }

  return (
    <section id='detail-quotation'>
      <Card ref={pdfRef}>
        <Card.Body>
          <Row className='quotation-detail mb-4'>
            <Col xxl={6} xl={6} md={6} sm={12} className='vendor-information'>
              <div className='vendor-detail'>
                <img
                  alt='Logo'
                  className='h-50px logo mb-3'
                  src={toAbsoluteUrl('/media/auth/logo-mitra.png')}
                />

                <div className='address'>
                  <div className='fs-3 fw-semibold mb-2'>
                    {quotationDetail?.store?.store_name ?? ''}
                  </div>
                  <div className='fs-4 fw-normal'>{quotationDetail?.store?.address ?? ''}</div>
                  <div className='fs-4 fw-normal'>
                    {`Telp : ${
                      quotationDetail?.store?.phone_number_1 ??
                      quotationDetail?.store?.phone_number_2 ??
                      'Nomor telepon belum tersedia'
                    }`}
                  </div>
                </div>
              </div>
            </Col>

            <Col xxl={6} xl={6} md={6} sm={12} className='quotation-information'>
              <h1 className='fw-bolder mb-3'>QUOTATION</h1>

              <div className='fs-4 fw-semibold'>
                Tanggal :
                <span className='ms-1 fw-normal'>
                  {formatDate(quotationDetail?.quotation_date)}
                </span>
              </div>

              <div className='fs-4 fw-semibold'>
                Quotation ID : <span className='fw-normal'>{quotationDetail?.id}</span>
              </div>

              <div className='fs-4 fw-semibold'>
                Customer ID :{' '}
                <span className='fw-normal'>{quotationDetail?.order?.members?.member_number}</span>
              </div>
            </Col>
          </Row>

          <Row className='quotation-detail mb-4'>
            <Col xxl={6} xl={6} md={6} sm={12} className='receiver-information'>
              <div className='receiver-detail'>
                <div className='fs-2 fw-semibold'>Ditunjukkan kepada :</div>
                <div className='fs-4 fw-normal'>{quotationDetail?.order?.members?.full_name}</div>
                <div className='fs-4 fw-normal'>{quotationDetail?.order.project_address}</div>
                <div className='fs-4 fw-normal'>Telp : {quotationDetail?.order.project_number}</div>
              </div>
            </Col>

            <Col xxl={6} xl={6} md={6} sm={12} className='quotation-information'>
              <div className='fs-4 fw-semibold'>
                Quotation Valid Until :
                <span className='ms-1 fw-normal'>
                  {quotationDetail?.quotation_validity
                    ? formatDate(quotationDetail?.quotation_validity)
                    : '-'}
                </span>
              </div>

              <div className='description'>
                <div className='fs-4 fw-semibold'>
                  Instruksi Spesial :{' '}
                  <span className='fs-4 fw-normal'>{quotationDetail?.description ?? ''}</span>
                </div>
              </div>
            </Col>
          </Row>

          <Row className='detail-table mb-2'>
            <Table hover className='table-jasa'>
              <thead>
                <tr>
                  <th className='text-center' style={{minWidth: '233px'}}>
                    Jenis Jasa
                  </th>
                  <th className='text-center'>QTY</th>
                  <th className='text-center'>Satuan</th>
                  <th className='text-center'>Final Price</th>
                </tr>
              </thead>
              <tbody>
                {quotationDetail?.quotation_details
                  .filter((x: any) => x.item_type === 2)
                  .map((item: any) => (
                    <>
                      <tr>
                        <td>{item?.name ?? '-'}</td>
                        <td>{item?.quantity}</td>
                        <td>{item?.unit ?? '-'}</td>
                        <td>{`Rp. ${parseInt(item?.final_price || 0).toLocaleString('id')}`}</td>
                      </tr>
                    </>
                  ))}
              </tbody>
            </Table>

            <Table hover className='table-material'>
              <thead>
                <tr>
                  <th className='text-center' style={{minWidth: '200px'}}>
                    Material yang dibutuhkan
                  </th>
                  <th className='text-center'>QTY</th>
                  <th className='text-center'>Satuan</th>
                  <th className='text-center'>Final Price</th>
                </tr>
              </thead>
              <tbody>
                {quotationDetail?.quotation_details
                  .filter((x: any) => x.item_type === 1)
                  .map((item: any) => (
                    <>
                      <tr>
                        <td>
                          {item?.name ?? '-'}{' '}
                          {item?.is_customer === true ? '( Disediakan oleh customer )' : ''}
                        </td>
                        <td>{item?.quantity}</td>
                        <td>{item?.unit ?? '-'}</td>
                        <td>{`Rp. ${parseInt(item?.final_price || 0).toLocaleString('id')}`}</td>
                      </tr>
                    </>
                  ))}

                <tr>
                  <td colSpan={3} className='text-end fw-bolder'>
                    Total Jasa
                  </td>
                  <td className='fw-bolder'>{`Rp. ${parseInt(
                    quotationDetail?.quotation_details
                      .filter((x: any) => x.item_type === 2)
                      .reduce((total: any, item: any) => total + parseInt(item.final_price || 0), 0)
                  ).toLocaleString('id')}`}</td>
                </tr>

                <tr>
                  <td colSpan={3} className='text-end fw-bolder'>
                    Total Material
                  </td>
                  <td className='fw-bolder'>{`Rp. ${parseInt(
                    quotationDetail?.quotation_details
                      .filter((x: any) => x.item_type === 1)
                      .reduce((total: any, item: any) => total + parseInt(item.final_price || 0), 0)
                  ).toLocaleString('id')}`}</td>
                </tr>

                <tr>
                  <td colSpan={3} className='text-end fw-bolder'>
                    Promosi
                  </td>
                  <td className=' fw-bolder'>{`Rp. ${parseInt(
                    quotationDetail?.quotation_disc
                  ).toLocaleString('id')}`}</td>
                </tr>

                <tr>
                  <td colSpan={3} className='text-end fw-bolder'>
                    {`${
                      quotationDetail?.promotion
                        ? `Additional Promotion (${quotationDetail?.promotion?.name})`
                        : `Additional Promotion`
                    }`}
                  </td>
                  <td className=' fw-bolder'>
                    {quotationDetail?.promotion?.promotion_type === 1
                      ? `${quotationDetail?.promotion?.promotion} %`
                      : `Rp. ${parseInt(quotationDetail?.promotion?.promotion ?? 0).toLocaleString(
                          'id'
                        )}`}
                  </td>
                </tr>

                <tr>
                  <td colSpan={3} className='text-end fw-bolder'>
                    Grand Total
                  </td>
                  <td className=' fw-bolder'>
                    {`Rp. ${parseInt(quotationDetail?.quotation_grand_total).toLocaleString('id')}`}
                  </td>
                </tr>
              </tbody>
            </Table>
          </Row>

          <Row className='payment-information mb-2'>
            <div className='payment-method'>
              <div className='fs-3 fw-semibold mb-2'>
                Silahkan melakukan pembayaran di account di bawah ini :
              </div>

              <div className='fs-4 fw-normal'>{quotationDetail?.store?.bank_account}</div>
              <div className='fs-4 fw-normal'>{quotationDetail?.store?.bank_name}</div>
              <div className='fs-4 fw-normal'>{quotationDetail?.store?.bank_number}</div>
            </div>

            <div className='payment-evidence'>
              <div className='fs-3 fw-semibold mb-2'>Silahkan kirim bukti bayar anda melalui:</div>

              <div className='fs-4 fw-normal'>
                {`Telp : ${
                  quotationDetail?.store?.phone_number_1 ??
                  quotationDetail?.store?.phone_number_2 ??
                  'Nomor telepon belum tersedia'
                }`}
              </div>

              <div className='fs-4 fw-normal'>
                {' '}
                {`Email : ${
                  quotationDetail?.store?.email ??
                  quotationDetail?.store?.email ??
                  'Email belum tersedia'
                }`}
              </div>

              <div className='fs-4 fw-semibold mt-2'>
                Terima kasih telah melakukan bisnis dengan Mitra10. Kami harap kedatangan anda
                kembali.
              </div>
            </div>
          </Row>
        </Card.Body>
      </Card>

      <Button
        className='btn-dark-primary d-flex justify-content-center align-items-center mt-5 w-100 gap-3'
        onClick={generatePdf}
      >
        {loadingPDF === false ? (
          <>
            <FontAwesomeIcon icon={faDownload} size='lg' />
            Download PDF
          </>
        ) : (
          'Generating PDF...'
        )}
      </Button>
    </section>
  )
}

export {DetailQuotationHO}
