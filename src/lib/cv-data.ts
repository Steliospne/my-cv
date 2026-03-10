import type { CvSection } from '@/lib/cv-types'

export type CvImportPayload = {
  fullName: string
  headline: string
  email: string
  phone: string
  location: string
  summary: string
  sections: Array<{
    title: string
    kind: CvSection['kind']
    items: Array<{
      title: string
      subtitle: string
      period: string
      details: string
    }>
  }>
}
