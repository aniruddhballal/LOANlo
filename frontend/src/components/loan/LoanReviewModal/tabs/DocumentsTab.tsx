import { useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, Eye, Download, Loader, Trash2, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { LoanApplication } from '../types'
import { formatDate, getDocumentProgress, getProgressBarColor } from '../utils'
import api from '../../../../api'

interface DocumentsTabProps {
  application: LoanApplication
  onDocumentUpdate: () => Promise<void>
  isApplicant?: boolean
}

export default function DocumentsTab({ application, onDocumentUpdate, isApplicant = false }: DocumentsTabProps) {
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
        await onDocumentUpdate()
      }

    } catch (error: any) {
      console.error('Error deleting document:', error)
      console.log('Backend response:', error.response?.data)
      
      let errorMessage = `Failed to delete ${doc.name}.`
      if (error.response?.status === 404) {
        errorMessage += ' Document not found.'
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || errorMessage
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
      {/* Delete Confirmation Modal */}
      {isApplicant && showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md mx-4 border border-gray-200 shadow-xl">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Delete Document</h3>
                  <p className="text-sm text-gray-500">
                    {(() => {
                      const doc = application.documents?.find(d => d.type === showDeleteConfirm)
                      return doc?.name
                    })()}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete this document? This action cannot be undone and the file will be permanently removed.
              </p>
            </div>
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const doc = application.documents?.find(d => d.type === showDeleteConfirm)
                  if (doc) handleDocumentDelete(doc)
                }}
                disabled={deletingDocument !== null}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {deletingDocument ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Document</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-lg">Document Requirements</h3>
        <div className="flex items-center space-x-4">
          {/* Upload Button */}
          {isApplicant && !allRequiredDocsUploaded && (
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
          {/* Progress Summary */}
          <div className="flex items-center space-x-3 bg-gray-50 rounded-lg px-4 py-2 border border-gray-200">
            <span className="text-sm font-medium text-gray-600">
              {documentProgress.uploaded} of {documentProgress.total} completed
            </span>
            <div className="text-lg font-bold text-gray-900">
              {Math.round(documentProgress.percentage)}%
            </div>
          </div>
        </div>
      </div>

      {/* Document Progress Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Required Documents</h4>
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor(documentProgress.percentage)}`}
                  style={{ width: `${documentProgress.percentage}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 min-w-fit">
                {documentProgress.uploaded}/{documentProgress.total}
              </span>
            </div>
          </div>
          {application.documents && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Optional Documents</h4>
              <div className="flex items-center space-x-3">
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
                      <span className="text-sm font-medium text-gray-900 min-w-fit">
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
      <div className="space-y-4">
        {application.documents?.map((doc) => (
          <div key={doc.type} className={`p-6 rounded-lg border-2 transition-all duration-200 ${
            doc.uploaded 
              ? 'bg-green-50 border-green-200 hover:border-green-300 hover:shadow-sm' 
              : doc.required 
                ? 'bg-red-50 border-red-200 hover:border-red-300 hover:shadow-sm'
                : 'bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-4">
                <div className="mt-1">
                  {doc.uploaded ? (
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  ) : (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      doc.required ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      <XCircle className={`w-5 h-5 ${doc.required ? 'text-red-600' : 'text-gray-400'}`} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-base">{doc.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      doc.required 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {doc.required ? 'Required' : 'Optional'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      doc.uploaded 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {doc.uploaded ? 'Uploaded' : 'Pending'}
                    </span>
                    {doc.uploaded && doc.uploadedAt && (
                      <span className="text-xs text-gray-500">
                        Uploaded {formatDate(doc.uploadedAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {doc.uploaded && (
                <div className="flex items-center space-x-2 ml-4">
                  {/* View Document Button */}
                  <button
                    onClick={() => handleDocumentView(doc)}
                    disabled={loadingDocument === doc.type}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group"
                    title={`View ${doc.name}`}
                  >
                    {loadingDocument === doc.type ? (
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Eye className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    )}
                    <span>View</span>
                  </button>

                  {/* Download Document Button */}
                  <button
                    onClick={() => handleDocumentDownload(doc)}
                    disabled={loadingDocument === `${doc.type}_download`}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 hover:border-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group"
                    title={`Download ${doc.name}`}
                  >
                    {loadingDocument === `${doc.type}_download` ? (
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Download className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    )}
                    <span>Download</span>
                  </button>

                  {/* Delete Document Button - Only visible for applicants */}
                  {isApplicant && (
                    <button
                      onClick={() => handleDeleteConfirm(doc)}
                      disabled={deletingDocument === doc.type}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group"
                      title={`Delete ${doc.name}`}
                    >
                      {deletingDocument === doc.type ? (
                        <Loader className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                      )}
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Error Display */}
      {documentError && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-red-800">Document Error</h4>
              <p className="text-sm text-red-700 mt-1">{documentError}</p>
              <button 
                onClick={() => setDocumentError(null)}
                className="text-sm text-red-600 hover:text-red-800 mt-2 font-medium underline transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Documents Warning - Only for applicants */}
      {isApplicant && !allRequiredDocsUploaded && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mt-0.5">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-amber-800">Documents Pending</h4>
              <p className="text-sm text-amber-700 mt-1">
                You need to upload {documentProgress.total - documentProgress.uploaded} more required document(s) 
                before your application can be reviewed and processed.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}