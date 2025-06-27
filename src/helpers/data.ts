import { dataTableRecords } from '@/assets/data/other'
import { emailsData } from '@/assets/data/social'
import { EmailType, Employee } from '@/types/data'
import { sleep } from '@/utils/promise'

export const getAllDataTableRecords = async (): Promise<Employee[]> => {
  await sleep()
  return dataTableRecords
}

export const getAllEmails = async (): Promise<EmailType[]> => {
  await sleep()
  return emailsData
}
