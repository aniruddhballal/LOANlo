import { useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, Eye, Download, Loader } from 'lucide-react'
import type { LoanApplication } from '../types'
import { formatDate, getDocumentProgress, getProgressBarColor } from '../utils'
import api from '../../../../api'

interface DocumentsTabProps {
  application: LoanApplication
}

export default function DocumentsTab({ application }: DocumentsTabProps) {
  const [loadingDocument, setLoadingDocument] = useState<string | null>(null)
  const [documentError, setDocumentError] = useState<string | null>(null)

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

  const handleDocumentDownload = async (doc: any) => {
    if (!doc.uploaded) return

    setLoadingDocument(`${doc.type}_download`)
    setDocumentError(null)

    try {
      const response = await api.get(`/loans/documents/${application._id}/${doc.type}`, {
        responseType: 'blob'
      })

      // Create download link
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Generate filename with application ID for uniqueness
      const fileExtension = response.headers['content-type']?.includes('pdf') ? 'pdf' : 
                           response.headers['content-type']?.includes('image') ? 'jpg' : 'pdf'
      link.download = `${doc.name.replace(/\s+/g, '_')}_${application._id.slice(-8)}.${fileExtension}`
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

    } catch (error: any) {
      console.error('Error downloading document:', error)
      setDocumentError(`Failed to download ${doc.name}. Please try again.`)
    } finally {
      setLoadingDocument(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-lg">Document Requirements</h3>
        <div className="flex items-center space-x-3">
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
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

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