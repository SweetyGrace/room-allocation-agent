import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getProgramImage } from "../../utils/commonFunctions";
import { getItemInLocalStorage } from "../../services/localStorage";

const SuccessScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const seekerDetails = getItemInLocalStorage("seekerDetails");
  const programId = location?.state?.programId || null;
  const programName = location?.state?.programName || "Your Program";
  const isEditMode = location?.state?.isEditMode || false;
  const bannerImage = location?.state?.bannerImageUrl || null;
  const handleReturnHome = () => {
    // Replace with your actual home route
    navigate("/admin/action-cards");
    // Or if using React Router: navigate('/home')
  };

  const handleGoToRegistration = () => {
    // Replace with your actual registration form route
    navigate("/admin/program-edit", {
      state: {programId: programId, programName: programName}}
    );
    // Or if using React Router: navigate('/registration')
  };

  return (
    <div style={styles.container}>
      {
        bannerImage && (
            <img
              src={bannerImage}
              alt="Program Banner"
              style={styles.icon}
            />
        )
      }
      {
        !bannerImage && (
          <img
            src={getProgramImage(programName)}
            alt="Program Icon"
            style={styles.icon}
          />
        )
      }
      <div style={styles.title}>{programName}</div>
      <div style={styles.content}>
        <h2 style={styles.heading}>
          Your {programName} has been successfully {isEditMode ? 'updated' : 'created'}, {seekerDetails?.firstName}.
        </h2>
        <p style={styles.description}>
          The registration form is now ready — you can view it and configure the
          fields as needed.
        </p>

        <div style={styles.buttonContainer}>
          <button style={styles.secondaryButton} onClick={handleReturnHome}>
            return to home
          </button>
          <button style={styles.primaryButton} onClick={handleGoToRegistration}>
            go to registration form
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100%",
    backgroundColor: "#f8fafc",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  card: {
    width: "320px",
    height: "180px",
    background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    position: "relative" as const,
    marginBottom: "40px",
    boxShadow: "0 10px 25px rgba(220, 38, 38, 0.3)",
  },
  iconContainer: {
    marginBottom: "16px",
  },
  icon: {
  },
  title: {
    color: "white",
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "4px",
    letterSpacing: "0.5px",
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: "14px",
    fontWeight: "400",
  },
  content: {
    textAlign: "center" as const,
    maxWidth: "500px",
    width: "100%",
  },
  heading: {
    color: "#1f2937",
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "12px",
    lineHeight: "1.4",
  },
  description: {
    color: "#6b7280",
    fontSize: "16px",
    lineHeight: "1.5",
    marginBottom: "32px",
  },
  buttonContainer: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap" as const,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    color: "#6b7280",
    border: "1px solid #d1d5db",
    borderRadius: "25px",
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    outline: "none",
  },
  primaryButton: {
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "25px",
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    outline: "none",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
  },
};

// Add hover effects via CSS-in-JS alternative or you can add these styles to a CSS file
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  button:hover {
    transform: translateY(-1px);
  }
  
  button:active {
    transform: translateY(0);
  }
  
  button[style*="backgroundColor: transparent"]:hover {
    background-color: #f9fafb !important;
    border-color: #9ca3af !important;
    color: #374151 !important;
  }
  
  button[style*="backgroundColor: #3b82f6"]:hover {
    background-color: #2563eb !important;
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4) !important;
  }
`;
document.head.appendChild(styleSheet);

export default SuccessScreen;
