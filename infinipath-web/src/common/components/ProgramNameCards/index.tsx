import React, { useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import ProgramConfigurationForm from './ProgramConfig';
import ProgramTypeSelection from './ProgramTypeSelection';
import SuccessScreen from './SuccessCard';
import ProgramList from '../../../components/ActionCards/ListOfMeetings';
import { format } from 'date-fns';
import { postCall } from '../../../services/apiService';
import { endPoints, PORTAL } from '../../../constants/urlConstants';
import { getItemInLocalStorage } from '../../../services/localStorage';

interface ProgramType {
  id: string;
  name: string;
  description: string;
  modeOfOperation: string;
  onlineType: string;
  noOfSession: number;
  requiresPayment: boolean;
  requiresAttendanceAllSessions: boolean;
  allowsMinors: boolean;
  allowsProxyRegistration: boolean;
  maxCapacity: number;
  waitlistApplicable: boolean;
  defaultStartTime: string;
  defaultEndTime: string;
  defaultCheckinTime: string;
  defaultCheckoutTime: string;
  defaultDuration: string;
  maxSessionDurationDays: number;
  programs?: Array<any>; // Add programs array to the interface
  meta?: {
    location?: string;
  };
}

interface FormData {
  programName: string;
  selectedSessions: number[];
  modeOfOperation: string;
  isPaymentRequired: boolean;
  paymentConfig: {
    basePrice: string;
    combinedPrice1: string;
    combinedPrice2: string;
    gstPercentage: number;
    currency: string;
  };
  registrationSettings: {
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    requiresApproval: boolean;
    hasSeatsLimit: boolean;
    maxSeats: string;
    hasWaitlist: boolean;
    waitlistTriggerCount: string;
    venue: string;
  };
  sessionsSchedule: Array<{
    number: number;
    name: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    checkinTime: string;
    checkoutTime: string;
  }>;
}

interface ProgramConfigurationFlowProps {
  programData?: unknown[];
}

const ProgramConfigurationFlow: React.FC<ProgramConfigurationFlowProps> = () => {
  const [currentScreen, setCurrentScreen] = useState<'programTypes' | 'createProgram' | 'success' | 'listOfPrograms'>('programTypes');
  const [selectedProgramType, setSelectedProgramType] = useState<ProgramType | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { programsList } = location.state || {};

  const [formData, setFormData] = useState<FormData>({
    programName: '',
    selectedSessions: [],
    modeOfOperation: '',
    isPaymentRequired: false,
    paymentConfig: {
      basePrice: '',
      combinedPrice1: '',
      combinedPrice2: '',
      gstPercentage: 18,
      currency: 'INR'
    },
    registrationSettings: {
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      requiresApproval: false,
      hasSeatsLimit: false,
      maxSeats: '',
      hasWaitlist: false,
      waitlistTriggerCount: '',
      venue: ''
    },
    sessionsSchedule: []
  });

  const handleProgramTypeSelection = (programType: ProgramType) => {

    // Auto-fill form data based on selected program type
    const currentYear = new Date().getFullYear();
    const autoFilledData: Partial<FormData> = {
      programName: `${programType.name} ${currentYear}`,
      modeOfOperation: programType.modeOfOperation,
      isPaymentRequired: programType.requiresPayment,
      selectedSessions: programType.noOfSession > 0 ?
        Array.from({ length: programType.noOfSession }, (_, i) => i + 1) : [],
      registrationSettings: {
        ...formData.registrationSettings,
        requiresApproval: programType.requiresAttendanceAllSessions,
        hasSeatsLimit: programType.maxCapacity > 0,
        maxSeats: programType.maxCapacity ? programType.maxCapacity.toString() : '',
        hasWaitlist: programType.waitlistApplicable,
        venue: programType.meta?.location || ''
      }
    };

    setFormData(prev => ({ ...prev, ...autoFilledData }));
    setSelectedProgramType(programType);
  };

  const handleContinueToForm = () => {
    setCurrentScreen('listOfPrograms');
  };

  const handleFormDataChange = (newFormData: FormData) => {
    setFormData(newFormData);
  };
    const userId = getItemInLocalStorage("seekerDetails")?.id;
  const handleSubmit = async () => {
    const payload = {
      typeId: selectedProgramType.id,
      name: formData.programName,
      code: `${selectedProgramType.name.replace(/[^A-Z0-9]/g, '')}${new Date().getFullYear()}`,
      description: selectedProgramType.description,
      modeOfOperation: formData.modeOfOperation,
      onlineType: selectedProgramType.onlineType,
      startTime: formData.registrationSettings.startTime,
      endTime: formData.registrationSettings.endTime,
      duration: selectedProgramType.defaultDuration,
      requiresPayment: selectedProgramType.requiresPayment || true,
      requiresAttendanceAllSessions: selectedProgramType.requiresAttendanceAllSessions,
      allowsMinors: selectedProgramType.allowsMinors,
      allowsProxyRegistration: selectedProgramType.allowsProxyRegistration,
      requiresApproval: formData.registrationSettings.requiresApproval,
      totalSeats: formData.registrationSettings.hasSeatsLimit ? parseInt(formData.registrationSettings.maxSeats) : 0,
      waitlistTriggerCount: formData.registrationSettings.hasWaitlist ? parseInt(formData.registrationSettings.waitlistTriggerCount) : 0,
      registrationStartDate: format(new Date(formData.registrationSettings.startDate), "yyyy-MM-dd"),
      registrationEndDate: format(new Date(formData.registrationSettings.endDate), "yyyy-MM-dd"),
      basePrice: selectedProgramType.name === 'HDB/MSD' ?
        parseFloat(formData.paymentConfig.combinedPrice1) : parseFloat(formData.paymentConfig.basePrice),
      gstPercentage: formData.paymentConfig.gstPercentage,
      currency: formData.paymentConfig.currency,
      status: 'draft',
      isActive: true,
      numberOfSessions: selectedProgramType.noOfSession,
      createdBy: userId,
      updatedBy: userId,
      programSessions: formData.sessionsSchedule.map(session => ({
        name: session.name,
        code: `${session.name.replace(/\s+/g, '').toUpperCase()}${new Date().getFullYear()}`,
        number: session.number,
        startDate: format(new Date(session.startDate), "yyyy-MM-dd"),
        startTime: session.checkinTime,
        endDate: format(new Date(session.endDate), "yyyy-MM-dd"),
        endTime: session.checkoutTime,
        venue: formData.registrationSettings.venue,
        modeOfOperation: formData.modeOfOperation,
        status: 'scheduled',
        isActive: true,

      }))
    };


    try {
      const response = await postCall(`${endPoints.program}`, payload, PORTAL);
      if (response.status === 200 || response.status === 201 || response.status === 202) {
        setCurrentScreen('success');
      }
    } catch (error) {
      console.error('Error creating program:', error);
      // Optionally set error state here
    }

  };

  const handleBackToProgramTypes = () => {
    setCurrentScreen('programTypes');
    setSelectedProgramType(null); // Reset selected program type
  };

  // Handler for creating a new program from ProgramList
  const handleCreateProgram = () => {
    setCurrentScreen('createProgram');
  };

  // Handler for adding a program (you might want to customize this)
  const handleAddProgram = (programData: any) => {
    // Add your logic here to handle adding a new program
  };

  // Handler for editing form
  const handleEditForm = (cardName: string, programId: string) => {
    // Add your logic here to handle editing form
  };

  // Handler for adding form
  const handleAddForm = (cardName: string, program: any, programsList: any) => {
    // Add your logic here to handle adding form
  };

  // Handler for editing program
  const handleEditProgram = (programId: string) => {
    // Add your logic here to handle editing program
    // You might want to navigate to an edit screen or open a modal
  };

  // Handler for deleting program
  const handleDeleteProgram = (programId: string) => {
    // Add your logic here to handle deleting program
    // You might want to show a confirmation dialog first
    if (window.confirm('Are you sure you want to delete this program?')) {
      // Add deletion logic here
    }
  };

  const handleCreateAnother = () => {
    // Reset all state
    setCurrentScreen('programTypes');
    setSelectedProgramType(null);
    setFormData({
      programName: '',
      selectedSessions: [],
      modeOfOperation: '',
      isPaymentRequired: false,
      paymentConfig: {
        basePrice: '',
        combinedPrice1: '',
        combinedPrice2: '',
        gstPercentage: 18,
        currency: 'INR'
      },
      registrationSettings: {
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        requiresApproval: false,
        hasSeatsLimit: false,
        maxSeats: '',
        hasWaitlist: false,
        waitlistTriggerCount: '',
        venue: ''
      },
      sessionsSchedule: []
    });
  };

  // If programsList is not available, redirect or show error
  if (!programsList || !Array.isArray(programsList)) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <h2 style={{ color: '#f44336', marginBottom: '16px' }}>
            Error: No Program Types Available
          </h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            Please ensure program types are loaded before accessing this page.
          </p>
          <button
            onClick={() => navigate('/admin/programs')}
            style={{
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Render different screens based on current state
  switch (currentScreen) {
    case 'programTypes':
      return (
        <ProgramTypeSelection
          programsList={programsList}
          selectedProgramType={selectedProgramType}
          onProgramTypeSelect={handleProgramTypeSelection}
          onContinue={handleContinueToForm}
        />
      );

    case 'createProgram':
      if (!selectedProgramType) {
        setCurrentScreen('programTypes');
        return null;
      }
      return (
        <ProgramConfigurationForm
          selectedProgramType={selectedProgramType}
          formData={formData}
          onFormDataChange={handleFormDataChange}
          onSubmit={handleSubmit}
          onBackToProgramTypes={handleBackToProgramTypes}
        />
      );

    case 'listOfPrograms':
      // Pass the selected program type to ProgramList
      return (
        <ProgramList
          programsList={selectedProgramType} // Pass the selected program type instead of full list
          onBackToProgramTypes={handleBackToProgramTypes}
          onCreateProgram={handleCreateProgram}
          onAddProgram={handleAddProgram}
          onEditForm={handleEditForm}
          onAddForm={handleAddForm}
          onEditProgram={handleEditProgram}
          onDeleteProgram={handleDeleteProgram}
        />
      );

    case 'success':
      return (
        <SuccessScreen
          programName={formData.programName}
          onCreateAnother={handleCreateAnother}
        />
      );

    default:
      return null;
  }
};

export default ProgramConfigurationFlow;