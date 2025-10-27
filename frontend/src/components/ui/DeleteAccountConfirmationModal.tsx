interface DeleteAccountConfirmationModalProps {
  show: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}

const DeleteAccountConfirmationModal = ({ 
  show, 
  onClose, 
  onConfirm, 
  loading 
}: DeleteAccountConfirmationModalProps) => (
  <>
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] transition-all duration-300 ${
        show ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{ position: 'fixed' }}
      onClick={onClose}
    />
    <div 
      className={`fixed inset-0 z-[9999] overflow-y-auto transition-opacity duration-300 ${
        show ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="min-h-screen flex items-center justify-center p-4">
        <div
          className={`bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transition-transform duration-300 ${
            show ? 'scale-100' : 'scale-95'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
            Delete Account?
          </h3>
          <p className="text-sm text-gray-600 text-center mb-6">
            This action cannot be undone. All your data, including loan applications and personal information, will be permanently deleted.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="group relative flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">Cancel</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="group relative flex-1 px-4 py-3 text-sm font-medium text-white bg-red-600 border border-red-700 rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">{loading ? 'Deleting...' : 'Delete Account'}</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
)

export default DeleteAccountConfirmationModal