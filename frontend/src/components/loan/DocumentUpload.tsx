import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api'

// Refined, minimal icons for professional appearance
const CheckCircleIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
)

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
  </svg>
)

const ExclamationTriangleIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
)

const UploadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
)

const CloudUploadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l2 2 4-4" />
  </svg>
)

const DocumentIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const ArrowLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
)

interface Document {
  name: string
  type: string
  required: boolean
  uploaded: boolean
  file?: File
  description?: string
}



const DocumentUpload = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const applicationId = location.state?.applicationId

  // Add initial loading state
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  const [documents, setDocuments] = useState<Document[]>([
    { 
      name: 'Aadhaar Card', 
      type: 'aadhaar', 
      required: true, 
      uploaded: false,
      description: 'Government issued identity proof with 12-digit unique number'
    },
    { 
      name: 'PAN Card', 
      type: 'pan', 
      required: true, 
      uploaded: false,
      description: 'Permanent Account Number card for tax identification'
    },
    { 
      name: 'Salary Slips (Last 3 months)', 
      type: 'salary_slips', 
      required: true, 
      uploaded: false,
      description: 'Recent salary certificates showing current income'
    },
    { 
      name: 'Bank Statements (Last 6 months)', 
      type: 'bank_statements', 
      required: true, 
      uploaded: false,
      description: 'Bank account statements for financial verification'
    },
    { 
      name: 'Employment Certificate', 
      type: 'employment_certificate', 
      required: true, 
      uploaded: false,
      description: 'Letter from employer confirming current employment status'
    },
    { 
      name: 'Photo', 
      type: 'photo', 
      required: true, 
      uploaded: false,
      description: 'Recent passport-size photograph for identification'
    },
    { 
      name: 'Address Proof', 
      type: 'address_proof', 
      required: false, 
      uploaded: false,
      description: 'Utility bill or rent agreement showing current address'
    },
    { 
      name: 'Income Tax Returns', 
      type: 'itr', 
      required: false, 
      uploaded: false,
      description: 'IT returns for additional income verification'
    }
  ])
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File }>({})

  const { user } = useAuth()

  useEffect(() => {
    if (!applicationId) {
      // 🚫 No app ID, redirect back
      navigate("/dashboard/applicant")
      return
    }

    if (user) {
      if (user.role !== "applicant") {
        navigate(`/dashboard/${user.role}`)
      } else {
        fetchUploadedDocuments()
      }
    }
  }, [user, applicationId, navigate])

  const fetchUploadedDocuments = async () => {
    try {
      setIsInitialLoading(true) // Start loading
      const { data } = await api.get(`/documents/${applicationId}`)
      setDocuments(prevDocs =>
        prevDocs.map(doc => ({
          ...doc,
          uploaded: data.uploadedDocuments.includes(doc.type)
        }))
      )
    } catch (err: any) {
      console.error('Failed to fetch uploaded documents:', err)
    } finally {
      setIsInitialLoading(false) // End loading
    }
  }

  const handleFileSelect = (documentType: string, file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, PNG, and PDF files are allowed')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setError('')
    setSelectedFiles(prev => ({ ...prev, [documentType]: file }))
    
    setDocuments(prevDocs =>
      prevDocs.map(doc =>
        doc.type === documentType ? { ...doc, file } : doc
      )
    )
  }

  const uploadDocument = async (documentType: string) => {
    const document = documents.find(doc => doc.type === documentType)
    if (!document?.file) return

    setLoading(true)
    setUploadProgress(prev => ({ ...prev, [documentType]: 0 }))

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        const currentProgress = prev[documentType] || 0
        if (currentProgress < 90) {
          return { ...prev, [documentType]: currentProgress + 10 }
        }
        return prev
      })
    }, 200)

    try {
      const formData = new FormData()
      formData.append('document', document.file)
      formData.append('documentType', documentType)
      formData.append('applicationId', applicationId!)

      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      clearInterval(progressInterval)
      setUploadProgress(prev => ({ ...prev, [documentType]: 100 }))

      setTimeout(() => {
        setDocuments(prevDocs =>
          prevDocs.map(doc =>
            doc.type === documentType ? { ...doc, uploaded: true, file: undefined } : doc
          )
        )
        setSelectedFiles(prev => {
          const newFiles = { ...prev }
          delete newFiles[documentType]
          return newFiles
        })
        setUploadProgress(prev => {
          const newProgress = { ...prev }
          delete newProgress[documentType]
          return newProgress
        })
      }, 1000)
    } catch (err: any) {
      clearInterval(progressInterval)
      setError(err.response?.data?.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const uploadAllDocuments = async () => {
    const documentsToUpload = documents.filter(doc => doc.file && !doc.uploaded)
    
    for (const doc of documentsToUpload) {
      await uploadDocument(doc.type)
    }
  }

  const completeDocumentSubmission = async () => {
    const requiredDocsUploaded = documents
      .filter(doc => doc.required)
      .every(doc => doc.uploaded)

    if (!requiredDocsUploaded) {
      setError('Please upload all required documents before proceeding')
      return
    }

    try {
      await api.post(`/documents/complete/${applicationId}`)
      navigate('/application-status')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete submission')
    }
  }

  // Show loading state while fetching initial data
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header - can be shown immediately */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <h1 className="text-2xl font-light text-gray-900 tracking-wide">Document Vault</h1>
                  <div className="w-2 h-2 bg-gray-500 rounded-full ml-2"></div>
                </div>
                <div className="h-6 w-px bg-gray-300"></div>
                <p className="text-sm text-gray-600 uppercase tracking-widest font-medium">Secure Document Management</p>
              </div>
              <div className="flex items-center bg-gray-50 border border-gray-200 px-4 py-2 rounded-md">
                <div className="w-1 h-1 bg-gray-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-700 font-mono tracking-wide">App ID: {applicationId}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content with Loading State */}
        <main className="max-w-7xl mx-auto px-6 py-12">
          {/* Title Section */}
          <div className="text-center mb-12 pb-8 border-b border-gray-200">
            <h2 className="text-3xl font-light text-gray-900 mb-3 tracking-wide">Document Submission</h2>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Please upload all required documents to proceed with your application. Ensure all files are clear, 
              legible, and under 5MB in size.
            </p>
          </div>

          {/* Progress Overview - Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                </div>
                <div className="text-right">
                  <div className="h-8 bg-gray-200 rounded w-8 mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2"></div>
              <div className="flex justify-end mt-2">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                </div>
                <div className="text-right">
                  <div className="h-8 bg-gray-200 rounded w-8 mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2"></div>
              <div className="flex justify-end mt-2">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>

          {/* Documents Grid - Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded w-40 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded w-16 mt-2"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded-full w-20"></div>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons - Skeleton */}
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4 pt-8 border-t border-gray-200">
            <div className="w-full sm:w-auto h-12 bg-gray-200 rounded-lg animate-pulse" style={{ width: '180px' }}></div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <div className="w-full sm:w-auto h-12 bg-gray-200 rounded-lg animate-pulse" style={{ width: '160px' }}></div>
              <div className="w-full sm:w-auto h-12 bg-gray-200 rounded-lg animate-pulse" style={{ width: '170px' }}></div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Calculate progress after data is loaded
  const requiredDocsCount = documents.filter(doc => doc.required).length
  const requiredDocsUploaded = documents.filter(doc => doc.required && doc.uploaded).length
  const optionalDocsCount = documents.filter(doc => !doc.required).length
  const optionalDocsUploaded = documents.filter(doc => !doc.required && doc.uploaded).length

  const requiredProgress = (requiredDocsUploaded / requiredDocsCount) * 100
  const optionalProgress = optionalDocsCount > 0 ? (optionalDocsUploaded / optionalDocsCount) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <h1 className="text-2xl font-light text-gray-900 tracking-wide">Document Vault</h1>
              </div>
              <div className="h-6 w-px bg-gray-300"></div>
              <p className="text-sm text-gray-600 uppercase tracking-widest font-medium">Secure Document Management</p>
            </div>
            <div className="flex items-center bg-gray-50 border border-gray-200 px-4 py-2 rounded-md">
              <div className="w-1 h-1 bg-gray-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-700 font-mono tracking-wide">App ID: {applicationId}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Back Button */}
        <div>
          <button
            className="flex items-center space-x-2 px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-all duration-200 text-sm font-medium"
            onClick={() => {
              if (user?.role) {
                navigate(`/dashboard/${user.role}`)
              } else {
                navigate('/dashboard/applicant') // fallback
              }
            }}
          >
            <ArrowLeftIcon />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Title Section */}
        <div className="text-center mb-12 pb-8 border-b border-gray-200">
          <h2 className="text-3xl font-light text-gray-900 mb-3 tracking-wide">Document Submission</h2>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Please upload all required documents to proceed with your application. Ensure all files are clear, 
            legible, and under 5MB in size.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 flex items-start space-x-3 animate-pulse">
            <ExclamationTriangleIcon />
            <div>
              <p className="text-red-800 text-sm font-medium">Upload Error</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-lg font-medium transition-colors duration-500 ${
                  requiredProgress === 0 ? 'text-red-600' :
                  requiredProgress < 50 ? 'text-red-500' :
                  requiredProgress < 100 ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  Required Documents
                </h3>
                <p className="text-sm text-gray-600 mt-1">Essential for application processing</p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-light transition-colors duration-500 ${
                  requiredProgress === 0 ? 'text-red-600' :
                  requiredProgress < 50 ? 'text-red-500' :
                  requiredProgress < 100 ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {requiredDocsUploaded}
                </div>
                <div className="text-sm text-gray-500">of {requiredDocsCount}</div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-2 rounded-full transition-all duration-700 ease-out ${
                  requiredProgress === 0 ? 'bg-red-500' :
                  requiredProgress < 50 ? 'bg-red-400' :
                  requiredProgress < 100 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${requiredProgress}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-600 mt-2 text-right font-mono">
              {Math.round(requiredProgress)}% Complete
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-lg font-medium transition-colors duration-500 ${
                  optionalProgress === 0 ? 'text-red-600' :
                  optionalProgress < 50 ? 'text-red-500' :
                  optionalProgress < 100 ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  Optional Documents
                </h3>
                <p className="text-sm text-gray-600 mt-1">Additional verification documents</p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-light transition-colors duration-500 ${
                  optionalProgress === 0 ? 'text-red-600' :
                  optionalProgress < 50 ? 'text-red-500' :
                  optionalProgress < 100 ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {optionalDocsUploaded}
                </div>
                <div className="text-sm text-gray-500">of {optionalDocsCount}</div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-2 rounded-full transition-all duration-700 ease-out ${
                  optionalProgress === 0 ? 'bg-red-500' :
                  optionalProgress < 50 ? 'bg-red-400' :
                  optionalProgress < 100 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${optionalProgress}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-600 mt-2 text-right font-mono">
              {Math.round(optionalProgress)}% Complete
            </div>
          </div>
        </div>
        {/* Documents Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {documents.map((document, index) => (
            <div 
              key={document.type}
              className={`bg-white border rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                document.uploaded 
                  ? 'border-green-200 bg-green-50/50' 
                  : document.required 
                    ? 'border-gray-300' 
                    : 'border-gray-200'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Document Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900 flex items-center">
                    {document.name}
                    {document.required && (
                      <span className="text-red-500 ml-1 text-xl">*</span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                    {document.description}
                  </p>
                  {document.required && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-2">
                      Required
                    </span>
                  )}
                </div>
                
                <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  document.uploaded 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {document.uploaded ? <CheckCircleIcon /> : <ClockIcon />}
                  <span>{document.uploaded ? 'Uploaded' : 'Pending'}</span>
                </div>
              </div>

              {/* Upload Section */}
              {!document.uploaded && (
                <div className="space-y-4 border-t border-gray-100 pt-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <input
                        type="file"
                        id={`file-${document.type}`}
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileSelect(document.type, file)
                        }}
                      />
                      <label 
                        htmlFor={`file-${document.type}`}
                        className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                      >
                        <div className="text-center">
                          <UploadIcon />
                          <div className="mt-2 text-sm text-gray-700 font-medium">
                            {selectedFiles[document.type] ? 'Change File' : 'Select File'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            PDF, JPEG, PNG (Max 5MB)
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  {selectedFiles[document.type] && (
                    <>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                              <DocumentIcon />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                {selectedFiles[document.type].name}
                              </p>
                              <p className="text-xs text-gray-600">
                                {(selectedFiles[document.type].size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        className="w-full bg-gray-900 text-white px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-all duration-200 flex items-center justify-center space-x-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => uploadDocument(document.type)}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <CloudUploadIcon />
                            <span>Upload Document</span>
                          </>
                        )}
                      </button>
                    </>
                  )}

                  {uploadProgress[document.type] !== undefined && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Upload Progress</span>
                        <span className="font-mono">{Math.round(uploadProgress[document.type])}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-2 bg-gray-800 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress[document.type]}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-8 border-t border-gray-200">
          <button 
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={uploadAllDocuments}
            disabled={loading || !documents.some(doc => doc.file && !doc.uploaded)}
          >
            <CloudUploadIcon />
            <span>Upload All Selected</span>
          </button>
          
          <button 
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={completeDocumentSubmission}
            disabled={requiredDocsUploaded !== requiredDocsCount}
          >
            <DocumentIcon />
            <span>Complete Application</span>
          </button>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            All uploaded documents are encrypted and stored securely. For assistance with document upload, 
            please contact our support team at <span className="font-mono">support@documentvault.com</span>
          </p>
        </div>
      </main>
    </div>
  )
}

export default DocumentUpload