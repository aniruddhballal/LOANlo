import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

interface Document {
  name: string
  type: string
  required: boolean
  uploaded: boolean
  file?: File
}

const DocumentUpload = () => {
  const { applicationId } = useParams<{ applicationId: string }>()
  const navigate = useNavigate()
  
  const [documents, setDocuments] = useState<Document[]>([
    { name: 'Aadhaar Card', type: 'aadhaar', required: true, uploaded: false },
    { name: 'PAN Card', type: 'pan', required: true, uploaded: false },
    { name: 'Salary Slips (Last 3 months)', type: 'salary_slips', required: true, uploaded: false },
    { name: 'Bank Statements (Last 6 months)', type: 'bank_statements', required: true, uploaded: false },
    { name: 'Employment Certificate', type: 'employment_certificate', required: true, uploaded: false },
    { name: 'Photo', type: 'photo', required: true, uploaded: false },
    { name: 'Address Proof', type: 'address_proof', required: false, uploaded: false },
    { name: 'Income Tax Returns', type: 'itr', required: false, uploaded: false }
  ])
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    // Fetch existing documents for this application
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
        // Update documents state with uploaded status
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
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, PNG, and PDF files are allowed')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setError('')
    
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
        setDocuments(prevDocs =>
          prevDocs.map(doc =>
            doc.type === documentType ? { ...doc, uploaded: true, file: undefined } : doc
          )
        )
        setUploadProgress(prev => ({ ...prev, [documentType]: 100 }))
      } else {
        const data = await response.json()
        setError(data.message || 'Upload failed')
      }
    } catch (err) {
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

  const requiredDocsUploaded = documents
    .filter(doc => doc.required)
    .every(doc => doc.uploaded)

  return (
    <div>
      <h2>Upload Documents</h2>
      <p>Application ID: {applicationId}</p>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        <h3>Document Upload Progress</h3>
        <div>
          Required Documents: {documents.filter(doc => doc.required && doc.uploaded).length} / {documents.filter(doc => doc.required).length} uploaded
        </div>
        <div>
          Optional Documents: {documents.filter(doc => !doc.required && doc.uploaded).length} / {documents.filter(doc => !doc.required).length} uploaded
        </div>
      </div>

      <div>
        {documents.map((document) => (
          <div key={document.type} style={{ 
            border: '1px solid #ccc', 
            padding: '1rem', 
            marginBottom: '1rem',
            backgroundColor: document.uploaded ? '#f0f8f0' : '#fff'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4>
                  {document.name} 
                  {document.required && <span style={{ color: 'red' }}> *</span>}
                </h4>
                <p style={{ fontSize: '0.9em', color: '#666' }}>
                  {document.required ? 'Required' : 'Optional'} | 
                  Accepted formats: JPEG, PNG, PDF | Max size: 5MB
                </p>
              </div>
              
              <div>
                {document.uploaded ? (
                  <span style={{ color: 'green', fontWeight: 'bold' }}>✓ Uploaded</span>
                ) : (
                  <span style={{ color: 'orange' }}>Pending</span>
                )}
              </div>
            </div>

            {!document.uploaded && (
              <div style={{ marginTop: '1rem' }}>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelect(document.type, file)
                  }}
                />
                
                {document.file && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <span>Selected: {document.file.name}</span>
                    <button 
                      onClick={() => uploadDocument(document.type)}
                      disabled={loading}
                      style={{ marginLeft: '1rem' }}
                    >
                      Upload
                    </button>
                  </div>
                )}

                {uploadProgress[document.type] !== undefined && uploadProgress[document.type] < 100 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div>Upload Progress: {uploadProgress[document.type]}%</div>
                    <div style={{ width: '100%', backgroundColor: '#f0f0f0', height: '8px' }}>
                      <div 
                        style={{ 
                          width: `${uploadProgress[document.type]}%`, 
                          backgroundColor: '#007bff', 
                          height: '100%' 
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <button 
          onClick={uploadAllDocuments}
          disabled={loading || !documents.some(doc => doc.file && !doc.uploaded)}
        >
          Upload All Selected Documents
        </button>
        
        <button 
          onClick={completeDocumentSubmission}
          disabled={!requiredDocsUploaded}
          style={{ 
            backgroundColor: requiredDocsUploaded ? '#28a745' : '#ccc',
            color: 'white'
          }}
        >
          Complete Application Submission
        </button>
        
        <button onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}

export default DocumentUpload