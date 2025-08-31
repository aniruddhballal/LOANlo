import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ShieldX, ArrowLeft, Lock } from "lucide-react";

const AccessDenied: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBack = () => {
    if (user?.role) {
      navigate(`/dashboard/${user.role}`);
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-gray-900 to-black p-8 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <ShieldX className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Access Denied
            </h1>
            <div className="w-16 h-0.5 bg-white/30 mx-auto"></div>
          </div>

          {/* Content */}
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-6 h-6 text-red-600" />
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Insufficient Permissions
            </h2>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              You don't have the required permissions to access this page. 
              Please contact your administrator if you believe this is an error.
            </p>

            {/* Action Button */}
            <button
              onClick={handleBack}
              className="w-full bg-gradient-to-r from-gray-900 to-black text-white py-3 px-6 rounded-lg font-medium hover:from-black hover:to-gray-900 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
              <span>
                {user?.role ? `Back to ${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard` : 'Back to Login'}
              </span>
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Need help? Contact support for assistance
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;