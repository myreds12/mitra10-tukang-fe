import {getCurrentUser, fetchOrderByIdApi, createGroupApi} from './chatService'

export interface StartChatParams {
  type: string
  datas: any
  orderId: string
  userRole: string
  vendorName: string
  vendorId: string
  storeName: string
  storeId: string
  apiUrl?: string
  apiChat?: string
}

export interface StartChatResult {
  success: boolean
  groupId?: string
  receiver?: any[]
  message?: string
  invalidOrder?: boolean
  error?: any
}

export const executeStartChat = async (params: StartChatParams): Promise<StartChatResult> => {
  const {
    type,
    datas,
    orderId,
    userRole,
    vendorName,
    vendorId,
    storeName,
    storeId,
    apiUrl = '',
    apiChat = '',
  } = params

  try {
    let payload: any = {}
    const currentUser = getCurrentUser(userRole, vendorName, storeName)

    if (
      (userRole === 'Admin HO' || userRole === 'Super User') &&
      (type === 'store' || type === 'vendor' || type === 'id')
    ) {
      payload = {
        role_admin: 'Admin HO',
        role: userRole === 'Super User' ? 'Admin HO' : userRole,
        option: type,
      }

      if (type === 'vendor') {
        payload.vendor = {
          name: datas.company_name,
          id: datas.id,
        }
      } else if (type === 'store') {
        payload.store = {
          name: datas.store_name,
          id: datas.id,
        }
      }

      if (type === 'id') {
        payload.orderId = orderId
        const res = await fetchOrderByIdApi(apiUrl, orderId)
        if (res.status === 200) {
          payload.store = {
            name: res.data?.data?.store?.store_name,
            id: res.data?.data?.store_id,
          }
          payload.vendor = {
            name: res.data?.data?.vendor?.company_name,
            id: res.data?.data?.vendor_id,
          }
        }
      }

      const res = await createGroupApi(apiChat, payload)
      if (res.data.success) {
        const dataReceiver = res.data.group.members.filter((member: any) => member !== currentUser)
        return {
          success: true,
          groupId: res.data.groupId,
          receiver: dataReceiver,
          message: 'Anda telah bergabung ke grup.',
        }
      }
      return {success: false}
    } else if (userRole === 'Store CS' && (type === 'ho' || type === 'vendor' || type === 'id')) {
      payload = {
        role_admin: 'Admin HO',
        role: userRole,
        option: type,
        store: storeName,
      }

      if (type === 'vendor') {
        payload.vendor = {
          name: datas.company_name,
          id: datas.id,
        }
      }

      if (type === 'id') {
        payload.orderId = orderId
        const res = await fetchOrderByIdApi(apiUrl, orderId)
        if (res.status === 200) {
          if (parseInt(storeId) === res.data?.data?.store_id) {
            payload.vendor = {
              name: res.data?.data?.vendor?.company_name,
              id: res.data?.data?.vendor_id,
            }
          } else {
            return {success: false, invalidOrder: true}
          }
        }
      }

      const res = await createGroupApi(apiChat, payload)
      if (res.data.success) {
        const dataReceiver = res.data.group.members.filter((member: any) => member !== currentUser)
        return {
          success: true,
          groupId: res.data.groupId,
          receiver: dataReceiver,
          message: 'Anda telah bergabung ke grup.',
        }
      }
      return {success: false}
    } else if (userRole === 'Owner Vendor' && (type === 'ho' || type === 'store' || type === 'id')) {
      payload = {
        role_admin: 'Admin HO',
        role: userRole,
        option: type,
        vendor: vendorName,
      }

      if (type === 'store') {
        payload.store = {
          name: datas.store_name,
          id: datas.id,
        }
      }

      if (type === 'id') {
        payload.orderId = orderId
        const res = await fetchOrderByIdApi(apiUrl, orderId)
        if (res.status === 200) {
          if (parseInt(vendorId) === res.data?.data?.vendor_id) {
            payload.store = {
              name: res.data?.data?.store?.store_name,
              id: res.data?.data?.store_id,
            }
          } else {
            return {success: false, invalidOrder: true}
          }
        }
      }

      const res = await createGroupApi(apiChat, payload)
      if (res.data.success) {
        const dataReceiver = res.data.group.members.filter((member: any) => member !== currentUser)
        return {
          success: true,
          groupId: res.data.groupId,
          receiver: dataReceiver,
          message: res.data.message || 'Anda telah bergabung ke grup baru.',
        }
      }
      return {success: false}
    }

    return {success: false}
  } catch (err) {
    return {success: false, error: err}
  }
}
