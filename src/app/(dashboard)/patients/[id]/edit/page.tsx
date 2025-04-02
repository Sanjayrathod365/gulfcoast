'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'

interface Doctor {
  id: string
  name: string
  prefix: string
  email: string
}

interface Payer {
  id: string
  name: string
  isActive: boolean
}

interface Status {
  id: string
  name: string
  color: string
}

interface Facility {
  id: string
  name: string
}

interface Physician {
  id: string
  prefix: string
  name: string
  suffix: string | null
}

interface Exam {
  id: string
  name: string
  description: string | null
  isActive: boolean
}

interface Procedure {
  id?: string
  examId: string
  scheduleDate: string
  scheduleTime: string
  facilityId: string
  physicianId: string
  statusId: string
  lop: string
  isCompleted: boolean
}

interface Attorney {
  id: string
  user: {
    name: string
    email: string
  }
  phone: string | null
  faxNumber: string | null
  address: string | null
  city: string | null
  state: string | null
  zipcode: string | null
  notes: string | null
}

interface Patient {
  id: string
  firstName: string
  middleName: string
  lastName: string
  dateOfBirth: string
  phone: string
  altNumber: string
  email: string
  doidol: string
  gender: string
  address: string
  city: string
  zip: string
  statusId: string
  payerId: string
  lawyer: string
  attorneyId: string
  orderDate: string
  orderFor: string
  referringDoctorId: string | null
  procedures: Procedure[]
}

export default function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    altNumber: '',
    email: '',
    doidol: '',
    gender: 'unknown',
    address: '',
    city: '',
    zip: '',
    statusId: '',
    payerId: '',
    lawyer: '',
    attorneyId: '',
    orderDate: '',
    orderFor: '',
    referringDoctorId: '',
    procedures: [] as Procedure[]
  })
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [payers, setPayers] = useState<Payer[]>([])
  const [statuses, setStatuses] = useState<Status[]>([])
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [physicians, setPhysicians] = useState<Physician[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [attorneys, setAttorneys] = useState<Attorney[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [patientData, setPatientData] = useState<any>(null)

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '')
    // Format as (XXX) XXX-XXXX
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${month}/${day}/${year}`
  }

  const parseDate = (dateString: string) => {
    if (!dateString) return null
    
    try {
      const [month, day, year] = dateString.split('/')
      const monthNum = parseInt(month)
      const dayNum = parseInt(day)
      const yearNum = parseInt(year)

      // Validate date components
      if (isNaN(monthNum) || isNaN(dayNum) || isNaN(yearNum)) {
        return null
      }

      // Validate ranges
      if (monthNum < 1 || monthNum > 12) return null
      if (dayNum < 1 || dayNum > 31) return null
      if (yearNum < 1900 || yearNum > 2100) return null

      const date = new Date(yearNum, monthNum - 1, dayNum)
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return null
      }

      return date.toISOString()
    } catch (error) {
      console.error('Error parsing date:', error)
      return null
    }
  }

  useEffect(() => {
    fetchPatient()
    fetchDoctors()
    fetchPayers()
    fetchStatuses()
    fetchFacilities()
    fetchPhysicians()
    fetchExams()
    fetchAttorneys()
  }, [resolvedParams.id])

  useEffect(() => {
    if (patientData && exams.length > 0) {
      // Update procedures with correct exam IDs
      const updatedProcedures = formData.procedures.map(proc => {
        const exam = exams.find(e => e.name === proc.examId)
        return {
          ...proc,
          examId: exam?.id || proc.examId
        }
      })

      setFormData(prev => ({
        ...prev,
        procedures: updatedProcedures
      }))
    }
  }, [patientData, exams])

  const fetchAttorneys = async () => {
    try {
      const response = await fetch('/api/attorneys')
      if (!response.ok) {
        throw new Error('Failed to fetch attorneys')
      }
      const data = await response.json()
      setAttorneys(data || [])
    } catch (err) {
      console.error('Error fetching attorneys:', err)
      setError('Failed to load attorneys')
    }
  }

  const fetchPayers = async () => {
    try {
      const response = await fetch('/api/payers')
      if (!response.ok) {
        throw new Error('Failed to fetch payers')
      }
      const data = await response.json()
      setPayers(data || [])
    } catch (err) {
      console.error('Error fetching payers:', err)
      setError('Failed to load payers')
    }
  }

  const fetchDoctors = async () => {
    try {
      console.log('Fetching doctors...')
      const response = await fetch('/api/doctors')
      if (!response.ok) {
        throw new Error('Failed to fetch doctors')
      }
      const result = await response.json()
      console.log('Fetched doctors:', result)
      if (result.data) {
        setDoctors(result.data)
      } else {
        setDoctors([])
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
      setError('Failed to load doctors')
      setDoctors([])
    }
  }

  const fetchStatuses = async () => {
    try {
      const response = await fetch('/api/statuses')
      if (!response.ok) {
        throw new Error('Failed to fetch statuses')
      }
      const data = await response.json()
      setStatuses(data)
    } catch (err) {
      console.error('Error fetching statuses:', err)
      setError('Failed to load statuses')
    }
  }

  const fetchFacilities = async () => {
    try {
      const response = await fetch('/api/facilities')
      if (!response.ok) {
        throw new Error('Failed to fetch facilities')
      }
      const data = await response.json()
      setFacilities(data)
    } catch (err) {
      console.error('Error fetching facilities:', err)
      setError('Failed to load facilities')
    }
  }

  const fetchPhysicians = async () => {
    try {
      const response = await fetch('/api/physicians')
      if (!response.ok) {
        throw new Error('Failed to fetch physicians')
      }
      const data = await response.json()
      setPhysicians(data)
    } catch (err) {
      console.error('Error fetching physicians:', err)
      setError('Failed to load physicians')
    }
  }

  const fetchExams = async () => {
    try {
      const response = await fetch('/api/exams')
      if (!response.ok) {
        throw new Error('Failed to fetch exams')
      }
      const data = await response.json()
      setExams(data)
    } catch (err) {
      console.error('Error fetching exams:', err)
      setError('Failed to load exams')
    }
  }

  const fetchPatient = async () => {
    try {
      const response = await fetch(`/api/patients/${resolvedParams.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch patient')
      }
      const data = await response.json()
      setPatientData(data)
      
      // Format procedures
      const formattedProcedures = data.procedures?.map((proc: any) => ({
        id: proc.id,
        examId: proc.exam.id,
        scheduleDate: formatDate(proc.scheduleDate),
        scheduleTime: proc.scheduleTime || '',
        facilityId: proc.facilityId,
        physicianId: proc.physicianId,
        statusId: proc.statusId,
        lop: proc.lop || '',
        isCompleted: proc.isCompleted || false
      })) || []

      setFormData({
        firstName: data.firstName || '',
        middleName: data.middleName || '',
        lastName: data.lastName || '',
        dateOfBirth: formatDate(data.dateOfBirth),
        phone: data.phone || '',
        altNumber: data.altNumber || '',
        email: data.email || '',
        doidol: formatDate(data.doidol),
        gender: data.gender || 'unknown',
        address: data.address || '',
        city: data.city || '',
        zip: data.zip || '',
        statusId: data.statusId || '',
        payerId: data.payer?.id || '',
        lawyer: data.lawyer || '',
        attorneyId: data.attorney?.id || '',
        orderDate: formatDate(data.orderDate),
        orderFor: data.orderFor || '',
        referringDoctorId: data.referringDoctor?.id || '',
        procedures: formattedProcedures
      })
    } catch (error) {
      console.error('Error fetching patient:', error)
      setError('Failed to load patient')
    } finally {
      setLoading(false)
    }
  }

  const addProcedure = () => {
    setFormData(prev => ({
      ...prev,
      procedures: [
        ...prev.procedures,
        {
          examId: '',
          scheduleDate: '',
          scheduleTime: '',
          facilityId: '',
          physicianId: '',
          statusId: '',
          lop: '',
          isCompleted: false
        }
      ]
    }))
  }

  const removeProcedure = (index: number) => {
    setFormData(prev => ({
      ...prev,
      procedures: prev.procedures.filter((_, i) => i !== index)
    }))
  }

  const updateProcedure = (index: number, field: keyof Procedure, value: any) => {
    setFormData(prev => ({
      ...prev,
      procedures: prev.procedures.map((proc, i) => 
        i === index ? { ...proc, [field]: value } : proc
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return

    // Validate required fields
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.payerId || !formData.statusId) {
      setError('First name, last name, payer, and status are required')
      return
    }

    // Validate procedures
    for (const proc of formData.procedures) {
      if (!proc.examId || !proc.scheduleDate || !proc.scheduleTime || !proc.facilityId || !proc.physicianId || !proc.statusId) {
        setError('All procedure fields are required')
        return
      }
    }

    try {
      setError('') // Clear any previous errors
      setLoading(true) // Set loading state

      // Parse dates before sending to API
      const parsedDateOfBirth = formData.dateOfBirth ? parseDate(formData.dateOfBirth) : null
      const parsedDoidol = formData.doidol ? parseDate(formData.doidol) : null
      const parsedOrderDate = formData.orderDate ? parseDate(formData.orderDate) : null

      // Validate required date
      if (!parsedDateOfBirth) {
        setError('Invalid date of birth format. Please use MM/DD/YYYY')
        return
      }

      const submissionData = {
        ...formData,
        dateOfBirth: parsedDateOfBirth,
        doidol: parsedDoidol,
        orderDate: parsedOrderDate,
        procedures: formData.procedures.map(proc => ({
          ...proc,
          scheduleDate: parseDate(proc.scheduleDate)
        }))
      }

      const response = await fetch(`/api/patients/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      })

      if (!response.ok) {
        throw new Error('Failed to update patient')
      }

      router.push('/patients')
    } catch (err) {
      console.error('Error updating patient:', err)
      setError('Failed to update patient')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    let formattedValue = value

    // Format phone numbers
    if (name === 'phone' || name === 'altNumber') {
      formattedValue = formatPhoneNumber(value)
    }

    // Format dates
    if (name === 'dateOfBirth' || name === 'doidol' || name === 'orderDate') {
      // Remove any non-numeric characters
      const numbers = value.replace(/\D/g, '').slice(0, 8)
      
      // Format as MM/DD/YYYY
      if (numbers.length <= 2) {
        formattedValue = numbers
      } else if (numbers.length <= 4) {
        const month = numbers.slice(0, 2)
        // Validate month (01-12)
        if (parseInt(month) > 12) {
          formattedValue = '12/' + numbers.slice(2)
        } else {
          formattedValue = `${month}/${numbers.slice(2)}`
        }
      } else {
        const month = numbers.slice(0, 2)
        const day = numbers.slice(2, 4)
        const year = numbers.slice(4, 8)
        
        // Validate month (01-12)
        if (parseInt(month) > 12) {
          formattedValue = '12'
        } else {
          formattedValue = month
        }
        
        // Validate day (01-31)
        if (parseInt(day) > 31) {
          formattedValue += '/31'
        } else {
          formattedValue += `/${day}`
        }
        
        // Add year if exists
        if (year) {
          formattedValue += `/${year}`
        }
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        </div>
      </div>
    )
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            Patient not found
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Edit Patient</h1>
              <button
                type="button"
                onClick={() => router.push('/patients')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to Patients
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200">
              <div className="space-y-8 divide-y divide-gray-200">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Patient Information
                  </h3>
                  
                  <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-2">
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        id="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="middleName" className="block text-sm font-medium text-gray-700">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        name="middleName"
                        id="middleName"
                        value={formData.middleName}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        id="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                        Date of Birth *
                      </label>
                      <input
                        type="text"
                        name="dateOfBirth"
                        id="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        placeholder="MM/DD/YYYY"
                        pattern="\d{2}/\d{2}/\d{4}"
                        maxLength={10}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="altNumber" className="block text-sm font-medium text-gray-700">
                        Alternate Phone
                      </label>
                      <input
                        type="tel"
                        name="altNumber"
                        id="altNumber"
                        value={formData.altNumber}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="doidol" className="block text-sm font-medium text-gray-700">
                        DOIDOL
                      </label>
                      <input
                        type="text"
                        name="doidol"
                        id="doidol"
                        value={formData.doidol}
                        onChange={handleChange}
                        placeholder="MM/DD/YYYY"
                        pattern="\d{2}/\d{2}/\d{4}"
                        maxLength={10}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                        Gender *
                      </label>
                      <select
                        name="gender"
                        id="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                      >
                        <option value="unknown">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                        Address *
                      </label>
                      <input
                        type="text"
                        name="address"
                        id="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        id="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="zip" className="block text-sm font-medium text-gray-700">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        name="zip"
                        id="zip"
                        value={formData.zip}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="statusId" className="block text-sm font-medium text-gray-700">
                        Status *
                      </label>
                      <select
                        name="statusId"
                        id="statusId"
                        value={formData.statusId}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                      >
                        <option value="">Select Status</option>
                        {statuses.map((status) => (
                          <option key={status.id} value={status.id}>
                            {status.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="payerId" className="block text-sm font-medium text-gray-700">
                        Payer *
                      </label>
                      <select
                        name="payerId"
                        id="payerId"
                        value={formData.payerId}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                      >
                        <option value="">Select Payer</option>
                        {payers.map((payer) => (
                          <option key={payer.id} value={payer.id}>
                            {payer.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="attorneyId" className="block text-sm font-medium text-gray-700">
                        Lawyer
                      </label>
                      <select
                        name="attorneyId"
                        id="attorneyId"
                        value={formData.attorneyId || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="">Select Lawyer</option>
                        {attorneys.map((attorney) => (
                          <option key={attorney.id} value={attorney.id}>
                            {attorney.user.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="orderDate" className="block text-sm font-medium text-gray-700">
                        Order Date
                      </label>
                      <input
                        type="text"
                        name="orderDate"
                        id="orderDate"
                        value={formData.orderDate}
                        onChange={handleChange}
                        placeholder="MM/DD/YYYY"
                        pattern="\d{2}/\d{2}/\d{4}"
                        maxLength={10}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="orderFor" className="block text-sm font-medium text-gray-700">
                        Order For
                      </label>
                      <input
                        type="text"
                        name="orderFor"
                        id="orderFor"
                        value={formData.orderFor}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="referringDoctorId" className="block text-sm font-medium text-gray-700">
                        Referring Doctor
                      </label>
                      <select
                        name="referringDoctorId"
                        id="referringDoctorId"
                        value={formData.referringDoctorId || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="">Select Doctor</option>
                        {doctors.map((doctor) => (
                          <option key={doctor.id} value={doctor.id}>
                            {doctor.prefix} {doctor.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Procedures Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Procedures</h2>
                  <button
                    type="button"
                    onClick={addProcedure}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add Procedure
                  </button>
                </div>

                {formData.procedures.map((procedure, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-sm mb-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-md font-medium text-gray-900">Procedure {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeProcedure(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Exam *
                        </label>
                        <select
                          value={procedure.examId}
                          onChange={(e) => updateProcedure(index, 'examId', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required
                        >
                          <option value="">Select Exam</option>
                          {exams.map((exam) => (
                            <option key={exam.id} value={exam.id}>
                              {exam.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Schedule Date *
                        </label>
                        <input
                          type="date"
                          value={procedure.scheduleDate}
                          onChange={(e) => updateProcedure(index, 'scheduleDate', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Schedule Time *
                        </label>
                        <input
                          type="time"
                          value={procedure.scheduleTime}
                          onChange={(e) => updateProcedure(index, 'scheduleTime', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Facility *
                        </label>
                        <select
                          value={procedure.facilityId}
                          onChange={(e) => updateProcedure(index, 'facilityId', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required
                        >
                          <option value="">Select Facility</option>
                          {facilities.map((facility) => (
                            <option key={facility.id} value={facility.id}>
                              {facility.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Physician *
                        </label>
                        <select
                          value={procedure.physicianId}
                          onChange={(e) => updateProcedure(index, 'physicianId', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required
                        >
                          <option value="">Select Physician</option>
                          {physicians.map((physician) => (
                            <option key={physician.id} value={physician.id}>
                              {physician.prefix} {physician.name} {physician.suffix}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Status *
                        </label>
                        <select
                          value={procedure.statusId}
                          onChange={(e) => updateProcedure(index, 'statusId', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required
                        >
                          <option value="">Select Status</option>
                          {statuses.map((status) => (
                            <option key={status.id} value={status.id}>
                              {status.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          LOP
                        </label>
                        <input
                          type="text"
                          value={procedure.lop}
                          onChange={(e) => updateProcedure(index, 'lop', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={procedure.isCompleted}
                          onChange={(e) => updateProcedure(index, 'isCompleted', e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          Completed
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.push('/patients')}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 