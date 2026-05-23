import React, { useState, useEffect } from 'react';
import { programBasicsSchema, sessionScheduleSchema } from './Schema';

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

interface ProgramConfigurationFormProps {
  selectedProgramType: ProgramType;
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
  onSubmit: () => void;
  onBackToProgramTypes: () => void;
}

const ProgramConfigForm: React.FC<ProgramConfigurationFormProps> = ({
  selectedProgramType,
  formData,
  onFormDataChange,
  onSubmit,
  onBackToProgramTypes
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = ['Program Basics', 'Schedules & Logistics'];

  const timeStringToValue = (timeStr: string) => {
    if (!timeStr) return '';
    return timeStr.slice(0, 5);
  };

  const addDaysToDate = (dateStr: string, days: number) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  const validateBasics = async () => {
    try {
      await programBasicsSchema.validate(formData, {
        context: { 
          selectedProgramType, 
          modeOfOperation: formData.modeOfOperation 
        },
        abortEarly: false
      });
      setErrors({});
      return true;
    } catch (validationError: unknown) {
      const newErrors: Record<string, string> = {};
      validationError.inner.forEach((error: unknown) => {
        if (error.path) {
          newErrors[error.path.replace(/\./g, '')] = error.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
  };
  const validateSchedules = async () => {
    try {
      await sessionScheduleSchema.validate(formData, {
        context: { modeOfOperation: formData.modeOfOperation },
        abortEarly: false
      });
      setErrors({});
      return true;
    } catch (validationError: unknown) {
      const newErrors: Record<string, string> = {};
      validationError.inner.forEach((error: unknown) => {
        if (error.path) {
          newErrors[error.path.replace(/\./g, '')] = error.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
  };

  const handleNext = async () => {
    if (activeStep === 0 && await validateBasics()) {
      if (selectedProgramType.noOfSession > 0) {
        const sessions = formData.selectedSessions.map((sessionNum) => ({
          number: sessionNum,
          name: `Session ${sessionNum}`,
          startDate: '',
          endDate: '',
          startTime: timeStringToValue(selectedProgramType.defaultStartTime),
          endTime: timeStringToValue(selectedProgramType.defaultEndTime),
          checkinTime: timeStringToValue(selectedProgramType.defaultCheckinTime),
          checkoutTime: timeStringToValue(selectedProgramType.defaultCheckoutTime)
        }));
        onFormDataChange({ ...formData, sessionsSchedule: sessions });
        setActiveStep(1);
      } else {
        onSubmit();
      }
    } else if (activeStep === 1 && await validateSchedules()) {
      onSubmit();
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleSessionDateChange = (sessionIndex: number, field: string, value: string) => {
    const updatedSessions = [...formData.sessionsSchedule];
    updatedSessions[sessionIndex] = { ...updatedSessions[sessionIndex], [field]: value };

    if (field === 'startDate' && value) {
      if (formData.modeOfOperation === 'offline') {
        updatedSessions[sessionIndex].endDate = addDaysToDate(value, selectedProgramType.maxSessionDurationDays);
      } else {
        updatedSessions[sessionIndex].endDate = value;
      }
    }

    onFormDataChange({ ...formData, sessionsSchedule: updatedSessions });
  };

  const updateFormData = (updates: Partial<FormData>) => {
    onFormDataChange({ ...formData, ...updates });
  };

  const updateNestedFormData = (path: string, value: any) => {
    const pathArray = path.split('.');
    const newFormData = { ...formData };
    let current: any = newFormData;
    
    for (let i = 0; i < pathArray.length - 1; i++) {
      current = current[pathArray[i]] = { ...current[pathArray[i]] };
    }
    
    current[pathArray[pathArray.length - 1]] = value;
    onFormDataChange(newFormData);
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
            {steps.map((step, index) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: index <= activeStep ? '#1976d2' : '#e0e0e0',
                  color: index <= activeStep ? 'white' : '#666',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>
                  {index + 1}
                </div>
                <span style={{ marginLeft: '12px', color: index <= activeStep ? '#1976d2' : '#666' }}>
                  {step}
                </span>
                {index < steps.length - 1 && (
                  <div style={{
                    flex: 1,
                    height: '2px',
                    backgroundColor: index < activeStep ? '#1976d2' : '#e0e0e0',
                    marginLeft: '12px'
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          {activeStep === 0 ? (
            <div>
              <h2 style={{ marginBottom: '24px', color: '#333' }}>Program Basics</h2>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Program Name *
                </label>
                <input
                  type="text"
                  value={formData.programName}
                  onChange={(e) => updateFormData({ programName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: errors.programName ? '2px solid #e28619' : '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
                {errors.programName && (
                  <span style={{ color: '#e28619', fontSize: '14px' }}>{errors.programName}</span>
                )}
              </div>

              {selectedProgramType.noOfSession > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    Sessions
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {Array.from({ length: selectedProgramType.noOfSession }, (_, i) => i + 1).map((sessionNum) => (
                      <label key={sessionNum} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={formData.selectedSessions.includes(sessionNum)}
                          onChange={(e) => {
                            const updated = e.target.checked
                              ? [...formData.selectedSessions, sessionNum]
                              : formData.selectedSessions.filter(s => s !== sessionNum);
                            updateFormData({ selectedSessions: updated });
                          }}
                        />
                        Session {sessionNum}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Mode of Program *
                </label>
                <div style={{ display: 'flex', gap: '16px' }}>
                  {['online', 'offline', 'hybrid'].map((mode) => (
                    <label key={mode} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="radio"
                        name="modeOfOperation"
                        value={mode}
                        checked={formData.modeOfOperation === mode}
                        onChange={(e) => updateFormData({ modeOfOperation: e.target.value })}
                      />
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </label>
                  ))}
                </div>
                {errors.modeOfOperation && (
                  <span style={{ color: '#e28619', fontSize: '14px' }}>{errors.modeOfOperation}</span>
                )}
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={formData.isPaymentRequired}
                    onChange={(e) => updateFormData({ isPaymentRequired: e.target.checked })}
                  />
                  Is Payment Required?
                </label>
              </div>

              {formData.isPaymentRequired && (
                <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                  <h3 style={{ marginBottom: '16px' }}>Payment Configuration</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {selectedProgramType?.name === 'HDB/MSD' ? (
                      <>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                            Combined Price 1 *
                          </label>
                          <input
                            type="number"
                            value={formData.paymentConfig.combinedPrice1}
                            onChange={(e) => updateNestedFormData('paymentConfig.combinedPrice1', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '12px',
                              border: errors.paymentConfigcombinedPrice1 ? '2px solid #e28619' : '1px solid #ddd',
                              borderRadius: '6px'
                            }}
                          />
                          {errors.paymentConfigcombinedPrice1 && (
                            <span style={{ color: '#e28619', fontSize: '14px' }}>{errors.paymentConfigcombinedPrice1}</span>
                          )}
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                            Combined Price 2 *
                          </label>
                          <input
                            type="number"
                            value={formData.paymentConfig.combinedPrice2}
                            onChange={(e) => updateNestedFormData('paymentConfig.combinedPrice2', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '12px',
                              border: errors.paymentConfigcombinedPrice2 ? '2px solid #e28619' : '1px solid #ddd',
                              borderRadius: '6px'
                            }}
                          />
                          {errors.paymentConfigcombinedPrice2 && (
                            <span style={{ color: '#e28619', fontSize: '14px' }}>{errors.paymentConfigcombinedPrice2}</span>
                          )}
                        </div>
                      </>
                    ) : (
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                          Base Price *
                        </label>
                        <input
                          type="number"
                          value={formData.paymentConfig.basePrice}
                          onChange={(e) => updateNestedFormData('paymentConfig.basePrice', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: errors.paymentConfigbasePrice ? '2px solid #e28619' : '1px solid #ddd',
                            borderRadius: '6px'
                          }}
                        />
                        {errors.paymentConfigbasePrice && (
                          <span style={{ color: '#e28619', fontSize: '14px' }}>{errors.paymentConfigbasePrice}</span>
                        )}
                      </div>
                    )}
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>GST %</label>
                      <input
                        type="number"
                        value={formData.paymentConfig.gstPercentage}
                        onChange={(e) => updateNestedFormData('paymentConfig.gstPercentage', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #ddd',
                          borderRadius: '6px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Currency</label>
                      <select
                        value={formData.paymentConfig.currency}
                        onChange={(e) => updateNestedFormData('paymentConfig.currency', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #ddd',
                          borderRadius: '6px'
                        }}
                      >
                        <option value="INR">INR</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                <h3 style={{ marginBottom: '16px' }}>Registration Settings</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      Registration Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.registrationSettings.startDate}
                      onChange={(e) => updateNestedFormData('registrationSettings.startDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: errors.registrationSettingsstartDate ? '2px solid #e28619' : '1px solid #ddd',
                        borderRadius: '6px'
                      }}
                    />
                    {errors.registrationSettingsstartDate && (
                      <span style={{ color: '#e28619', fontSize: '14px' }}>{errors.registrationSettingsstartDate}</span>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      Registration Start Time *
                    </label>
                    <input
                      type="time"
                      value={formData.registrationSettings.startTime}
                      onChange={(e) => updateNestedFormData('registrationSettings.startTime', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: errors.registrationSettingsstartTime ? '2px solid #e28619' : '1px solid #ddd',
                        borderRadius: '6px'
                      }}
                    />
                    {errors.registrationSettingsstartTime && (
                      <span style={{ color: '#e28619', fontSize: '14px' }}>{errors.registrationSettingsstartTime}</span>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      Registration End Date *
                    </label>
                    <input
                      type="date"
                      value={formData.registrationSettings.endDate}
                      onChange={(e) => updateNestedFormData('registrationSettings.endDate', e.target.value)}
                      min={formData.registrationSettings.startDate || new Date().toISOString().split('T')[0]}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: errors.registrationSettingsendDate ? '2px solid #e28619' : '1px solid #ddd',
                        borderRadius: '6px'
                      }}
                    />
                    {errors.registrationSettingsendDate && (
                      <span style={{ color: '#e28619', fontSize: '14px' }}>{errors.registrationSettingsendDate}</span>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      Registration End Time *
                    </label>
                    <input
                      type="time"
                      value={formData.registrationSettings.endTime}
                      onChange={(e) => updateNestedFormData('registrationSettings.endTime', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: errors.registrationSettingsendTime ? '2px solid #e28619' : '1px solid #ddd',
                        borderRadius: '6px'
                      }}
                    />
                    {errors.registrationSettingsendTime && (
                      <span style={{ color: '#e28619', fontSize: '14px' }}>{errors.registrationSettingsendTime}</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={formData.registrationSettings.requiresApproval}
                      onChange={(e) => updateNestedFormData('registrationSettings.requiresApproval', e.target.checked)}
                    />
                    Is approval required for seat confirmation?
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={formData.registrationSettings.hasSeatsLimit}
                      onChange={(e) => updateNestedFormData('registrationSettings.hasSeatsLimit', e.target.checked)}
                    />
                    Is there a limit on seats?
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={formData.registrationSettings.hasWaitlist}
                      onChange={(e) => updateNestedFormData('registrationSettings.hasWaitlist', e.target.checked)}
                    />
                    Is there waiting list available?
                  </label>
                </div>

                {formData.registrationSettings.hasSeatsLimit && (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      Maximum number of seats *
                    </label>
                    <input
                      type="number"
                      value={formData.registrationSettings.maxSeats}
                      onChange={(e) => updateNestedFormData('registrationSettings.maxSeats', e.target.value)}
                      style={{
                        width: '200px',
                        padding: '12px',
                        border: errors.registrationSettingsmaxSeats ? '2px solid #e28619' : '1px solid #ddd',
                        borderRadius: '6px'
                      }}
                    />
                    {errors.registrationSettingsmaxSeats && (
                      <span style={{ color: '#e28619', fontSize: '14px', display: 'block' }}>{errors.registrationSettingsmaxSeats}</span>
                    )}
                  </div>
                )}

                {formData.registrationSettings.hasWaitlist && (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      Waitlist triggers at *
                    </label>
                    <input
                      type="number"
                      value={formData.registrationSettings.waitlistTriggerCount}
                      onChange={(e) => updateNestedFormData('registrationSettings.waitlistTriggerCount', e.target.value)}
                      style={{
                        width: '200px',
                        padding: '12px',
                        border: errors.registrationSettingswaitlistTriggerCount ? '2px solid #e28619' : '1px solid #ddd',
                        borderRadius: '6px'
                      }}
                    />
                    {errors.registrationSettingswaitlistTriggerCount && (
                      <span style={{ color: '#e28619', fontSize: '14px', display: 'block' }}>{errors.registrationSettingswaitlistTriggerCount}</span>
                    )}
                  </div>
                )}

                {formData.modeOfOperation === 'offline' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      Venue *
                    </label>
                    <input
                      type="text"
                      value={formData.registrationSettings.venue}
                      onChange={(e) => updateNestedFormData('registrationSettings.venue', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: errors.registrationSettingsvenue ? '2px solid #e28619' : '1px solid #ddd',
                        borderRadius: '6px'
                      }}
                    />
                    {errors.registrationSettingsvenue && (
                      <span style={{ color: '#e28619', fontSize: '14px' }}>{errors.registrationSettingsvenue}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <h2 style={{ marginBottom: '24px', color: '#333' }}>Schedules & Logistics</h2>
              {formData.sessionsSchedule.map((session, index) => (
                <div key={index} style={{ 
                  marginBottom: '24px', 
                  padding: '20px', 
                  backgroundColor: '#f9f9f9', 
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }}>
                  <h3 style={{ marginBottom: '16px', color: '#333' }}>{session.name}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={session.startDate}
                        onChange={(e) => handleSessionDateChange(index, 'startDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: errors[`sessionsSchedule${index}startDate`] ? '2px solid #e28619' : '1px solid #ddd',
                          borderRadius: '6px'
                        }}
                      />
                      {errors[`sessionsSchedule${index}startDate`] && (
                        <span style={{ color: '#e28619', fontSize: '14px' }}>{errors[`sessionsSchedule${index}startDate`]}</span>
                      )}
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                        End Date *
                      </label>
                      <input
                        type="date"
                        value={session.endDate}
                        onChange={(e) => handleSessionDateChange(index, 'endDate', e.target.value)}
                        min={session.startDate || new Date().toISOString().split('T')[0]}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: errors[`sessionsSchedule${index}endDate`] ? '2px solid #e28619' : '1px solid #ddd',
                          borderRadius: '6px'
                        }}
                      />
                      {errors[`sessionsSchedule${index}endDate`] && (
                        <span style={{ color: '#e28619', fontSize: '14px' }}>{errors[`sessionsSchedule${index}endDate`]}</span>
                      )}
                    </div>
                    {formData.modeOfOperation === 'offline' ? (
                      <>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                            Check-in Time *
                          </label>
                          <input
                            type="time"
                            value={session.checkinTime}
                            onChange={(e) => handleSessionDateChange(index, 'checkinTime', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '12px',
                              border: errors[`sessionsSchedule${index}checkinTime`] ? '2px solid #e28619' : '1px solid #ddd',
                              borderRadius: '6px'
                            }}
                          />
                          {errors[`sessionsSchedule${index}checkinTime`] && (
                            <span style={{ color: '#e28619', fontSize: '14px' }}>{errors[`sessionsSchedule${index}checkinTime`]}</span>
                          )}
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                            Check-out Time *
                          </label>
                          <input
                            type="time"
                            value={session.checkoutTime}
                            onChange={(e) => handleSessionDateChange(index, 'checkoutTime', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '12px',
                              border: errors[`sessionsSchedule${index}checkoutTime`] ? '2px solid #e28619' : '1px solid #ddd',
                              borderRadius: '6px'
                            }}
                          />
                          {errors[`sessionsSchedule${index}checkoutTime`] && (
                            <span style={{ color: '#e28619', fontSize: '14px' }}>{errors[`sessionsSchedule${index}checkoutTime`]}</span>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                            Start Time *
                          </label>
                          <input
                            type="time"
                            value={session.startTime}
                            onChange={(e) => handleSessionDateChange(index, 'startTime', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '12px',
                              border: errors[`sessionsSchedule${index}startTime`] ? '2px solid #e28619' : '1px solid #ddd',
                              borderRadius: '6px'
                            }}
                          />
                          {errors[`sessionsSchedule${index}startTime`] && (
                            <span style={{ color: '#e28619', fontSize: '14px' }}>{errors[`sessionsSchedule${index}startTime`]}</span>
                          )}
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                            End Time *
                          </label>
                          <input
                            type="time"
                            value={session.endTime}
                            onChange={(e) => handleSessionDateChange(index, 'endTime', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '12px',
                              border: errors[`sessionsSchedule${index}endTime`] ? '2px solid #e28619' : '1px solid #ddd',
                              borderRadius: '6px'
                            }}
                          />
                          {errors[`sessionsSchedule${index}endTime`] && (
                            <span style={{ color: '#e28619', fontSize: '14px' }}>{errors[`sessionsSchedule${index}endTime`]}</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid #e0e0e0'
          }}>
            <button 
              onClick={onBackToProgramTypes}
              style={{
                backgroundColor: '#f5f5f5',
                color: '#666',
                border: '1px solid #ddd',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Back to Program Types
            </button>
            <div style={{ display: 'flex', gap: '12px' }}>
              {activeStep > 0 && (
                <button 
                  onClick={handleBack}
                  style={{
                    backgroundColor: '#f5f5f5',
                    color: '#666',
                    border: '1px solid #ddd',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Back
                </button>
              )}
              <button 
                onClick={handleNext}
                style={{
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {activeStep === steps.length - 1 || selectedProgramType.noOfSession === 0 ? 'Create Program' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramConfigForm;