import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import api from '../../api';

interface Applicant {
  _id: string;
  userId?: string | { _id: string };
  name?: string;
  email?: string;
  phone?: string;
  status?: string;
  [key: string]: any;
}

const AllApplicants: React.FC = () => {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const res = await api.get('/applicants/all');
        setApplicants(res.data.applicants || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error fetching applicants');
      } finally {
        setLoading(false);
      }
    };
    fetchApplicants();
  }, []);

  const handleVisitProfile = (application: Applicant) => {
    const userId = application.userId 
      ? (typeof application.userId === 'string' ? application.userId : application.userId?._id?.toString())
      : application._id;
    
    if (userId) {
      navigate(`/applicant-profile/${userId}`);
    }
  };

  const getDisplayFields = (applicant: Applicant) => {
    const priority = ['name', 'email', 'phone', 'status'];
    const fields: Array<{ key: string; value: any }> = [];
    
    for (const key of priority) {
      if (applicant[key]) {
        fields.push({ key, value: applicant[key] });
        if (fields.length === 3) break;
      }
    }
    
    if (fields.length < 3) {
      const otherKeys = Object.keys(applicant).filter(
        k => !priority.includes(k) && k !== '_id' && k !== 'userId'
      );
      for (const key of otherKeys) {
        fields.push({ key, value: applicant[key] });
        if (fields.length === 3) break;
      }
    }
    
    return fields;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 text-sm font-medium">Loading applicants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">!</div>
            <div>
              <h3 className="text-red-900 font-semibold">Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 opacity-60"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <header 
          className="bg-white border-b border-gray-200 shadow-sm"
          style={{ animation: 'fadeInDown 0.5s ease-out' }}
        >
          <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-gray-900 to-gray-700 rounded-full flex items-center justify-center text-white font-semibold text-lg tracking-wider shadow-lg transition-transform duration-300 hover:scale-105">
                    SA
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h1 className="text-3xl font-semibold text-gray-900 mb-1 tracking-tight">
                    All Applicants
                  </h1>
                  <p className="text-base text-gray-600">
                    Total: <span className="font-semibold text-gray-900">{applicants.length}</span> applicants
                    <span className="ml-2 text-gray-500">• View and manage applicant profiles</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="group relative px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-gray-400 hover:-translate-y-0.5"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-600 transition-transform duration-300 group-hover:-translate-x-1">
                    <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Back</span>
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-[1600px] mx-auto px-6 lg:px-8 py-8">
          {applicants.length === 0 ? (
            <div 
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"
              style={{ animation: 'fadeInUp 0.5s ease-out' }}
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applicants Found</h3>
              <p className="text-gray-600 text-sm">
                There are currently no applicants in the system.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {applicants.map((applicant, idx) => {
                const displayFields = getDisplayFields(applicant);
                
                return (
                  <div
                    key={applicant._id}
                    className="group bg-white rounded-xl border border-gray-200 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5 overflow-hidden"
                    style={{ animation: 'fadeInUp 0.5s ease-out', animationDelay: `${idx * 0.05}s`, animationFillMode: 'both' }}
                  >
                    {/* Subtle gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Top shimmer line */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative z-10">
                      {/* Card Content */}
                      <div className="space-y-4 mb-6">
                        {displayFields.map((field) => (
                          <div key={field.key} className="group/field">
                            <p className="text-sm font-medium text-gray-500 mb-1.5 tracking-wide uppercase text-xs">
                              {field.key}
                            </p>
                            <p className="text-base text-gray-900 font-medium transition-colors duration-200 group-hover/field:text-gray-700 truncate">
                              {String(field.value)}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-gray-200 mb-6"></div>

                      {/* Action Button */}
                      <button
                        onClick={() => handleVisitProfile(applicant)}
                        className="group/btn relative w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-gray-400 hover:-translate-y-0.5"
                      >
                        <span className="relative z-10 flex items-center justify-center space-x-2">
                          <User className="w-4 h-4 transition-transform duration-200 group-hover/btn:scale-110" />
                          <span>Visit Profile</span>
                        </span>
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100 to-transparent opacity-0 group-hover/btn:opacity-100 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

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
        
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default AllApplicants;