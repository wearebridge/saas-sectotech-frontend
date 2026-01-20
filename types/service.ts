export interface ServiceType {
  id: string
  name: string
  description?: string
  status: boolean
  serviceSubTypeId: string
  serviceSubTypeName: string
}

export interface ServiceSubType {
  id: string
  name: string
  description?: string
  status: boolean
}

export interface Script {
  id: string
  name: string
  status: boolean
  scriptItems?: { id: string; question: string }[]
  serviceTypeId?: string
  serviceTypeName?: string
  serviceSubTypeId?: string
  serviceSubTypeName?: string
}
