export const formatDateTime = (date: any) => {
  const d = date instanceof Date ? date : new Date(date)
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const year = d.getFullYear()
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  const seconds = d.getSeconds().toString().padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

export const stringToHash = (string: string) => {
  let hash = 0
  if (!string || string.length === 0) return hash

  for (let i = 0; i < string.length; i++) {
    const char = string.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }

  return hash
}

export async function urlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url)
    const blob = await response.blob()

    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (err) {
    console.warn('⚠️ Failed convert to Base64 (CORS maybe):', err)
    return ''
  }
}

export const getStatusNameByCategory = (category: string) => {
  switch (category) {
    case 'SURVEYREQ':
      return 'SURVEYSTART'
    case 'TUKANGSURVEY':
      return 'SURVEYSTART'
    case 'SURVEYSTART':
      return 'SURVEYDONE'
    case 'SURVEYDONE':
      return 'SURVEYDONE'
    case 'RESURVEYREQ':
      return 'RETUKANGSURVEY'
    case 'RETUKANGSURVEY':
      return 'RESURVEYSTART'
    case 'RESURVEYSTART':
      return 'RESURVEYDONE'
    case 'RESURVEYDONE':
      return 'RESURVEYDONE'
    case 'WORKREQ':
      return 'WORKSTART'
    case 'TUKANGWORK':
      return 'WORKSTART'
    case 'WORKSTART':
      return 'WORKEND'
    case 'REWORKREQ':
      return 'RETUKANGWORK'
    case 'RETUKANGWORK':
      return 'REWORKSTART'
    case 'REWORKSTART':
      return 'REWORKEND'
    case 'REWORKEND':
      return 'REWORKEND'
    case 'TUKANGWORKSTEPONE':
      return 'WORKSTARTSTEPONE'
    case 'WORKSTARTSTEPONE':
      return 'WORKENDSTEPONE'
    case 'TUKANGWORKSTEPTWO':
      return 'WORKSTARTSTEPTWO'
    case 'WORKSTARTSTEPTWO':
      return 'WORKENDSTEPTWO'
    case 'TUKANGWORKSTEPTHREE':
      return 'WORKSTARTSTEPTHREE'
    case 'WORKSTARTSTEPTHREE':
      return 'WORKENDSTEPTHREE'
    default:
      return null
  }
}
