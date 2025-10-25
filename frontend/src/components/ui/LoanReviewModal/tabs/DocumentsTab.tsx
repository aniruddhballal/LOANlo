import { useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, Eye, Download, Loader, Trash2, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { LoanApplication } from '../types'
import { formatDate, getDocumentProgress, getProgressBarColor } from '../../../utils'
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

      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      
      const contentType = response.headers['content-type'] || 'application/pdf'
      
      if (contentType.startsWith('image/')) {
        window.open(url, '_blank')
      } else {
        const newTab = window.open(url, '_blank')
        if (!newTab) {
          const link = document.createElement('a')
          link.href = url
          link.download = `${doc.name}_${application._id.slice(-8)}.pdf`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      }

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
      const response = await api.get(`/documents/file/${application._id}/${doc.type}`, {
        responseType: 'blob',
        headers: {
          'Accept': '*/*'
        }
      })

      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      let fileExtension = 'pdf'
      const contentType = response.headers['content-type'] || response.headers['Content-Type'] || ''
      
      if (contentType.includes('pdf')) {
        fileExtension = 'pdf'
      } else if (contentType.includes('image/jpeg') || contentType.includes('image/jpg')) {
        fileExtension = 'jpg'
      } else if (contentType.includes('image/png')) {
        fileExtension = 'png'
      } else if (contentType.includes('image/')) {
        fileExtension = 'jpg'
      } else if (contentType.includes('word') || contentType.includes('msword')) {
        fileExtension = 'doc'
      } else if (contentType.includes('spreadsheet') || contentType.includes('excel')) {
        fileExtension = 'xlsx'
      }
      
      const cleanDocName = doc.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')
      link.download = `${cleanDocName}_${application._id.slice(-8)}.${fileExtension}`
      
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 100)
    } catch (error: any) {
      console.error('Error downloading document:', error)
      
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
      {isApplicant && showDeleteConfirm && application.status !== "approved" && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div 
            className="bg-white rounded-2xl max-w-md mx-4 border border-gray-200 shadow-2xl overflow-hidden"
            style={{ animation: 'scaleIn 0.3s ease-out' }}
          >
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-50 to-red-100 rounded-full flex items-center justify-center ring-4 ring-red-50">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg tracking-tight">Delete Document</h3>
                  <p className="text-sm text-gray-500">
                    {(() => {
                      const doc = application.documents?.find(d => d.type === showDeleteConfirm)
                      return doc?.name
                    })()}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Are you sure you want to delete this document? This action cannot be undone and the file will be permanently removed.
              </p>
            </div>
            <div className="border-t border-gray-100 px-6 py-4 bg-gradient-to-br from-gray-50/50 to-transparent flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 hover:shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const doc = application.documents?.find(d => d.type === showDeleteConfirm)
                  if (doc) handleDocumentDelete(doc)
                }}
                disabled={deletingDocument !== null}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 border border-red-600 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-sm hover:shadow-md"
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

      {/* Header with gradient underline */}
      <div className="relative pb-3" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-xl tracking-tight">Document Upload Status</h3>
            <div 
              className="absolute bottom-0 left-0 w-55 h-0.5 bg-gradient-to-r from-blue-600 to-blue-400"
              style={{ animation: 'expandWidth 0.3s ease-out' }}
            ></div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Upload Button */}
            {isApplicant && !allRequiredDocsUploaded && (
              <Link
                to="/upload-documents"
                state={{ applicationId: application._id }}
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-amber-500 to-amber-600 text-white border border-amber-600 hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-sm hover:shadow-md group"
              >
                <div className="w-5 h-5 mr-2 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors duration-200">
                  <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                </div>
                Upload Documents
                <svg width="14" height="14" className="ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </Link>
            )}
            {/* Progress Summary */}
            <div className="flex items-center space-x-3 bg-white rounded-lg px-4 py-2 border border-gray-200 shadow-sm">
              <span className="text-sm font-medium text-gray-600">
                {documentProgress.uploaded} of {documentProgress.total} completed
              </span>
              <div className="text-lg font-bold text-gray-900">
                {Math.round(documentProgress.percentage)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Progress Summary */}
      <div 
        className="group relative bg-white rounded-xl border border-gray-200 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-300 overflow-hidden"
        style={{ animation: 'fadeInUp 0.5s ease-out 0.1s both' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 tracking-tight">Required Documents</h4>
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-2.5 rounded-full transition-all duration-500 ${getProgressBarColor(documentProgress.percentage)}`}
                  style={{ width: `${documentProgress.percentage}%` }}
                />
              </div>
              <span className="text-sm font-bold text-gray-900 min-w-fit">
                {documentProgress.uploaded}/{documentProgress.total}
              </span>
            </div>
          </div>
          {application.documents && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 tracking-tight">Optional Documents</h4>
              <div className="flex items-center space-x-3">
                {(() => {
                  const optionalTotal = application.documents.filter(doc => !doc.required).length
                  const optionalUploaded = application.documents.filter(doc => !doc.required && doc.uploaded).length
                  const optionalProgress = optionalTotal > 0 ? (optionalUploaded / optionalTotal) * 100 : 0
                  return (
                    <>
                      <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`h-2.5 rounded-full transition-all duration-500 ${getProgressBarColor(optionalProgress)}`}
                          style={{ width: `${optionalProgress}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-900 min-w-fit">
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
        {application.documents?.map((doc, index) => (
          <div 
            key={doc.type} 
            className={`group relative rounded-xl border-2 p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 overflow-hidden ${
              doc.uploaded 
                ? 'bg-white border-green-200 hover:border-green-300' 
                : doc.required 
                  ? 'bg-white border-red-200 hover:border-red-300'
                  : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
            style={{ animation: `fadeInUp 0.5s ease-out ${(index + 2) * 0.05}s both` }}
          >
            {/* Gradient overlay */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              doc.uploaded 
                ? 'bg-gradient-to-br from-green-50/50 to-transparent' 
                : doc.required 
                  ? 'bg-gradient-to-br from-red-50/30 to-transparent'
                  : 'bg-gradient-to-br from-gray-50/50 to-transparent'
            }`}></div>
            
            {/* Top shimmer line */}
            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              doc.uploaded 
                ? 'via-green-400' 
                : doc.required 
                  ? 'via-red-400'
                  : 'via-gray-400'
            }`}></div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-start space-x-4 flex-1 min-w-0">
                <div className="mt-1">
                  {doc.uploaded ? (
                    <div className="w-10 h-10 bg-gradient-to-br from-green-50 to-green-100 rounded-full flex items-center justify-center ring-4 ring-green-50 transition-all duration-300">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ring-4 transition-all duration-300 ${
                        doc.required
                          ? 'bg-gradient-to-br from-red-50 to-red-100 ring-red-50'
                          : 'bg-gradient-to-br from-gray-50 to-gray-100 ring-gray-50'
                      }`}
                    >
                      <XCircle className={`w-5 h-5 ${doc.required ? 'text-red-600' : 'text-gray-400'}`} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-base tracking-tight">{doc.name}</h4>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{doc.description}</p>
                  <div className="flex items-center space-x-3 mt-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-all duration-200 ${
                      doc.required 
                        ? 'bg-red-100 text-red-700 border border-red-200' 
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                      {doc.required ? 'Required' : 'Optional'}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-all duration-200 ${
                      doc.uploaded 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-orange-100 text-orange-700 border border-orange-200'
                    }`}>
                      {doc.uploaded ? 'Uploaded' : 'Pending'}
                    </span>
                    {doc.uploaded && doc.uploadedAt && (
                      <span className="text-xs text-gray-500 font-medium">
                        Uploaded {formatDate(doc.uploadedAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {doc.uploaded && (
                <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                  <button
                    onClick={() => handleDocumentView(doc)}
                    disabled={loadingDocument === doc.type}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow group/btn"
                    title={`View ${doc.name}`}
                  >
                    {loadingDocument === doc.type ? (
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Eye className="w-4 h-4 mr-2 transition-transform duration-200 group-hover/btn:scale-110" />
                    )}
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => handleDocumentDownload(doc)}
                    disabled={loadingDocument === `${doc.type}_download`}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 hover:border-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow group/btn"
                    title={`Download ${doc.name}`}
                  >
                    {loadingDocument === `${doc.type}_download` ? (
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Download className="w-4 h-4 mr-2 transition-transform duration-200 group-hover/btn:scale-110" />
                    )}
                    <span>Download</span>
                  </button>

                  {isApplicant && application.status !== "approved" && (
                    <button
                      onClick={() => handleDeleteConfirm(doc)}
                      disabled={deletingDocument === doc.type}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow group/btn"
                      title={`Delete ${doc.name}`}
                    >
                      {deletingDocument === doc.type ? (
                        <Loader className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2 transition-transform duration-200 group-hover/btn:scale-110" />
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
        <div 
          className="group relative bg-white rounded-xl border-2 border-red-300 p-5 shadow-sm transition-all duration-300 hover:shadow-md overflow-hidden"
          style={{ animation: 'fadeInUp 0.3s ease-out' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative z-10 flex items-start space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-50 to-red-100 rounded-full flex items-center justify-center ring-4 ring-red-50">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-red-800 tracking-tight">Document Error</h4>
              <p className="text-sm text-red-700 mt-1 leading-relaxed">{documentError}</p>
              <button 
                onClick={() => setDocumentError(null)}
                className="text-sm text-red-600 hover:text-red-800 mt-2 font-medium underline transition-colors duration-200"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Documents Warning */}
      {isApplicant && !allRequiredDocsUploaded && (
        <div 
          className="group relative bg-white rounded-xl border-2 border-amber-300 p-5 shadow-sm transition-all duration-300 hover:shadow-md overflow-hidden"
          style={{ animation: 'fadeInUp 0.5s ease-out 0.2s both' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative z-10 flex items-start space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-50 to-amber-100 rounded-full flex items-center justify-center ring-4 ring-amber-50">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-amber-800 tracking-tight">Documents Pending</h4>
              <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                You need to upload {documentProgress.total - documentProgress.uploaded} more required document(s) 
                before your application can be reviewed and processed.
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}