import React from 'react';

interface SuccessScreenProps {
  programName: string;
  onCreateAnother: () => void;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({
  programName,
  onCreateAnother
}) => {
  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center', 
      backgroundColor: '#f5f5f5', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        maxWidth: '500px'
      }}>
        <div style={{ 
          fontSize: '48px', 
          color: '#4caf50', 
          marginBottom: '20px' 
        }}>
          ✓
        </div>
        <h1 style={{ color: '#333', marginBottom: '16px' }}>
          Program Created Successfully!
        </h1>
        <p style={{ color: '#666', marginBottom: '32px' }}>
          Your program "{programName}" has been created and is ready for configuration.
        </p>
        <button 
          onClick={onCreateAnother}
          style={{
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Create Another Program
        </button>
      </div>
    </div>
  );
};

export default SuccessScreen;