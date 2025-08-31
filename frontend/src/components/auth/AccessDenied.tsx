import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

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
    <div>
      <h1>Access Denied</h1>
      <p>You don't have permission to view this page.</p>
      <button onClick={handleBack}>Back</button>
    </div>
  );
};

export default AccessDenied;