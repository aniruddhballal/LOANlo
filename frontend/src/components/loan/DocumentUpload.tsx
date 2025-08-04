import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import styles from './DocumentUpload.module.css'

// Icons (you can replace these with your preferred icon library)
const CheckCircleIcon = () => (
  <svg className={styles.statusIcon} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
)

const ClockIcon = () => (
  <svg className={styles.statusIcon} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
  </svg>
)

const ExclamationTriangleIcon = () => (
  <svg className={styles.errorIcon} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
)

const UploadIcon = () => (
  <svg className={styles.uploadIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
)

const CloudUploadIcon = () => (
  <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l2 2 4-4" />
  </svg>
)

const DocumentIcon = () => (
  <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const ArrowLeftIcon = () => (
  <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
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
  const { applicationId } = useParams<{ applicationId: string }>()
  const navigate = useNavigate()
  
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

  useEffect(() => {
    fetchUploadedDocuments()
  }, [applicationId])

  const fetchUploadedDocuments = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/documents/${applicationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setDocuments(prevDocs => 
          prevDocs.map(doc => ({
            ...doc,
            uploaded: data.uploadedDocuments.includes(doc.type)
          }))
        )
      }
    } catch (err) {
      console.error('Failed to fetch uploaded documents:', err)
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

      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
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
      } else {
        clearInterval(progressInterval)
        const data = await response.json()
        setError(data.message || 'Upload failed')
      }
    } catch (err) {
      clearInterval(progressInterval)
      setError('Upload failed')
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
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/documents/complete/${applicationId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        navigate('/application-status')
      } else {
        const data = await response.json()
        setError(data.message || 'Failed to complete submission')
      }
    } catch (err) {
      setError('Failed to complete submission')
    }
  }

  const requiredDocsCount = documents.filter(doc => doc.required).length
  const requiredDocsUploaded = documents.filter(doc => doc.required && doc.uploaded).length
  const optionalDocsCount = documents.filter(doc => !doc.required).length
  const optionalDocsUploaded = documents.filter(doc => !doc.required && doc.uploaded).length
  const totalUploaded = requiredDocsUploaded + optionalDocsUploaded
  const totalDocs = documents.length

  const requiredProgress = (requiredDocsUploaded / requiredDocsCount) * 100
  const optionalProgress = optionalDocsCount > 0 ? (optionalDocsUploaded / optionalDocsCount) * 100 : 0

  return (
    <div className={styles.container}>
      {/* Animated Background */}
      <div className={styles.backgroundAnimation}>
        <div className={styles.blob1}></div>
        <div className={styles.blob2}></div>
        <div className={styles.blob3}></div>
      </div>

      <div className={styles.mainCard}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.logo}>Document Vault</h1>
          <p className={styles.subtitle}>Secure Document Management</p>
        </div>

        <div className={styles.glassCard}>
          {/* Title Section */}
          <div className={styles.titleSection}>
            <h2 className={styles.title}>Upload Documents</h2>
            <div className={styles.applicationId}>
              Application ID: {applicationId}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className={styles.errorContainer}>
              <ExclamationTriangleIcon />
              <span className={styles.errorText}>{error}</span>
            </div>
          )}

          {/* Progress Overview */}
          <div className={styles.progressOverview}>
            <div className={styles.progressCard}>
              <div className={styles.progressLabel}>Required Documents</div>
              <div className={styles.progressCount}>
                {requiredDocsUploaded} / {requiredDocsCount}
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${requiredProgress}%` }}
                ></div>
              </div>
            </div>

            <div className={styles.progressCard}>
              <div className={styles.progressLabel}>Optional Documents</div>
              <div className={styles.progressCount}>
                {optionalDocsUploaded} / {optionalDocsCount}
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${optionalProgress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Documents Grid */}
          <div className={styles.documentsGrid}>
            {documents.map((document, index) => (
              <div 
                key={document.type} 
                className={`${styles.documentCard} ${document.uploaded ? styles.uploaded : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={styles.documentHeader}>
                  <div className={styles.documentInfo}>
                    <h4>
                      {document.name}
                      {document.required && <span className={styles.required}> *</span>}
                    </h4>
                    <p className={styles.documentDescription}>
                      {document.description}
                    </p>
                  </div>
                  
                  <div className={`${styles.statusBadge} ${document.uploaded ? styles.statusUploaded : styles.statusPending}`}>
                    {document.uploaded ? (
                      <>
                        <CheckCircleIcon />
                        Uploaded
                      </>
                    ) : (
                      <>
                        <ClockIcon />
                        Pending
                      </>
                    )}
                  </div>
                </div>

                {!document.uploaded && (
                  <div className={styles.uploadSection}>
                    <div className={styles.fileInputWrapper}>
                      <input
                        type="file"
                        id={`file-${document.type}`}
                        className={styles.fileInput}
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileSelect(document.type, file)
                        }}
                      />
                      <label htmlFor={`file-${document.type}`} className={styles.fileInputLabel}>
                        <UploadIcon />
                        {selectedFiles[document.type] ? 'Change File' : 'Choose File'}
                      </label>
                    </div>
                    
                    {selectedFiles[document.type] && (
                      <>
                        <div className={styles.selectedFile}>
                          <span className={styles.fileName}>
                            {selectedFiles[document.type].name}
                          </span>
                        </div>
                        
                        <div className={styles.buttonGroup}>
                          <button 
                            className={styles.uploadButton}
                            onClick={() => uploadDocument(document.type)}
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <div className={styles.spinner}></div>
                                <span className={styles.buttonText}>Uploading...</span>
                              </>
                            ) : (
                              <>
                                <CloudUploadIcon />
                                <span className={styles.buttonText}>Upload</span>
                              </>
                            )}
                          </button>
                        </div>
                      </>
                    )}

                    {uploadProgress[document.type] !== undefined && (
                      <div className={styles.uploadProgress}>
                        <div className={styles.progressText}>
                          Upload Progress: {Math.round(uploadProgress[document.type])}%
                        </div>
                        <div className={styles.progressBarContainer}>
                          <div 
                            className={styles.uploadProgressBar}
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
          <div className={styles.actionButtons}>
            <button 
              className={`${styles.actionButton} ${styles.backButton}`}
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeftIcon />
              <span className={styles.buttonText}>Back to Dashboard</span>
            </button>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className={`${styles.actionButton} ${styles.uploadAllButton}`}
                onClick={uploadAllDocuments}
                disabled={loading || !documents.some(doc => doc.file && !doc.uploaded)}
              >
                <CloudUploadIcon />
                <span className={styles.buttonText}>Upload All Selected</span>
              </button>
              
              <button 
                className={`${styles.actionButton} ${styles.completeButton}`}
                onClick={completeDocumentSubmission}
                disabled={requiredDocsUploaded !== requiredDocsCount}
              >
                <DocumentIcon />
                <span className={styles.buttonText}>Complete Application</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocumentUpload