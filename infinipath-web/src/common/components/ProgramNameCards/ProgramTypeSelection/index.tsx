import React from 'react';

interface ProgramType {
  id: string;
  name: string;
  description: string;
  modeOfOperation: string;
  hasMultipleSessions: boolean;
  noOfSession: number;
  requiresPayment: boolean;
}

interface ProgramTypeSelectionProps {
  programsList: ProgramType[];
  selectedProgramType: ProgramType | null;
  onProgramTypeSelect: (programType: ProgramType) => void;
  onContinue: () => void;
}

const ProgramTypeSelection: React.FC<ProgramTypeSelectionProps> = ({
  programsList,
  selectedProgramType,
  onProgramTypeSelect,
  onContinue
}) => {
  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '32px', color: '#333' }}>
          Select Program Type
        </h1>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
          gap: '24px',
          marginBottom: '32px'
        }}>
          {programsList.map((programType) => (
            <div 
              key={programType.id}
              onClick={() => onProgramTypeSelect(programType)}
              style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                border: selectedProgramType?.id === programType.id ? '2px solid #1976d2' : '2px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              <h3 style={{ marginBottom: '12px', color: '#333' }}>{programType.name}</h3>
              <p style={{ marginBottom: '16px', color: '#666', lineHeight: '1.5' }}>
                {programType.description}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  backgroundColor: programType.modeOfOperation === 'online' ? '#e3f2fd' : '#f3e5f5',
                  color: programType.modeOfOperation === 'online' ? '#1976d2' : '#7b1fa2'
                }}>
                  {programType.modeOfOperation}
                </span>
                {programType.hasMultipleSessions && (
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    backgroundColor: '#e8f5e8',
                    color: '#2e7d32'
                  }}>
                    {programType.noOfSession} Sessions
                  </span>
                )}
                {programType.requiresPayment && (
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    backgroundColor: '#fff3e0',
                    color: '#f57c00'
                  }}>
                    Paid
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        {selectedProgramType && (
          <div style={{ textAlign: 'center' }}>
            <button 
              onClick={onContinue}
              style={{
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '8px',
                fontSize: '18px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
            >
              Continue with {selectedProgramType.name}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramTypeSelection;