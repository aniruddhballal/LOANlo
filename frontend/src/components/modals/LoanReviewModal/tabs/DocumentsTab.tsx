import { useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, Eye, Download, Loader, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { LoanApplication } from '../types'
import { formatDate, getDocumentProgress, getProgressBarColor } from '../utils'
import api from '../../../../api'

interface DocumentsTabProps {
  application: LoanApplication
}

export default function DocumentsTab({ application }: DocumentsTabProps) {
  const [loadingDocument, setLoadingDocument] = useState<string | null>(null)
  const [documentError, setDocumentError] = useState<string | null>(null)
  const [deletingDocument, setDeletingDocument] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const documentProgress = getDocumentProgress(application.documents)
  const allRequiredDocsUploaded = documentProgress.percentage === 100

  const handleDocumentView = async (doc: any) => {
    if (!doc.uploaded) return

    setLoadingDocument(doc.type)
    setDocumentError(null)

    try {
      const response = await api.get(`/documents/file/${application._id}/${doc.type}`, {
        responseType: 'blob'
      })

      // Create blob URL and open in new tab
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      
      // Try to determine file type from response headers or doc type
      const contentType = response.headers['content-type'] || 'application/pdf'
      
      if (contentType.startsWith('image/')) {
        // Open images in new tab
        window.open(url, '_blank')
      } else {
        // For PDFs and other documents, open in new tab
        const newTab = window.open(url, '_blank')
        if (!newTab) {
          // Fallback: trigger download if popup blocked
          const link = document.createElement('a')
          link.href = url
          link.download = `${doc.name}_${application._id.slice(-8)}.pdf`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      }

      // Clean up the URL after a short delay
      setTimeout(() => window.URL.revokeObjectURL(url), 1000)

    } catch (error: any) {
      console.error('Error fetching document:', error)
      setDocumentError(`Failed to load ${doc.name}. Please try again.`)
    } finally {
      setLoadingDocument(null)
    }
  }

  const handleDocumentDelete = async (doc: any) => {
    if (!doc.uploaded) return

    setDeletingDocument(doc.type)
    setDocumentError(null)

    try {
      const response = await api.delete(`/documents/delete/${application._id}/${doc.type}`)

      if (response.data.success) {
        // Force a page refresh or update the application data
        // You might want to call a parent function to refresh the data
        // For now, we'll show a success message
        window.location.reload() // Simple refresh - you might want to implement a better state update
      }

    } catch (error: any) {
      console.error('Error deleting document:', error)
      
      let errorMessage = `Failed to delete ${doc.name}.`
      if (error.response?.status === 404) {
        errorMessage += ' Document not found.'
      } else if (error.response?.status === 403) {
        errorMessage += ' Access denied.'
      } else if (error.response?.status >= 500) {
        errorMessage += ' Server error.'
      }
      errorMessage += ' Please try again.'
      
      setDocumentError(errorMessage)
    } finally {
      setDeletingDocument(null)
      setShowDeleteConfirm(null)
    }
  }

  const handleDeleteConfirm = (doc: any) => {
    setShowDeleteConfirm(doc.type)
  }

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(null)
  }

  const handleDocumentDownload = async (doc: any) => {
    if (!doc.uploaded) return

    setLoadingDocument(`${doc.type}_download`)
    setDocumentError(null)

    try {
      // Use the same endpoint as view for consistency
      const response = await api.get(`/documents/file/${application._id}/${doc.type}`, {
        responseType: 'blob',
        headers: {
          'Accept': '*/*'
        }
      })

      // Create download link
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Determine file extension from content-type or default to pdf
      let fileExtension = 'pdf'
      const contentType = response.headers['content-type'] || response.headers['Content-Type'] || ''
      
      if (contentType.includes('pdf')) {
        fileExtension = 'pdf'
      } else if (contentType.includes('image/jpeg') || contentType.includes('image/jpg')) {
        fileExtension = 'jpg'
      } else if (contentType.includes('image/png')) {
        fileExtension = 'png'
      } else if (contentType.includes('image/')) {
        fileExtension = 'jpg' // Default for other images
      } else if (contentType.includes('word') || contentType.includes('msword')) {
        fileExtension = 'doc'
      } else if (contentType.includes('spreadsheet') || contentType.includes('excel')) {
        fileExtension = 'xlsx'
      }
      
      // Generate clean filename
      const cleanDocName = doc.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')
      link.download = `${cleanDocName}_${application._id.slice(-8)}.${fileExtension}`
      
      // Force download
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 100)

      console.log('Download initiated for:', link.download)

    } catch (error: any) {
      console.error('Error downloading document:', error)
      
      // More detailed error messaging
      let errorMessage = `Failed to download ${doc.name}.`
      if (error.response?.status === 404) {
        errorMessage += ' Document not found.'
      } else if (error.response?.status === 403) {
        errorMessage += ' Access denied.'
      } else if (error.response?.status >= 500) {
        errorMessage += ' Server error.'
      }
      errorMessage += ' Please try again.'
      
      setDocumentError(errorMessage)
    } finally {
      setLoadingDocument(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-lg">Document Requirements</h3>
        <div className="flex items-center space-x-3">
          {!allRequiredDocsUploaded && (
            <Link
              to="/upload-documents"
              state={{ applicationId: application._id }}
              className="inline-flex items-center px-5 py-3 rounded-xl text-sm font-semibold bg-white text-amber-700 border-2 border-amber-200 hover:border-amber-300 hover:bg-amber-50 transition-all duration-200 shadow-sm hover:shadow-lg group"
            >
              <div className="w-5 h-5 mr-3 bg-amber-100 rounded-full flex items-center justify-center group-hover:bg-amber-200">
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
              </div>
              Upload Required Documents
              <svg width="14" height="14" className="ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </Link>
          )}
          <span className="text-sm font-medium text-gray-600">
            {documentProgress.uploaded} of {documentProgress.total} completed
          </span>
          <div className="text-lg font-bold text-gray-900">
            {Math.round(documentProgress.percentage)}%
          </div>
        </div>
      </div>

      {/* Document Progress Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Required Documents</h4>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor(documentProgress.percentage)}`}
                  style={{ width: `${documentProgress.percentage}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900">
                {documentProgress.uploaded}/{documentProgress.total}
              </span>
            </div>
          </div>
          {application.documents && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Optional Documents</h4>
              <div className="flex items-center space-x-2">
                {(() => {
                  const optionalTotal = application.documents.filter(doc => !doc.required).length
                  const optionalUploaded = application.documents.filter(doc => !doc.required && doc.uploaded).length
                  const optionalProgress = optionalTotal > 0 ? (optionalUploaded / optionalTotal) * 100 : 0
                  return (
                    <>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor(optionalProgress)}`}
                          style={{ width: `${optionalProgress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {optionalUploaded}/{optionalTotal}
                      </span>
                    </>
                  )
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Document List */}
      <div className="space-y-3">
        {application.documents?.map((doc) => (
          <div key={doc.type} className={`p-4 rounded-lg border-2 transition-all duration-200 ${
            doc.uploaded 
              ? 'bg-green-50 border-green-200 hover:border-green-300' 
              : doc.required 
                ? 'bg-red-50 border-red-200 hover:border-red-300'
                : 'bg-gray-50 border-gray-200 hover:border-gray-300'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {doc.uploaded ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className={`w-5 h-5 ${doc.required ? 'text-red-600' : 'text-gray-400'}`} />
                )}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{doc.name}</h4>
                  <p className="text-sm text-gray-600">{doc.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {doc.required ? 'Required' : 'Optional'} • {doc.uploaded ? 'Uploaded' : 'Pending'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {doc.uploaded && doc.uploadedAt && (
                  <span className="text-sm text-gray-500 mr-3">
                    {formatDate(doc.uploadedAt)}
                  </span>
                )}
                
                {doc.uploaded && (
                  <div className="flex items-center space-x-2">
                    {/* View Document Button */}
                    <button
                      onClick={() => handleDocumentView(doc)}
                      disabled={loadingDocument === doc.type}
                      className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      title={`View ${doc.name}`}
                    >
                      {loadingDocument === doc.type ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                      <span>View</span>
                    </button>

                    {/* Download Document Button */}
                    <button
                      onClick={() => handleDocumentDownload(doc)}
                      disabled={loadingDocument === `${doc.type}_download`}
                      className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-50 text-gray-700 border border-gray-200 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      title={`Download ${doc.name}`}
                    >
                      {loadingDocument === `${doc.type}_download` ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      <span>Download</span>
                    </button>

                    {/* Delete Document Button */}
                    <button
                      onClick={() => handleDeleteConfirm(doc)}
                      disabled={deletingDocument === doc.type}
                      className="flex items-center space-x-1 px-3 py-1 text-sm bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      title={`Delete ${doc.name}`}
                    >
                      {deletingDocument === doc.type ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Delete Document</h3>
                <p className="text-sm text-gray-500">
                  {(() => {
                    const doc = application.documents?.find(d => d.type === showDeleteConfirm)
                    return doc?.name
                  })()}
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-700">
                Are you sure you want to delete this document? This action cannot be undone and the file will be permanently removed from the system.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const doc = application.documents?.find(d => d.type === showDeleteConfirm)
                  if (doc) handleDocumentDelete(doc)
                }}
                disabled={deletingDocument !== null}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingDocument ? (
                  <div className="flex items-center space-x-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </div>
                ) : (
                  'Delete Document'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {documentError && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800">Document Error</h4>
              <p className="text-sm text-red-700 mt-1">{documentError}</p>
              <button 
                onClick={() => setDocumentError(null)}
                className="text-sm text-red-600 underline hover:text-red-800 mt-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {!allRequiredDocsUploaded && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800">Documents Pending</h4>
              <p className="text-sm text-amber-700 mt-1">
                The applicant needs to upload {documentProgress.total - documentProgress.uploaded} more required document(s) 
                before the application can be reviewed and processed.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}