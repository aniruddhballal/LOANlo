import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import type { LoanApplication } from './types'
import { formatDate, getDocumentProgress, getProgressBarColor } from './utils'

interface DocumentsTabProps {
  application: LoanApplication
}

export default function DocumentsTab({ application }: DocumentsTabProps) {
  const documentProgress = getDocumentProgress(application.documents)
  const allRequiredDocsUploaded = documentProgress.percentage === 100

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
                <div>
                  <h4 className="font-medium text-gray-900">{doc.name}</h4>
                  <p className="text-sm text-gray-600">{doc.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {doc.required ? 'Required' : 'Optional'} • {doc.uploaded ? 'Uploaded' : 'Pending'}
                  </p>
                </div>
              </div>
              {doc.uploaded && doc.uploadedAt && (
                <span className="text-sm text-gray-500">
                  {formatDate(doc.uploadedAt)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

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