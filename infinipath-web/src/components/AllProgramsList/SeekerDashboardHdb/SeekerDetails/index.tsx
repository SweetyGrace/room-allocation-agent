import React, { useState } from 'react';
import { Save} from 'lucide-react';
import { UserDetails as UserDetailsType } from '../../../types/details';
import styles from './index.module.scss';
import PersonalInfoCard from './PersonalDetails';
import PaymentInfoCard from './PaymentDetails';
import InvoiceDetailsCard from './InvoiceDetails';
import VerticalStepper from '../Common/Stepper';
import defaultSeeker from "../../../../assets/images/default-profile.svg";

interface UserDetailsProps {
  userDetails: UserDetailsType | null;
  onBack: () => void;
  loading: boolean;
  onSave?: (updatedDetails: UserDetailsType) => void;
  role: 'admin' | 'rm' | 'financeManager'; // Add other roles if needed
}

const SeekerDetails: React.FC<UserDetailsProps> = ({ userDetails, onBack, onSave, role = 'rm' }) => {
  const [formData, setFormData] = useState<UserDetailsType | null>(userDetails);

  const ROLE_PERMISSIONS = {
    admin: ['personalInfo', 'paymentInfo', 'invoiceInfo'],
    rm: ['personalInfo'],
    financeManager: ['paymentInfo', 'invoiceInfo'],
  };

  const permissions = ROLE_PERMISSIONS[role] || [];

  if (!userDetails || !formData) return null;

  const handleInputChange = (section: string, field: string, value: string) => {
    setFormData(prev => {
      if (!prev) return null;

      return {
        ...prev,
        [section]: {
          ...prev[section as keyof UserDetailsType],
          [field]: value
        }
      };
    });
  };

  const handleSave = () => {
    if (formData && onSave) {
      // Compute and log only changed fields
      const changes: Partial<UserDetailsType> = {};
  
      for (const section in formData) {
        const current = formData[section as keyof UserDetailsType];
        const original = userDetails![section as keyof UserDetailsType];
  
        if (JSON.stringify(current) !== JSON.stringify(original)) {
          (changes as unknown)[section] = current;
        }
      }
  
      onSave(formData);
    }
  
    onBack(); // navigate back
  };
  


  const { paymentDetails, invoiceDetails } = formData;

  const steps = [
    { label: "Personal Information", status: "completed" },
    { label: "Address Details", status: "completed" },
    { label: "Program Selection", status: "active" },
    { label: "Documents Upload", status: "pending" },
    { label: "Review & Submit", status: "pending" },
  ];
  const stepLabels = steps.map(step => step.label);
  const [activeStep, setActiveStep] = useState(2);

  const handleStepClick = (index: number) => {
    setActiveStep(index);
  };

  const isActive = (index: number) => index === activeStep;
  const isStepWarning = (index: number) => steps[index].status === 'warning';
  const inActive = (index: number) => steps[index].status === 'pending';

  return (
    <div className={styles.container}>
      <div className={styles.seekerDetailsContainer}>
        <VerticalStepper
          title="Seeker Details"
          imageSrc={defaultSeeker}
          name={formData.user.fullName}
          status={steps[activeStep].status}
          steps={stepLabels}
          activeStep={activeStep}
          onStepClick={handleStepClick}
          onBack={onBack}
          isActive={isActive}
          isStepWarning={isStepWarning}
          inActive={inActive}
        />

        <div className={styles.detailCards}>
          <PersonalInfoCard
            data={{
              name: formData.user.fullName,
              userId: formData.user.userId,
              email: formData.user.email,
              mobile: formData.user.mobile,
              dob: formData.userDetails.dob,
              gender: formData.userDetails.gender,
              rmDetails: formData.rmDetails.fullName,
            }}
            isEditing={permissions.includes('personalInfo')}
            onChange={(field, value) => {
              if (['email', 'mobile'].includes(field)) {
                handleInputChange('user', field, value);
              } else {
                handleInputChange('userDetails', field, value);
              }
            }}
          />

          <PaymentInfoCard
            data={{
              paidAmount: paymentDetails.paidAmount,
              paymentMode: paymentDetails.paymentMode,
              paymentStatus: paymentDetails.paymentStatus
            }}
            isEditing={permissions.includes('paymentInfo')}
            onChange={(field, value) => {
              handleInputChange('paymentDetails', field, value);
            }}
          />

          <InvoiceDetailsCard
            invoiceDetails={{
              invoiceNumber: invoiceDetails.invoiceNumber,
              invoiceDate: invoiceDetails.invoiceDate,
              invoiceAmount: invoiceDetails.invoiceAmount,
              status: invoiceDetails.status
            }}
            isEditing={permissions.includes('invoiceInfo')}
            onChange={(section, key, value) => {
              handleInputChange('invoiceDetails', key, value);
            }}
          />

          <div className={styles.actionButtons}>
            <button className={styles.saveButton} onClick={handleSave}>
              <Save size={16} />
              Submit
            </button>
            <button className={styles.cancelButton} onClick={onBack}>
              Cancel
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SeekerDetails;
