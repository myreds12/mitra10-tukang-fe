/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import {KTSVG} from '../../../helpers'
import {AsideMenuItemWithSub} from './AsideMenuItemWithSub'
import {AsideMenuItem} from './AsideMenuItem'
import Swal from 'sweetalert2'

export function AsideMenuMain() {
  const userRole = localStorage.getItem('userRole') as string
  const userVendor = localStorage.getItem('vendor_id')
  const userTukang = localStorage.getItem('tukang_id')
  const isVendorSpEnabled = process.env.REACT_APP_ENABLE_VENDOR_SP === 'true'

  const manualBookHandle = () => {
    document.location.href = '/manual-book'
  }
  const logoutHandler = () => {
    const textConfirmation = `Apakah Anda yakin ingin keluar dari aplikasi ini ?`

    Swal.fire({
      title: textConfirmation,
      icon: 'question',
      showConfirmButton: true,
      confirmButtonColor: '#6b9230',
      showDenyButton: true,
      confirmButtonText: 'Ya',
      denyButtonText: 'Tidak',
    }).then(async (result) => {
      if (result.isConfirmed) {
        localStorage.clear()
        sessionStorage.clear()

        Swal.fire({
          icon: 'success',
          title: 'Logout Success',
          text: 'You have been logged out successfully.',
          showConfirmButton: false,
          timer: 3000,
        }).then(() => {
          document.location.href = '/login'
        })
      }
    })
  }

  return (
    <>
      {/* Halaman Home */}
      <AsideMenuItem
        to='/home'
        icon='/media/icons/duotune/general/gen001.svg'
        title='Home ( Dashboard )'
        fontIcon='bi-app-indicator'
        role={[
          'Store CS',
          'Store Staff',
          'Sales',
          'Manager Store',
          'Super User',
          'Admin HO',
          'Admin Vendor',
          'Owner Vendor',
          'Tukang',
          'Admin WA',
          'Admin WA2',
        ]}
      />

      {/* Halaman Order */}
      <AsideMenuItemWithSub
        to='/order'
        title='Order'
        icon='/media/icons/duotune/files/fil012.svg'
        fontIcon='bi-person'
        role={['Store CS', 'Store Staff', 'Sales', 'Admin HO', 'Super User', 'Manager Store']}
      >
        <AsideMenuItem
          to='/order/dashboard-order'
          title='Order Summary'
          role={['Store CS', 'Admin Vendor', 'Owner Vendor', 'Tukang']}
          hasBullet={true}
        />
        <AsideMenuItem
          to='/warranty/claim-warranty-list'
          title='Claim Garansi'
          role={['Admin HO', 'Super User']}
          hasBullet={true}
        />
        <AsideMenuItem
          to='/calendar/view-calendar'
          title={
            userRole === 'Admin HO' || userRole === 'Super User'
              ? 'Kalender Order'
              : 'Kalender Instalasi'
          }
          role={['Sales', 'Store Staff', 'Store CS', 'Admin HO', 'Super User']}
          hasBullet={true}
        />

        <AsideMenuItem
          to='/order/view-order'
          title='List Order'
          role={['Store CS', 'Store Staff', 'Sales', 'Admin HO', 'Super User', 'Manager Store']}
          hasBullet={true}
        />
        <AsideMenuItem
          to='/order/new-order'
          title='Order Baru'
          role={['Sales', 'Store Staff', 'Sales', 'Store CS', 'Admin HO', 'Super User']}
          hasBullet={true}
        />
        <AsideMenuItem
          to='/refund/view-refund'
          title='List Cancel dan Refund'
          role={['Store CS', 'Admin HO', 'Super User']}
          hasBullet={true}
        />
      </AsideMenuItemWithSub>

      {/* Halaman Work Order */}
      <AsideMenuItemWithSub
        to='/work-order'
        title='Work Order'
        icon='/media/icons/duotune/files/fil012.svg'
        fontIcon='bi-person'
        role={['Admin Vendor', 'Owner Vendor', 'Tukang']}
      >
        <AsideMenuItem
          to='/warranty/claim-warranty-list'
          title='Claim Garansi'
          role={['Admin Vendor', 'Owner Vendor', 'Tukang']}
          hasBullet={true}
        />
        <AsideMenuItem
          to='/calendar/view-calendar'
          title='Kalender Order'
          hasBullet={true}
          role={['Admin Vendor', 'Owner Vendor', 'Tukang']}
        />
        <AsideMenuItem
          to='/work-order/view-work-order'
          title='List Work Order'
          role={['Admin Vendor', 'Owner Vendor', 'Tukang']}
          hasBullet={true}
        />
        <AsideMenuItem
          to='/work-order/report-work-order'
          title='Report Work Order'
          hasBullet={true}
          role={['Admin Vendor', 'Owner Vendor']}
        />
      </AsideMenuItemWithSub>

      {/* Halaman Quotation */}
      <AsideMenuItemWithSub
        to='/quotation'
        title='Quotation'
        icon='/media/icons/duotune/finance/fin007.svg'
        fontIcon='bi-person'
        role={['Admin HO', 'Super User', 'Admin Vendor', 'Owner Vendor']}
      >
        <AsideMenuItem
          to='/quotation/new-quotation'
          title='New Quotation'
          role={['Admin Vendor', 'Owner Vendor']}
          hasBullet={true}
        />
        <AsideMenuItem
          to='/quotation/view-quotation'
          title='Quotation List'
          role={['Admin HO', 'Super User', 'Admin Vendor', 'Owner Vendor']}
          hasBullet={true}
        />
        <AsideMenuItem
          to='/quotation/view-request-discount'
          title={
            ['Super User'].includes(userRole)
              ? 'Approval Pengajuan Diskon'
              : 'Daftar Pengajuan Diskon'
          }
          role={['Admin HO', 'Super User']}
          hasBullet={true}
        />
      </AsideMenuItemWithSub>

      {/* Halaman Pengaduan */}
      <AsideMenuItemWithSub
        to='/complaint'
        title='Pengaduan'
        role={['Store CS', 'Admin HO', 'Super User', 'Admin Vendor', 'Owner Vendor', 'Tukang']}
        icon='/media/icons/duotune/files/fil015.svg'
        fontIcon='bi-person'
      >
        <AsideMenuItem
          to='/complaint/report-complaint'
          title='Pengaduan Summary'
          role={['Store CS', 'Admin Vendor', 'Owner Vendor', 'Tukang']}
          hasBullet={true}
        />

        <AsideMenuItem
          to='/warranty/claim-warranty-list'
          title='Claim Garansi'
          role={['Store CS']}
          hasBullet={true}
        />

        <AsideMenuItem
          to='/complaint/view-complaint'
          title='List Pengaduan'
          role={['Store CS', 'Admin HO', 'Super User', 'Admin Vendor', 'Owner Vendor', 'Tukang']}
          hasBullet={true}
        />

        <AsideMenuItem
          to='/complaint/new-complaint'
          title='Request Pengaduan'
          role={['Store CS', 'Admin HO', 'Super User', 'Admin Vendor']}
          hasBullet={true}
        />

        <AsideMenuItem
          to='/reschedule/view-reschedule'
          title='List Reschedule'
          role={['Admin Vendor', 'Owner Vendor']}
          hasBullet={true}
        />

        <AsideMenuItemWithSub
          to='/reschedule'
          title='Reschedule'
          hasBullet={true}
          role={['Store CS', 'Admin HO', 'Super User', 'Tukang']}
        >
          <AsideMenuItem
            to='/reschedule/new-reschedule'
            title='New Reschedule'
            role={['Store CS', 'Admin HO', 'Super User', 'Tukang']}
            hasBullet={true}
          />

          <AsideMenuItem
            to='/reschedule/view-reschedule'
            title='List Reschedule'
            role={['Store CS', 'Admin HO', 'Super User', 'Tukang']}
            hasBullet={true}
          />
        </AsideMenuItemWithSub>
      </AsideMenuItemWithSub>

      {/* Halaman Tukang */}
      <AsideMenuItemWithSub
        to='/tukang'
        title='Tukang'
        icon='/media/icons/duotune/communication/com013.svg'
        fontIcon='bi-person'
        role={['Admin Vendor', 'Owner Vendor']}
      >
        <AsideMenuItem
          to='/tukang/view-tukang'
          title='List Tukang'
          role={['Admin Vendor', 'Owner Vendor']}
          hasBullet={true}
        />
        <AsideMenuItem
          to='/tukang/new-tukang'
          title='New Tukang'
          role={['Admin Vendor', 'Owner Vendor']}
          hasBullet={true}
        />
        <AsideMenuItem
          to='/material/new-material'
          title='Update Pekerjaan Tukang'
          role={['Admin Vendor', 'Owner Vendor']}
          hasBullet={true}
        />
      </AsideMenuItemWithSub>

      {/* Halaman Vendor */}
      <AsideMenuItemWithSub
        to='/vendor'
        title='Vendor'
        icon='/media/icons/duotune/ecommerce/ecm004.svg'
        fontIcon='bi-person'
        role={['Admin HO', 'Super User']}
      >
        <AsideMenuItem
          to='/vendor/report-vendor'
          title='Vendor Summary'
          role={['Admin HO', 'Super User']}
          hasBullet={true}
        />
        <AsideMenuItem
          to='/vendor/view-vendor'
          title='List Vendor'
          role={['Admin HO', 'Super User']}
          hasBullet={true}
        />
        <AsideMenuItem
          to='/vendor/new-vendor'
          title='Register Vendor (Manual)'
          role={['Admin HO', 'Super User']}
          hasBullet={true}
        />
        <AsideMenuItem
          to='/vendor-registration/view'
          title='Pendaftaran Vendor'
          role={['Admin HO', 'Super User']}
          hasBullet={true}
        />
        {isVendorSpEnabled && (
          <AsideMenuItemWithSub
            to='/vendor-sp'
            title='Vendor SP'
            role={['Admin HO', 'Super User']}
            hasBullet={true}
          >
<AsideMenuItem
              to='/vendor-sp/view'
              title='Daftar SP Vendor'
              role={['Admin HO', 'Super User']}
              hasBullet={true}
            />
            <AsideMenuItem
              to='/vendor-sp/violation-type'
              title='Jenis Pelanggaran'
              role={['Admin HO', 'Super User']}
              hasBullet={true}
            />
            <AsideMenuItem
              to='/vendor-sp/violation-log'
              title='Log Pelanggaran'
              role={['Admin HO', 'Super User']}
              hasBullet={true}
            />
            <AsideMenuItem
              to='/vendor-sp/revision-request'
              title='Approval Revisi Poin'
              role={['Super User']}
              hasBullet={true}
            />
            <AsideMenuItem
              to='/vendor-sp/reactivation'
              title='Reaktivasi Vendor SP3'
              role={['Admin HO', 'Super User']}
              hasBullet={true}
            />
          </AsideMenuItemWithSub>
        )}
      </AsideMenuItemWithSub>

      {/* Halaman Customers */}
      <AsideMenuItemWithSub
        to='/costumers'
        title='Customers'
        icon='/media/icons/duotune/communication/com014.svg'
        fontIcon='bi-person'
        role={['Admin HO', 'Super User', 'Store CS']}
      >
        <AsideMenuItem
          to='/costumers/report-costumers'
          title='Report Customers'
          role={['Admin HO', 'Super User']}
          hasBullet={true}
        />
        <AsideMenuItem
          to='/costumers/new-costumers'
          title='Register Customers'
          role={['Store CS']}
          hasBullet={true}
        />
        <AsideMenuItem
          to='/costumers/view-costumers'
          title='View Customers'
          role={['Admin HO', 'Super User', 'Store CS']}
          hasBullet={true}
        />
      </AsideMenuItemWithSub>

      {/* Halaman CSI */}
      <AsideMenuItemWithSub
        to='/csi'
        title='CSI'
        icon='/media/icons/duotune/communication/com007.svg'
        role={['Admin HO', 'Super User']}
      >
        <AsideMenuItem
          to='/csi/new-csi'
          title='Formulir Baru CSI'
          role={['Admin HO', 'Super User']}
          hasBullet={true}
        />

        <AsideMenuItem
          to='/csi/format-pertanyaan-csi'
          title='List Format CSI'
          role={['Admin HO', 'Super User']}
          hasBullet={true}
        />
      </AsideMenuItemWithSub>

      {/* Halaman Insentif Sales ( Payroll ) */}
      <AsideMenuItemWithSub
        to='/incentive-sales'
        title='Insentif Sales'
        icon='/media/icons/duotune/finance/fin004.svg'
        role={['Super User', 'Admin HO', 'Payroll']}
      >
        <AsideMenuItem
          to='/reports/report-insentif'
          title={
            ['Super User', 'Admin HO'].includes(userRole)
              ? 'Laporan Insentif Sales'
              : 'Laporan Insentif'
          }
          role={['Admin HO', 'Super User']}
          hasBullet={true}
        />

        <AsideMenuItem
          to='/incentive-sales/list-request-incentive'
          title='Daftar Pengajuan Insentif'
          role={['Super User', 'Admin HO', 'Payroll']}
          hasBullet={true}
        />

        <AsideMenuItem
          to='/incentive-sales/request-incentive'
          title='Pengajuan Insentif'
          role={['Super User', 'Admin HO']}
          hasBullet={true}
        />
      </AsideMenuItemWithSub>
      {/* Halaman Insentif Manager ( Payroll ) */}
      <AsideMenuItemWithSub
        to='/incentive-manager'
        title='Insentif Store Manager'
        icon='/media/icons/duotune/finance/fin004.svg'
        role={['Super User', 'Admin HO', 'Payroll']}
      >
        {/* <AsideMenuItem
          to='/reports/report-insentif-manager'
          title={
            ['Super User', 'Admin HO'].includes(userRole)
              ? 'Laporan Insentif Store Manager'
              : 'Laporan Insentif'
          }
          role={['Admin HO', 'Super User']}
          hasBullet={true}
        /> */}

        <AsideMenuItem
          to='/incentive-manager/list-request-incentive-manager'
          title='Daftar Pengajuan Insentif Store Manager'
          role={['Super User', 'Admin HO', 'Payroll']}
          hasBullet={true}
        />

        <AsideMenuItem
          to='/incentive-manager/request-incentive-manager'
          title='Pengajuan Insentif'
          role={['Super User', 'Admin HO']}
          hasBullet={true}
        />
      </AsideMenuItemWithSub>

      {/* Halaman Invoice */}
      <AsideMenuItemWithSub
        to='/invoice'
        title='Invoice'
        icon='/media/icons/duotune/finance/fin004.svg'
        fontIcon='bi-person'
        role={['Admin HO', 'Super User', 'Admin Vendor', 'Owner Vendor', 'Finance']}
      >
        <AsideMenuItem
          to='/invoice/view-invoice'
          title='List Invoice'
          role={['Admin HO', 'Super User', 'Admin Vendor', 'Owner Vendor', 'Finance']}
          hasBullet={true}
        />
        <AsideMenuItem
          to='/invoice/new-invoice'
          title='New Invoice'
          role={['Admin Vendor', 'Owner Vendor']}
          hasBullet={true}
        />
      </AsideMenuItemWithSub>
      {/* Halaman Chat Admin WA */}
      <AsideMenuItemWithSub
        to='/chat'
        title='Chat'
        icon='/media/icons/duotune/communication/com003.svg'
        fontIcon='bi-app-indicator'
        role={['Admin WA', 'Admin WA2']}
      >
        <AsideMenuItem
          to='/chat/view-chat'
          title='Agent Chat'
          role={['Admin WA', 'Admin WA2']}
          hasBullet={true}
        />
        <AsideMenuItem
          to='/chat/peringatan-service'
          title='Broadcast Message '
          role={['Admin WA', 'Admin WA2']}
          hasBullet={true}
        />
      </AsideMenuItemWithSub>
      {/* Halaman Reports */}
      <AsideMenuItemWithSub
        to='/reports'
        title={
          userRole === 'Store CS' ||
          userRole === 'Store Staff' ||
          userRole === 'Sales' ||
          userRole === 'Manager Store'
            ? 'Laporan'
            : 'Report'
        }
        role={[
          'Store CS',
          'Store Staff',
          'Sales',
          'Admin HO',
          'Super User',
          'Admin Vendor',
          'Owner Vendor',
          'Tukang',
          'Admin WA',
          'Admin WA2',
          'Manager Store',
        ]}
        icon='/media/icons/duotune/graphs/gra001.svg'
        fontIcon='bi-person'
      >
        <AsideMenuItem
          to='/reports/report-insentif'
          title='Insentif'
          role={['Store CS', 'Store Staff', 'Sales', 'Manager Store']}
          hasBullet={true}
        />
        <AsideMenuItem
          to='/reports/view-report'
          title={userRole === 'StoreCS' ? 'List Laporan' : 'Performance'}
          role={['Store CS', 'Admin HO', 'Super User', 'Admin Vendor', 'Owner Vendor', 'Tukang']}
          hasBullet={true}
        />
        <AsideMenuItem
          to='/reports/log-chat'
          title='Log chat'
          role={['Admin WA', 'Admin WA2']}
          hasBullet={true}
        />
        {/* <AsideMenuItem
          to='/reports/log-notif-quotation'
          title='Log chat notif quotation'
          role={['Admin WA', 'Admin WA2']}
          hasBullet={true}
        /> */}

        {/* <AsideMenuItem
          to='/reports/log-status-chat'
          title='Log chat notif status'
          role={['Admin WA', 'Admin WA2']}
          hasBullet={true}
        /> */}
      </AsideMenuItemWithSub>

      {/* Halaman Payment */}
      {/* <AsideMenuItemWithSub
        to='/payment'
        title='Payment'
        icon='/media/icons/duotune/communication/com006.svg'
        fontIcon='bi-person'
        role={['Admin HO', 'Super User']}
      >
        <AsideMenuItem
          to='/payment/view-payment'
          title='List Payment'
          role={['Admin HO', 'Super User']}
          hasBullet={true}
        />

         <AsideMenuItem
          to='/payment/new-payment'
          title='New Payment'
          role={['Admin HO', 'Super User']}
          hasBullet={true}
        /> 

        <AsideMenuItem
          to='/payment/detail-payment'
          title='Detail Payment'
          role={['Admin HO', 'Super User']}
          hasBullet={true}
        />
      </AsideMenuItemWithSub> */}

      {/* Halaman Refund */}
      {/* <AsideMenuItemWithSub
        to='/refund'
        title='Cancel dan Refund'
        icon='/media/icons/duotune/communication/com006.svg'
        fontIcon='bi-person'
        role={['Store CS', 'Admin HO', 'Super User']}
      >
        <AsideMenuItem
          to='/refund/view-refund'
          title='View Cancel dan Refund'
          role={['Store CS', 'Admin HO', 'Super User']}
          hasBullet={true}
        />
      </AsideMenuItemWithSub> */}

      {/* Halaman Setting */}
      <AsideMenuItemWithSub
        to='/setting'
        icon='/media/icons/duotune/coding/cod009.svg'
        title={userRole === 'Store CS' ? 'Pengaturan' : 'Setting'}
        fontIcon='bi-app-indicator'
        role={[
          'Store CS',
          'Admin HO',
          'Super User',
          'Admin Vendor',
          'Owner Vendor',
          'Tukang',
          'Admin WA',
        ]}
      >
        <AsideMenuItemWithSub
          to='/bank'
          title='Bank'
          hasBullet={true}
          role={['Admin HO', 'Super User']}
        >
          <AsideMenuItem
            to='/bank/view-bank'
            title='Daftar Bank'
            role={['Admin HO', 'Super User']}
            hasBullet={true}
          />
        </AsideMenuItemWithSub>

        <AsideMenuItemWithSub
          to='/email'
          title='Format Email'
          hasBullet={true}
          role={['Admin HO', 'Super User']}
        >
          <AsideMenuItem
            to='/email/format-email'
            title='Format Email'
            role={['Admin HO', 'Super User']}
            hasBullet={true}
          />

          <AsideMenuItem
            to='/email/view-format-email'
            title='Daftar Format Email'
            role={['Admin HO', 'Super User']}
            hasBullet={true}
          />
        </AsideMenuItemWithSub>

        {/* Setting: Syarat & Ketentuan pendaftaran vendor (Rekrut Vendor) */}
        <AsideMenuItemWithSub
          to='/vendor-registration/terms-setting'
          title='Syarat & Ketentuan'
          hasBullet={true}
          role={['Admin HO', 'Super User']}
        >
          <AsideMenuItem
            to='/vendor-registration/terms-setting/view'
            title='Daftar Versi T&C'
            role={['Admin HO', 'Super User']}
            hasBullet={true}
          />

          <AsideMenuItem
            to='/vendor-registration/terms-setting/edit/new'
            title='Formulir Edit T&C'
            role={['Admin HO', 'Super User']}
            hasBullet={true}
          />
        </AsideMenuItemWithSub>


        <AsideMenuItemWithSub
          to='/incentive-sales'
          title='Insentif Sales'
          hasBullet={true}
          role={['Admin HO', 'Super User']}
        >
          <AsideMenuItem
            to='/incentive-sales/create-incentive'
            title='Formulir Insentif Sales'
            role={['Admin HO', 'Super User']}
            hasBullet={true}
          />

          <AsideMenuItem
            to='/incentive-sales/view-incentive'
            title='Daftar Insentif Sales'
            role={['Admin HO', 'Super User']}
            hasBullet={true}
          />
        </AsideMenuItemWithSub>
        <AsideMenuItemWithSub
          to='/incentive-manager'
          title='Insentif Store Manager'
          hasBullet={true}
          role={['Admin HO', 'Super User']}
        >
          <AsideMenuItem
            to='/incentive-manager/create-incentive'
            title='Formulir Insentif Store Manager'
            role={['Admin HO', 'Super User']}
            hasBullet={true}
          />

          <AsideMenuItem
            to='/incentive-manager/view-incentive'
            title='Daftar Insentif Store Manager'
            role={['Admin HO', 'Super User']}
            hasBullet={true}
          />
        </AsideMenuItemWithSub>

        {/* <AsideMenuItem
          to='/employee/new-employee'
          title='Register Staff'
          role={['Store CS']}
          hasBullet={true}
        /> */}

        <AsideMenuItemWithSub
          to='/promotion-quotation'
          title='Promosi Quotation'
          hasBullet={true}
          role={['Admin HO', 'Super User']}
        >
          <AsideMenuItem
            to='/promotion-quotation/create-promotion'
            title='Formulir Promosi'
            role={['Admin HO', 'Super User']}
            hasBullet={true}
          />

          <AsideMenuItem
            to='/promotion-quotation/view-promotion'
            title='Daftar Promosi Quotation'
            role={['Admin HO', 'Super User']}
            hasBullet={true}
          />
        </AsideMenuItemWithSub>

        <AsideMenuItem
          to='/sales/new-sales'
          title='Register Sales'
          role={['Store CS']}
          hasBullet={true}
        />
        <AsideMenuItem
          to='/manager/new-manager'
          title='Register Manager'
          role={['Store CS']}
          hasBullet={true}
        />
        {/* wa chat */}
        <AsideMenuItem
          to='/notif-setting/view-setting'
          title='Pengaturan WA'
          role={['Admin WA', 'Admin WA2']}
          hasBullet={true}
        />
        {/* <AsideMenuItemWithSub
          to='/notif-setting'
          title='Notif Setting'
          hasBullet={true}
          role={['Admin WA', 'Admin WA2']}
        >
          <AsideMenuItem
            to='/notif-setting/view-setting'
            title='View Notif Setting'
            role={['Admin WA', 'Admin WA2']}
            hasBullet={true}
          />
        </AsideMenuItemWithSub> */}

        {/* </AsideMenuItemWithSub> */}
        <AsideMenuItem
          to={`/profile/update-profile/${userVendor !== null ? userVendor : userTukang}`}
          title={userRole === 'Owner Vendor' ? 'Profile Vendor' : 'Profile Tukang'}
          role={['Owner Vendor', 'Tukang']}
          hasBullet={true}
        />

        <AsideMenuItemWithSub
          to='/item'
          title='Item'
          hasBullet={true}
          role={['Admin HO', 'Super User']}
        >
          <AsideMenuItem
            to='/item/view-item?type=item_promotion'
            title='List Item Promosi'
            role={['Admin HO', 'Super User']}
            hasBullet={true}
          />

          <AsideMenuItem
            to='/item/view-item?type=item_survei'
            title='List Item Survei'
            role={['Admin HO', 'Super User']}
            hasBullet={true}
          />

          <AsideMenuItem
            to='/item/new-item'
            title='Tambah Item'
            role={['Admin HO', 'Super User']}
            hasBullet={true}
          />
        </AsideMenuItemWithSub>

        <AsideMenuItemWithSub
          to='/sales'
          title='Sales'
          role={['Admin HO', 'Super User']}
          hasBullet={true}
        >
          <AsideMenuItem
            to='/sales/new-sales'
            title='Register Sales'
            role={['Admin HO', 'Super User']}
            hasBullet={true}
          />
        </AsideMenuItemWithSub>

        <AsideMenuItemWithSub
          to='/manager'
          title='Manager'
          role={['Admin HO', 'Super User']}
          hasBullet={true}
        >
          <AsideMenuItem
            to='/manager/new-manager'
            title='Register Manager'
            role={['Admin HO', 'Super User']}
            hasBullet={true}
          />
        </AsideMenuItemWithSub>

        <AsideMenuItemWithSub
          to='/store'
          title='Store'
          hasBullet={true}
          role={['Admin HO', 'Super User']}
        >
          <AsideMenuItem
            to='/store/view-store'
            title='Daftar Store'
            role={['Admin HO', 'Super User']}
            hasBullet={true}
          />
          <AsideMenuItem
            to='/store/new-store'
            title='Register Store'
            role={['Admin HO', 'Super User']}
            hasBullet={true}
          />
        </AsideMenuItemWithSub>
        <AsideMenuItemWithSub
          to='/data-master'
          title='Data Master'
          hasBullet={true}
          role={['Admin HO', 'Super User']}
        >
          <AsideMenuItem
            to='/data-master/view-data-master'
            title='Daftar Data Master'
            role={['Admin HO', 'Super User']}
            hasBullet={true}
          />
        </AsideMenuItemWithSub>
        <AsideMenuItemWithSub
          to='/data-role'
          title='Data Role'
          hasBullet={true}
          role={['Admin HO', 'Super User']}
        >
          <AsideMenuItem
            to='/data-role/view-data-role'
            title='Daftar Role'
            role={['Admin HO', 'Super User']}
            hasBullet={true}
          />
        </AsideMenuItemWithSub>

        <AsideMenuItemWithSub
          to='/user'
          title={userRole === 'Super User' ? 'User Management' : 'Admin Management'}
          hasBullet={true}
          role={['Super User', 'Owner Vendor']}
        >
          <AsideMenuItem
            to='/user/new-user'
            title={
              userRole === 'Super User' ? 'Formulir Registrasi User' : 'Formulir Registrasi Admin'
            }
            role={['Super User', 'Owner Vendor']}
            hasBullet={true}
          />

          <AsideMenuItem
            to='/user/view-user'
            title={userRole === 'Super User' ? 'Daftar User' : 'Daftar Admin'}
            role={['Super User', 'Owner Vendor']}
            hasBullet={true}
          />
        </AsideMenuItemWithSub>
      </AsideMenuItemWithSub>

      {/* Halaman Livechat */}
      {/* <AsideMenuItemWithSub
        title='Chat'
        to='/apps/chat'
        icon='/media/icons/duotune/communication/com012.svg'
        fontIcon='bi-person'
        role={['Store CS', 'Admin HO', 'Super User']}
      >
        <AsideMenuItem
          to='/apps/chat/private-chat'
          title='Private Chat'
          role={['Store CS', 'Admin HO', 'Super User']}
          hasBullet={true}
        />
      </AsideMenuItemWithSub> */}
      {/* Logout */}
      <div className='menu-item'>
        <a className='menu-link' onClick={manualBookHandle}>
          <span className='menu-icon'>
            <KTSVG path='media/icons/duotune/communication/com007.svg' className='svg-icon-2' />
          </span>
          <span className='menu-title'>Manual Book</span>
        </a>
      </div>
      {/* Logout */}
      <div className='menu-item'>
        <a className='menu-link' onClick={logoutHandler}>
          <span className='menu-icon'>
            <KTSVG path='/media/icons/duotune/arrows/arr092.svg' className='svg-icon-2' />
          </span>
          <span className='menu-title'>Logout</span>
        </a>
      </div>
    </>
  )
}
