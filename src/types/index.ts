export type InsuranceProvider = 'Cigna' | 'Aetna' | 'Blue Cross' | 'UnitedHealth' | 'Other'

export interface PatientInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  state: string
  insurance: InsuranceProvider
  medicalBill: File
}

