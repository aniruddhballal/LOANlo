import React, { useEffect, useState } from 'react';
import api from '../../api'; // adjust path if needed

interface Applicant {
  _id: string;
  [key: string]: any;
}

const AllApplicants: React.FC = () => {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: '20px', background: 'white', color: 'black' }}>
      <h2>All Applicants ({applicants.length})</h2>
      {applicants.length === 0 ? (
        <p>No applicants found.</p>
      ) : (
        <table border={1} cellPadding={6} cellSpacing={0}>
          <thead>
            <tr>
              {Object.keys(applicants[0]).map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {applicants.map((applicant) => (
              <tr key={applicant._id}>
                {Object.entries(applicant).map(([key, value]) => (
                  <td key={key}>{String(value)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AllApplicants;
