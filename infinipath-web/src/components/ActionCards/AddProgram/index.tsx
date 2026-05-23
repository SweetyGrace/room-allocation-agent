import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { postCall } from '../../../services/apiService';
import { endPoints, PORTAL } from '../../../constants/urlConstants';
import { getItemInLocalStorage } from '../../../services/localStorage';
import { format } from "date-fns";
import { getEarliestStartTime, getLatestEndTime, getMaxSessionDurationDays } from '../../../utils/commonFunctions';
import { ADD_PROGRAM_TEXT, ADD_PROGRAM_PAGE_TEXT, PROGRAM_TYPE } from '../../../constants/textConstants';
import styles from './index.module.scss';

interface ProgramConfigurationFlowProps {
    programData: unknown[]; // Replace 'any' with a more specific type if available
}

const AddNewProgram: React.FC<ProgramConfigurationFlowProps> = ({ programData }) => {
    const [currentScreen, setCurrentScreen] = useState();
    const [selectedProgramType, setSelectedProgramType] = useState([]);
    const [activeStep, setActiveStep] = useState(0);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setSelectedProgramType(programData);
    }, [programData]);
    const [formData, setFormData] = useState({
        programName: '',
        programCode: '',
        selectedSessions: [],
        modeOfOperation: '',
        isPaymentRequired: false,
        isResidential: false,
        isTravelInvolved: false,
        programStartDate: '',
        programStartTime: '',
        programEndDate: '',
        programEndTime: '',
        helplineNumber: '',
        emailSenderName: '',
        venueNameInEmails: '',
        totalBedCount: '',
        paymentConfig: {
            basePrice: '',
            combinedPrice1: '',
            combinedPrice2: '',
            gstPercentage: 18,
            currency: 'INR'
        },
        taxConfig: {
            tdsPercent: 10,
            tdsApplicability: 'base_only',
            sgst: 9,
            cgst: 9,
            igst: 18,
            invoiceSenderName: '',
            pan: '',
            gstin: '',
            cin: '',
            invoiceAddress: ''
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
        sessionsSchedule: [],
        groupedPrograms: []
    });

    const steps = [ADD_PROGRAM_TEXT.STEPS.PROGRAM_BASICS, ADD_PROGRAM_TEXT.STEPS.SCHEDULES_LOGISTICS];

    const addDaysToDate = (dateStr, days) => {
        const date = new Date(dateStr);
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    };

    const timeStringToValue = (timeStr) => {
        if (!timeStr) return '';
        return timeStr.slice(0, 5);
    };

    useEffect(() => {
        if (selectedProgramType) {
            const currentYear = new Date().getFullYear();
            const autoFilledData = {
                programName: `${selectedProgramType.name} ${currentYear}`,
                programCode: `${selectedProgramType.name?.substring(0, 3).toUpperCase()}${currentYear}`,
                modeOfOperation: selectedProgramType.modeOfOperation,
                isPaymentRequired: selectedProgramType.requiresPayment,
                isResidential: selectedProgramType.requiresResidence || false,
                selectedSessions: selectedProgramType.noOfSession > 0 ?
                    Array.from({ length: selectedProgramType.noOfSession }, (_, i) => i + 1) : [],
                registrationSettings: {
                    ...formData.registrationSettings,
                    requiresApproval: selectedProgramType.requiresApproval,
                    hasSeatsLimit: selectedProgramType.maxCapacity > 0,
                    maxSeats: selectedProgramType.maxCapacity || '',
                    hasWaitlist: selectedProgramType.waitlistApplicable,
                    venue: selectedProgramType.meta?.location || ''
                }
            };
            setFormData(prev => ({ ...prev, ...autoFilledData }));
        }
    }, [selectedProgramType]);

    const validateBasics = () => {
        const newErrors = {};

        if (!formData.programName.trim()) {
            newErrors.programName = ADD_PROGRAM_PAGE_TEXT.VALIDATION.PROGRAM_NAME_REQUIRED;
        }

        if (!formData.programCode.trim()) {
            newErrors.programCode = ADD_PROGRAM_PAGE_TEXT.VALIDATION.PROGRAM_CODE_REQUIRED;
        }

        if (!formData.modeOfOperation) {
            newErrors.modeOfOperation = ADD_PROGRAM_PAGE_TEXT.VALIDATION.MODE_OF_OPERATION_REQUIRED;
        }

        if (!formData.programStartDate) {
            newErrors.programStartDate = ADD_PROGRAM_PAGE_TEXT.VALIDATION.PROGRAM_START_DATE_REQUIRED;
        }

        if (!formData.programStartTime) {
            newErrors.programStartTime = ADD_PROGRAM_PAGE_TEXT.VALIDATION.PROGRAM_START_TIME_REQUIRED;
        }

        if (!formData.programEndDate) {
            newErrors.programEndDate = ADD_PROGRAM_PAGE_TEXT.VALIDATION.PROGRAM_END_DATE_REQUIRED;
        }

        if (!formData.programEndTime) {
            newErrors.programEndTime = ADD_PROGRAM_PAGE_TEXT.VALIDATION.PROGRAM_END_TIME_REQUIRED;
        }

        if (formData.isPaymentRequired) {
            if (selectedProgramType?.name === PROGRAM_TYPE.HDB_MSD_LABEL) {
                if (!formData.paymentConfig.combinedPrice1) {
                    newErrors.combinedPrice1 = ADD_PROGRAM_PAGE_TEXT.VALIDATION.FIRST_PRICE_REQUIRED;
                }
                if (!formData.paymentConfig.combinedPrice2) {
                    newErrors.combinedPrice2 = ADD_PROGRAM_PAGE_TEXT.VALIDATION.SECOND_PRICE_REQUIRED;
                }
            } else {
                if (!formData.paymentConfig.basePrice) {
                    newErrors.basePrice = ADD_PROGRAM_PAGE_TEXT.VALIDATION.PRICE_REQUIRED;
                }
            }
        }

        if (!formData.registrationSettings.startDate) {
            newErrors.registrationStartDate = ADD_PROGRAM_PAGE_TEXT.VALIDATION.REGISTRATION_START_REQUIRED;
        }
        if (!formData.registrationSettings.endDate) {
            newErrors.registrationEndDate = ADD_PROGRAM_PAGE_TEXT.VALIDATION.REGISTRATION_END_REQUIRED;
        }
        if (!formData.registrationSettings.startTime) {
            newErrors.registrationStartTime = ADD_PROGRAM_PAGE_TEXT.VALIDATION.REGISTRATION_START_TIME_REQUIRED;
        }
        if (!formData.registrationSettings.endTime) {
            newErrors.registrationEndTime = ADD_PROGRAM_PAGE_TEXT.VALIDATION.REGISTRATION_END_TIME_REQUIRED;
        }

        if (formData.registrationSettings.hasSeatsLimit && !formData.registrationSettings.maxSeats) {
            newErrors.maxSeats = ADD_PROGRAM_PAGE_TEXT.VALIDATION.MAX_SEATS_REQUIRED;
        }

        if (formData.registrationSettings.hasWaitlist && !formData.registrationSettings.waitlistTriggerCount) {
            newErrors.waitlistTriggerCount = ADD_PROGRAM_PAGE_TEXT.VALIDATION.WAITLIST_TRIGGER_REQUIRED;
        }

        if (formData.modeOfOperation === ADD_PROGRAM_TEXT.MODE_OPTIONS.OFFLINE && !formData.registrationSettings.venue.trim()) {
            newErrors.venue = ADD_PROGRAM_PAGE_TEXT.VALIDATION.VENUE_REQUIRED_OFFLINE;
        }

        if (formData.isResidential && !formData.totalBedCount) {
            newErrors.totalBedCount = ADD_PROGRAM_PAGE_TEXT.VALIDATION.TOTAL_BED_COUNT_REQUIRED_RESIDENTIAL;
        }

        if (!formData.helplineNumber.trim()) {
            newErrors.helplineNumber = ADD_PROGRAM_PAGE_TEXT.VALIDATION.HELP_LINE_REQUIRED;
        }

        if (!formData.emailSenderName.trim()) {
            newErrors.emailSenderName = ADD_PROGRAM_PAGE_TEXT.VALIDATION.EMAIL_SENDER_NAME_REQUIRED;
        }

        if (!formData.venueNameInEmails.trim()) {
            newErrors.venueNameInEmails = ADD_PROGRAM_PAGE_TEXT.VALIDATION.VENUE_NAME_EMAIL_REQUIRED;
        }

        // Tax validation
        if (!formData.taxConfig.invoiceSenderName.trim()) {
            newErrors.invoiceSenderName = ADD_PROGRAM_PAGE_TEXT.VALIDATION.NAME_IN_INVOICE_REQUIRED;
        }

        if (!formData.taxConfig.pan.trim()) {
            newErrors.pan = ADD_PROGRAM_PAGE_TEXT.VALIDATION.PAN_REQUIRED;
        }

        if (!formData.taxConfig.gstin.trim()) {
            newErrors.gstin = ADD_PROGRAM_PAGE_TEXT.VALIDATION.GSTIN_REQUIRED;
        }

        if (!formData.taxConfig.cin.trim()) {
            newErrors.cin = ADD_PROGRAM_PAGE_TEXT.VALIDATION.CIN_REQUIRED;
        }

        if (!formData.taxConfig.invoiceAddress.trim()) {
            newErrors.invoiceAddress = ADD_PROGRAM_PAGE_TEXT.VALIDATION.ADDRESS_REQUIRED;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateSchedules = () => {
        const newErrors = {};

        formData.sessionsSchedule.forEach((session, index) => {
            if (!session.startDate) {
                newErrors[`session${index}StartDate`] = ADD_PROGRAM_PAGE_TEXT.VALIDATION.SESSION_START_DATE_REQUIRED;
            }
            if (!session.endDate) {
                newErrors[`session${index}EndDate`] = ADD_PROGRAM_PAGE_TEXT.VALIDATION.SESSION_END_DATE_REQUIRED;
            }
            if (formData.modeOfOperation === ADD_PROGRAM_TEXT.MODE_OPTIONS.OFFLINE) {
                if (!session.checkinTime) {
                    newErrors[`session${index}CheckinTime`] = ADD_PROGRAM_PAGE_TEXT.VALIDATION.SESSION_CHECKIN_TIME_REQUIRED;
                }
                if (!session.checkoutTime) {
                    newErrors[`session${index}CheckoutTime`] = ADD_PROGRAM_PAGE_TEXT.VALIDATION.SESSION_CHECKOUT_TIME_REQUIRED;
                }
            } else {
                if (!session.startTime) {
                    newErrors[`session${index}StartTime`] = ADD_PROGRAM_PAGE_TEXT.VALIDATION.SESSION_START_TIME_REQUIRED;
                }
                if (!session.endTime) {
                    newErrors[`session${index}EndTime`] = ADD_PROGRAM_PAGE_TEXT.VALIDATION.SESSION_END_TIME_REQUIRED;
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (activeStep === 0 && validateBasics()) {
            if (selectedProgramType?.noOfSession > 0) {
                const sessions = formData.selectedSessions.map((sessionNum) => ({
                    number: sessionNum,
                    name: `${ADD_PROGRAM_PAGE_TEXT.VALUES.SESSION_PREFIX}${sessionNum}`,
                    startDate: '',
                    endDate: '',
                    startTime: timeStringToValue(selectedProgramType?.defaultStartTime),
                    endTime: timeStringToValue(selectedProgramType?.defaultEndTime),
                    checkinTime: timeStringToValue(selectedProgramType?.defaultCheckinTime),
                    checkoutTime: timeStringToValue(selectedProgramType?.defaultCheckoutTime)
                }));
                setFormData(prev => ({ ...prev, sessionsSchedule: sessions }));
                setActiveStep(1);
            } else {
                handleSubmit();
            }
        } else if (activeStep === 1 && validateSchedules()) {
            handleSubmit();
        }
    };

    const handleBack = () => {
        setActiveStep(activeStep - 1);
    };
    const userId = getItemInLocalStorage("seekerDetails")?.id;
    

    
    const handleSubmit = async () => {
        // Combine date and time for program start/end
        const programStartDateTime = `${formData.programStartDate}T${formData.programStartTime}${ADD_PROGRAM_PAGE_TEXT.VALUES.TIMESTAMP_MILLIS_SUFFIX}`;
        const programEndDateTime = `${formData.programEndDate}T${formData.programEndTime}${ADD_PROGRAM_PAGE_TEXT.VALUES.TIMESTAMP_MILLIS_SUFFIX}`;
        const registrationStartDateTime = `${formData.registrationSettings.startDate}T${formData.registrationSettings.startTime}${ADD_PROGRAM_PAGE_TEXT.VALUES.TIMESTAMP_SECONDS_SUFFIX}`;
        const registrationEndDateTime = `${formData.registrationSettings.endDate}T${formData.registrationSettings.endTime}${ADD_PROGRAM_PAGE_TEXT.VALUES.TIMESTAMP_SECONDS_SUFFIX}`;
        
        const payload = {
            typeId: selectedProgramType?.id,
            workflowId: selectedProgramType?.workflowId || 1,
            programTemplateId: selectedProgramType?.id, // programTemplateId is same as typeId
            name: formData.programName,
            code: formData.programCode,
            description: selectedProgramType?.description,
            modeOfOperation: formData.modeOfOperation,
            onlineType: selectedProgramType?.onlineType,
            maxSessionDurationDays: getMaxSessionDurationDays(formData.sessionsSchedule),
            hasMultipleSessions: selectedProgramType?.hasMultipleSessions || false,
            frequency: ADD_PROGRAM_PAGE_TEXT.VALUES.FREQUENCY_YEARLY,
            defaultStartTime: getEarliestStartTime(formData.sessionsSchedule),
            defaultEndTime: getLatestEndTime(formData.sessionsSchedule),
            startsAt: programStartDateTime,
            endsAt: programEndDateTime,
            blessEndsAt: programEndDateTime,
            canRegisterTill: registrationEndDateTime,
            duration: selectedProgramType?.defaultDuration,
            requiresResidence: formData.isResidential,
            requiresPayment: selectedProgramType?.requiresPayment || true,
            requiresAttendanceAllSessions: selectedProgramType?.requiresAttendanceAllSessions,
            allowsMinors: selectedProgramType?.allowsMinors,
            allowsProxyRegistration: selectedProgramType?.allowsProxyRegistration,
            requiresApproval: formData.registrationSettings.requiresApproval,
            allowSaveAsDraft: true,
            registrationLevel: ADD_PROGRAM_PAGE_TEXT.VALUES.REGISTRATION_LEVEL_PROGRAM,
            limitedSeats: formData.registrationSettings?.hasSeatsLimit,
            isGroupedProgram: selectedProgramType?.isGroupedProgram || formData.groupedPrograms?.length > 0,
            totalSeats: formData.registrationSettings?.hasSeatsLimit ? parseInt(formData.registrationSettings?.maxSeats || '0') : 0,
            waitlistTriggerCount: formData.registrationSettings?.hasWaitlist ? parseInt(formData.registrationSettings?.waitlistTriggerCount || '0') : 0,
            availableSeats: formData.registrationSettings?.hasSeatsLimit ? parseInt(formData.registrationSettings?.maxSeats || '0') : 0,
            waitlistApplicable: formData.registrationSettings?.hasWaitlist,
            maxCapacity: formData.registrationSettings?.hasSeatsLimit ? parseInt(formData.registrationSettings?.maxSeats || '0') : 0,
            meta: {},
            registrationStartsAt: registrationStartDateTime,
            registrationEndsAt: registrationEndDateTime,
            basePrice: selectedProgramType?.name === PROGRAM_TYPE.HDB_MSD_LABEL ?
                parseFloat(formData.paymentConfig?.combinedPrice1 || '0') : parseFloat(formData.paymentConfig?.basePrice || '0'),
            programFee: selectedProgramType?.name === PROGRAM_TYPE.HDB_MSD_LABEL ?
                parseFloat(formData.paymentConfig?.combinedPrice1 || '0') : parseFloat(formData.paymentConfig?.basePrice || '0'),
            gstPercentage: formData.paymentConfig.gstPercentage,
            cgst: formData.taxConfig.cgst,
            sgst: formData.taxConfig.sgst,
            igst: formData.taxConfig.igst,
            tdsPercent: formData.taxConfig.tdsPercent,
            gstNumber: formData.taxConfig.gstin,
            tdsApplicability: formData.taxConfig.tdsApplicability,
            allocateSeatIfOfflinePending: true,
            invoiceSenderName: formData.taxConfig.invoiceSenderName,
            invoiceSenderPan: formData.taxConfig.pan,
            invoiceSenderCin: formData.taxConfig.cin,
            venueAddress: {
                addr1: formData.taxConfig.invoiceAddress,
                addr2: '',
                landmark: '',
                city: '',
                state: '',
                country: '',
                pincode: '',
                lat: 0,
                long: 0,
                type: ADD_PROGRAM_PAGE_TEXT.VALUES.ADDRESS_TYPE_BILLING
            },
            invoiceSenderAddress: formData.taxConfig.invoiceAddress,
            helplineNumber: formData.helplineNumber,
            emailSenderName: formData.emailSenderName,
            venueNameInEmails: formData.venueNameInEmails,
            seekerCanShareExperience: true,
            totalBedCount: formData.isResidential && formData.totalBedCount ? parseInt(formData.totalBedCount) : 0,
            launchDate: null,
            currency: formData.paymentConfig?.currency,
            status: ADD_PROGRAM_PAGE_TEXT.VALUES.STATUS_DRAFT,
            isActive: true,
            program: formData.programName,
            noOfSession: selectedProgramType?.noOfSession,
            venue: formData.registrationSettings?.venue,
            isTravelInvolved: formData.isTravelInvolved,
            hasCheckinCheckout: formData.isResidential,
            checkinAt: formData.sessionsSchedule?.length > 0 && formData.sessionsSchedule?.[0]?.startDate ? 
                `${formData.sessionsSchedule[0].startDate}T${formData.sessionsSchedule[0]?.checkinTime || ADD_PROGRAM_PAGE_TEXT.VALUES.DEFAULT_CHECKIN_TIME}${ADD_PROGRAM_PAGE_TEXT.VALUES.TIMESTAMP_MILLIS_SUFFIX}` : programStartDateTime,
            checkoutAt: formData.sessionsSchedule?.length > 0 && formData.sessionsSchedule?.[0]?.endDate ?
                `${formData.sessionsSchedule[0].endDate}T${formData.sessionsSchedule[0]?.checkoutTime || ADD_PROGRAM_PAGE_TEXT.VALUES.DEFAULT_CHECKOUT_TIME}${ADD_PROGRAM_PAGE_TEXT.VALUES.TIMESTAMP_MILLIS_SUFFIX}` : programEndDateTime,
            bannerImageUrl: '',
            subProgramType: selectedProgramType?.subProgramType || ADD_PROGRAM_PAGE_TEXT.VALUES.SUB_PROGRAM_TYPE_HDB,
            bannerAnimationUrl: '',
            checkinEndsAt: formData.sessionsSchedule?.length > 0 && formData.sessionsSchedule?.[0]?.startDate ?
                `${formData.sessionsSchedule[0].startDate}T${formData.sessionsSchedule[0]?.checkinTime || ADD_PROGRAM_PAGE_TEXT.VALUES.DEFAULT_CHECKIN_TIME}${ADD_PROGRAM_PAGE_TEXT.VALUES.TIMESTAMP_MILLIS_SUFFIX}` : programStartDateTime,
            checkoutEndsAt: formData.sessionsSchedule?.length > 0 && formData.sessionsSchedule?.[0]?.endDate ?
                `${formData.sessionsSchedule[0].endDate}T${formData.sessionsSchedule[0]?.checkoutTime || ADD_PROGRAM_PAGE_TEXT.VALUES.DEFAULT_CHECKOUT_TIME}${ADD_PROGRAM_PAGE_TEXT.VALUES.TIMESTAMP_MILLIS_SUFFIX}` : programEndDateTime,
            logoUrl: '',
            groupedPrograms: formData.groupedPrograms,
            programSessions: formData.sessionsSchedule.map(session => ({
                name: session.name,
                code: `${session.name.replace(/\s+/g, '').toUpperCase()}`,
                number: session.number,
                startDate: format(new Date(session.startDate), "yyyy-MM-dd"),
                startTime: session.checkinTime || session.startTime,
                endDate: format(new Date(session.endDate), "yyyy-MM-dd"),
                endTime: session.checkoutTime || session.endTime,
                venue: formData.registrationSettings.venue,
                modeOfOperation: formData.modeOfOperation,
                status: ADD_PROGRAM_PAGE_TEXT.VALUES.STATUS_SCHEDULED,
                isActive: true,
            })),
            elderMinAge: 60,
            childMaxAge: 12,
            createdBy: userId,
            updatedBy: userId
        };


       try {
        const response = await postCall(`${endPoints.program}`, payload, PORTAL);
        if (response.status === 200 || response.status === 201 || response.status === 202) {
            setCurrentScreen(ADD_PROGRAM_PAGE_TEXT.SCREEN_STATES.SUCCESS);
        }
    } catch (error) {
        // Error creating program
    }

    };
    const handleSessionDateChange = (sessionIndex, field, value) => {
        const updatedSessions = [...formData.sessionsSchedule];
        updatedSessions[sessionIndex][field] = value;

        if (field === 'startDate' && value) {
            if (formData.modeOfOperation === ADD_PROGRAM_TEXT.MODE_OPTIONS.OFFLINE) {
                updatedSessions[sessionIndex].endDate = addDaysToDate(value, selectedProgramType?.maxSessionDurationDays || 1);
            } else {
                updatedSessions[sessionIndex].endDate = value;
            }
        }

        setFormData(prev => ({ ...prev, sessionsSchedule: updatedSessions }));
    };

    if (currentScreen === ADD_PROGRAM_PAGE_TEXT.SCREEN_STATES.SUCCESS) {
        return (
            <div className={styles.successContainer}>
                <div className={styles.successCard}>
                    <div className={styles.successCheckmark}>
                        {ADD_PROGRAM_TEXT.SUCCESS.CHECKMARK}
                    </div>
                    <h1 className={styles.successTitle}>
                        {ADD_PROGRAM_TEXT.SUCCESS.TITLE}
                    </h1>
                    <p className={styles.successMessage}>
                        {ADD_PROGRAM_TEXT.SUCCESS.MESSAGE(formData.programName)}
                    </p>
                    <button
                        onClick={() => {
                            setCurrentScreen(ADD_PROGRAM_PAGE_TEXT.SCREEN_STATES.PROGRAM_TYPES);
                            setSelectedProgramType(null);
                            setActiveStep(0);
                            setFormData({
                                programName: '',
                                programCode: '',
                                selectedSessions: [],
                                modeOfOperation: '',
                                isPaymentRequired: false,
                                isResidential: false,
                                isTravelInvolved: false,
                                programStartDate: '',
                                programStartTime: '',
                                programEndDate: '',
                                programEndTime: '',
                                helplineNumber: '',
                                emailSenderName: '',
                                venueNameInEmails: '',
                                totalBedCount: '',
                                paymentConfig: {
                                    basePrice: '',
                                    combinedPrice1: '',
                                    combinedPrice2: '',
                                    gstPercentage: 18,
                                    currency: 'INR'
                                },
                                taxConfig: {
                                    tdsPercent: 10,
                                    tdsApplicability: 'base_only',
                                    sgst: 9,
                                    cgst: 9,
                                    igst: 18,
                                    invoiceSenderName: '',
                                    pan: '',
                                    gstin: '',
                                    cin: '',
                                    invoiceAddress: ''
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
                                sessionsSchedule: [],
                                groupedPrograms: []
                            });
                        }}
                        className={styles.successButton}
                    >
                        {ADD_PROGRAM_TEXT.SUCCESS.BUTTON}
                    </button>
                </div>
            </div>
        );
    }

    if (currentScreen === ADD_PROGRAM_PAGE_TEXT.SCREEN_STATES.PROGRAM_TYPES) {
        return (
            <div className={styles.emptyContainer}>

            </div>
        );
    }

    return (
        <div className={styles.formContainer}>
            <div className={styles.formWrapper}>
                <div className={styles.stepperContainer}>
                    <div className={styles.stepperWrapper}>
                        {steps.map((step, index) => (
                            <div key={step} className={styles.stepItem}>
                                <div className={`${styles.stepCircle} ${index <= activeStep ? styles.active : styles.inactive}`}>
                                    {index + 1}
                                </div>
                                <span className={`${styles.stepLabel} ${index <= activeStep ? styles.active : styles.inactive}`}>
                                    {step}
                                </span>
                                {index < steps.length - 1 && (
                                    <div className={`${styles.stepLine} ${index < activeStep ? styles.active : styles.inactive}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.formContent}>
                    {activeStep === 0 ? (
                        <div>
                            <h2 className={styles.formTitle}>{ADD_PROGRAM_TEXT.STEPS.PROGRAM_BASICS}</h2>

                            <div className={styles.formField}>
                                <label className={styles.label}>
                                    {ADD_PROGRAM_TEXT.LABELS.PROGRAM_NAME}
                                </label>
                                <input
                                    type="text"
                                    value={formData.programName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, programName: e.target.value }))}
                                    className={`${styles.input} ${errors.programName ? styles.error : ''}`}
                                />
                                {errors.programName && (
                                    <span className={styles.errorText}>{errors.programName}</span>
                                )}
                            </div>

                            <div className={styles.formField}>
                                <label className={styles.label}>
                                    {ADD_PROGRAM_TEXT.LABELS.PROGRAM_CODE}
                                </label>
                                <input
                                    type="text"
                                    value={formData.programCode}
                                    onChange={(e) => setFormData(prev => ({ ...prev, programCode: e.target.value }))}
                                    className={`${styles.input} ${errors.programCode ? styles.error : ''}`}
                                />
                                {errors.programCode && (
                                    <span className={styles.errorText}>{errors.programCode}</span>
                                )}
                            </div>

                            <div className={styles.formField}>
                                <label className={styles.label}>
                                    Add description of the program
                                </label>
                                <textarea
                                    value={selectedProgramType?.description || ''}
                                    disabled
                                    rows={3}
                                    className={styles.textarea}
                                />
                            </div>

                            {selectedProgramType?.noOfSession > 0 && (
                                <div className={styles.formField}>
                                    <label className={styles.label}>
                                        {ADD_PROGRAM_TEXT.SECTIONS.SELECTED_SESSIONS}
                                    </label>
                                    <div className={styles.checkboxContainer}>
                                        {Array.from({ length: selectedProgramType?.noOfSession || 0 }, (_, i) => i + 1).map((sessionNum) => (
                                            <label key={sessionNum} className={styles.checkboxLabel}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.selectedSessions.includes(sessionNum)}
                                                    onChange={(e) => {
                                                        const updated = e.target.checked
                                                            ? [...formData.selectedSessions, sessionNum]
                                                            : formData.selectedSessions.filter(s => s !== sessionNum);
                                                        setFormData(prev => ({ ...prev, selectedSessions: updated }));
                                                    }}
                                                    className={styles.checkbox}
                                                />
                                                Session {sessionNum}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className={styles.formField}>
                                <label className={styles.label}>
                                    {ADD_PROGRAM_TEXT.LABELS.MODE_OF_OPERATION}
                                </label>
                                <div className={styles.checkboxContainer}>
                                    {[ADD_PROGRAM_TEXT.MODE_OPTIONS.ONLINE, ADD_PROGRAM_TEXT.MODE_OPTIONS.OFFLINE, ADD_PROGRAM_TEXT.MODE_OPTIONS.HYBRID].map((mode) => (
                                        <label key={mode} className={styles.checkboxLabel}>
                                            <input
                                                type="radio"
                                                name="modeOfOperation"
                                                value={mode}
                                                checked={formData.modeOfOperation === mode}
                                                onChange={(e) => setFormData(prev => ({ ...prev, modeOfOperation: e.target.value }))}
                                                className={styles.checkbox}
                                            />
                                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                        </label>
                                    ))}
                                </div>
                                {errors.modeOfOperation && (
                                    <span className={styles.errorText}>{errors.modeOfOperation}</span>
                                )}
                            </div>

                            <div className={styles.sessionFieldRow}>
                                <div className={styles.formField}>
                                    <label className={styles.label}>
                                        {ADD_PROGRAM_TEXT.LABELS.IS_RESIDENTIAL}
                                    </label>
                                    <div className={styles.checkboxContainer}>
                                        <label className={styles.checkboxLabel}>
                                            <input
                                                type="radio"
                                                name="isResidential"
                                                checked={formData.isResidential === true}
                                                onChange={() => setFormData(prev => ({ ...prev, isResidential: true }))}
                                                className={styles.checkbox}
                                            />
                                            Yes
                                        </label>
                                        <label className={styles.checkboxLabel}>
                                            <input
                                                type="radio"
                                                name="isResidential"
                                                checked={formData.isResidential === false}
                                                onChange={() => setFormData(prev => ({ ...prev, isResidential: false }))}
                                                className={styles.checkbox}
                                            />
                                            No
                                        </label>
                                    </div>
                                </div>

                                {formData.modeOfOperation === ADD_PROGRAM_TEXT.MODE_OPTIONS.OFFLINE && (
                                    <div className={styles.formField}>
                                        <label className={styles.label}>
                                            {ADD_PROGRAM_TEXT.LABELS.VENUE}
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.registrationSettings.venue}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                registrationSettings: { ...prev.registrationSettings, venue: e.target.value }
                                            }))}
                                            placeholder="Venue location"
                                            className={`${styles.input} ${errors.venue ? styles.error : ''}`}
                                        />
                                        {errors.venue && (
                                            <span className={styles.errorText}>{errors.venue}</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* {formData.isResidential && ( */}
                                <div className={styles.formField}>
                                    <label className={styles.label}>
                                        {ADD_PROGRAM_TEXT.LABELS.TOTAL_BED_COUNT}
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.totalBedCount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, totalBedCount: e.target.value }))}
                                        className={`${styles.input} ${errors.totalBedCount ? styles.error : ''}`}
                                        style={{ width: '200px' }}
                                    />
                                    {errors.totalBedCount && (
                                        <span className={styles.errorText}>{errors.totalBedCount}</span>
                                    )}
                                </div>
                            {/* )} */}

                            <div className={styles.formField}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={formData.isTravelInvolved}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isTravelInvolved: e.target.checked }))}
                                        className={styles.checkbox}
                                    />
                                    {ADD_PROGRAM_TEXT.LABELS.IS_TRAVEL_INVOLVED}
                                </label>
                            </div>

                            <div className={styles.formField}>
                                <label className={styles.label}>
                                    {ADD_PROGRAM_TEXT.LABELS.PROGRAM_DATES}
                                </label>
                                <div className={styles.sessionFieldRow}>
                                    <div>
                                        <label className={styles.label}>{ADD_PROGRAM_TEXT.LABELS.START_DATE}</label>
                                        <input
                                            type="date"
                                            value={formData.programStartDate}
                                            onChange={(e) => setFormData(prev => ({ ...prev, programStartDate: e.target.value }))}
                                            min={new Date().toISOString().split('T')[0]}
                                            className={`${styles.input} ${errors.programStartDate ? styles.error : ''}`}
                                        />
                                        {errors.programStartDate && (
                                            <span className={styles.errorText}>{errors.programStartDate}</span>
                                        )}
                                    </div>
                                    <div>
                                        <label className={styles.label}>{ADD_PROGRAM_TEXT.LABELS.START_TIME}</label>
                                        <input
                                            type="time"
                                            value={formData.programStartTime}
                                            onChange={(e) => setFormData(prev => ({ ...prev, programStartTime: e.target.value }))}
                                            className={`${styles.input} ${errors.programStartTime ? styles.error : ''}`}
                                        />
                                        {errors.programStartTime && (
                                            <span className={styles.errorText}>{errors.programStartTime}</span>
                                        )}
                                    </div>
                                    <div>
                                        <label className={styles.label}>{ADD_PROGRAM_TEXT.LABELS.END_DATE}</label>
                                        <input
                                            type="date"
                                            value={formData.programEndDate}
                                            onChange={(e) => setFormData(prev => ({ ...prev, programEndDate: e.target.value }))}
                                            min={formData.programStartDate || new Date().toISOString().split('T')[0]}
                                            className={`${styles.input} ${errors.programEndDate ? styles.error : ''}`}
                                        />
                                        {errors.programEndDate && (
                                            <span className={styles.errorText}>{errors.programEndDate}</span>
                                        )}
                                    </div>
                                    <div>
                                        <label className={styles.label}>{ADD_PROGRAM_TEXT.LABELS.END_TIME}</label>
                                        <input
                                            type="time"
                                            value={formData.programEndTime}
                                            onChange={(e) => setFormData(prev => ({ ...prev, programEndTime: e.target.value }))}
                                            className={`${styles.input} ${errors.programEndTime ? styles.error : ''}`}
                                        />
                                        {errors.programEndTime && (
                                            <span className={styles.errorText}>{errors.programEndTime}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.formField}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={formData.isPaymentRequired}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isPaymentRequired: e.target.checked }))}
                                        className={styles.checkbox}
                                    />
                                    {ADD_PROGRAM_TEXT.LABELS.IS_PAYMENT_REQUIRED}
                                </label>
                            </div>

                            {formData.isPaymentRequired && (
                                <div className={styles.sectionContainer}>
                                    <h3 className={styles.sectionHeader}>{ADD_PROGRAM_TEXT.SECTIONS.PAYMENT_CONFIGURATION}</h3>
                                    <div className={styles.sessionFieldRow}>
                                        {selectedProgramType?.name === PROGRAM_TYPE.HDB_MSD_LABEL ? (
                                            <>
                                                <div>
                                                    <label className={styles.label}>
                                                        {ADD_PROGRAM_TEXT.LABELS.FIRST_PRICE}
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={formData.paymentConfig.combinedPrice1}
                                                        onChange={(e) => setFormData(prev => ({
                                                            ...prev,
                                                            paymentConfig: { ...prev.paymentConfig, combinedPrice1: e.target.value }
                                                        }))}
                                                        className={`${styles.input} ${errors.combinedPrice1 ? styles.error : ''}`}
                                                    />
                                                    {errors.combinedPrice1 && (
                                                        <span className={styles.errorText}>{errors.combinedPrice1}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className={styles.label}>
                                                        {ADD_PROGRAM_TEXT.LABELS.SECOND_PRICE}
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={formData.paymentConfig.combinedPrice2}
                                                        onChange={(e) => setFormData(prev => ({
                                                            ...prev,
                                                            paymentConfig: { ...prev.paymentConfig, combinedPrice2: e.target.value }
                                                        }))}
                                                        className={`${styles.input} ${errors.combinedPrice2 ? styles.error : ''}`}
                                                    />
                                                    {errors.combinedPrice2 && (
                                                        <span className={styles.errorText}>{errors.combinedPrice2}</span>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <div>
                                                <label className={styles.label}>
                                                    {ADD_PROGRAM_TEXT.LABELS.PRICE}
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.paymentConfig.basePrice}
                                                    onChange={(e) => setFormData(prev => ({
                                                        ...prev,
                                                        paymentConfig: { ...prev.paymentConfig, basePrice: e.target.value }
                                                    }))}
                                                    className={`${styles.input} ${errors.basePrice ? styles.error : ''}`}
                                                />
                                                {errors.basePrice && (
                                                    <span className={styles.errorText}>{errors.basePrice}</span>
                                                )}
                                            </div>
                                        )}
                                        <div>
                                            <label className={styles.label}>{ADD_PROGRAM_TEXT.LABELS.GST_PERCENTAGE}</label>
                                            <input
                                                type="number"
                                                value={formData.paymentConfig.gstPercentage}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    paymentConfig: { ...prev.paymentConfig, gstPercentage: e.target.value }
                                                }))}
                                                className={styles.input}
                                            />
                                        </div>
                                        <div>
                                            <label className={styles.label}>{ADD_PROGRAM_TEXT.LABELS.CURRENCY}</label>
                                            <select
                                                value={formData.paymentConfig.currency}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    paymentConfig: { ...prev.paymentConfig, currency: e.target.value }
                                                }))}
                                                className={styles.select}
                                            >
                                                <option value={ADD_PROGRAM_TEXT.CURRENCY_OPTIONS.INR}>{ADD_PROGRAM_TEXT.CURRENCY_OPTIONS.INR}</option>
                                                <option value={ADD_PROGRAM_TEXT.CURRENCY_OPTIONS.USD}>{ADD_PROGRAM_TEXT.CURRENCY_OPTIONS.USD}</option>
                                                <option value={ADD_PROGRAM_TEXT.CURRENCY_OPTIONS.EUR}>{ADD_PROGRAM_TEXT.CURRENCY_OPTIONS.EUR}</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className={styles.sectionContainer}>
                                <h3 className={styles.sectionHeader}>{ADD_PROGRAM_TEXT.SECTIONS.REGISTRATION_SETTINGS}</h3>
                                <div className={styles.sessionFieldRow}>
                                    <div>
                                        <label className={styles.label}>
                                            {ADD_PROGRAM_TEXT.LABELS.REGISTRATION_START_DATE}
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.registrationSettings.startDate}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                registrationSettings: { ...prev.registrationSettings, startDate: e.target.value }
                                            }))}
                                            min={new Date().toISOString().split('T')[0]}
                                            className={`${styles.input} ${errors.registrationStartDate ? styles.error : ''}`}
                                        />
                                        {errors.registrationStartDate && (
                                            <span className={styles.errorText}>{errors.registrationStartDate}</span>
                                        )}
                                    </div>
                                    <div>
                                        <label className={styles.label}>
                                            {ADD_PROGRAM_TEXT.LABELS.REGISTRATION_START_TIME}
                                        </label>
                                        <input
                                            type="time"
                                            value={formData.registrationSettings.startTime}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                registrationSettings: { ...prev.registrationSettings, startTime: e.target.value }
                                            }))}
                                            className={`${styles.input} ${errors.registrationStartTime ? styles.error : ''}`}
                                        />
                                        {errors.registrationStartTime && (
                                            <span className={styles.errorText}>{errors.registrationStartTime}</span>
                                        )}
                                    </div>
                                    <div>
                                        <label className={styles.label}>
                                            {ADD_PROGRAM_TEXT.LABELS.REGISTRATION_END_DATE}
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.registrationSettings.endDate}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                registrationSettings: { ...prev.registrationSettings, endDate: e.target.value }
                                            }))}
                                            min={formData.registrationSettings.startDate || new Date().toISOString().split('T')[0]}
                                            className={`${styles.input} ${errors.registrationEndDate ? styles.error : ''}`}
                                        />
                                        {errors.registrationEndDate && (
                                            <span className={styles.errorText}>{errors.registrationEndDate}</span>
                                        )}
                                    </div>
                                    <div>
                                        <label className={styles.label}>
                                            {ADD_PROGRAM_TEXT.LABELS.REGISTRATION_END_TIME}
                                        </label>
                                        <input
                                            type="time"
                                            value={formData.registrationSettings.endTime}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                registrationSettings: { ...prev.registrationSettings, endTime: e.target.value }
                                            }))}
                                            className={`${styles.input} ${errors.registrationEndTime ? styles.error : ''}`}
                                        />
                                        {errors.registrationEndTime && (
                                            <span className={styles.errorText}>{errors.registrationEndTime}</span>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.checkboxGroup}>
                                    <label className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={formData.registrationSettings.requiresApproval}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                registrationSettings: { ...prev.registrationSettings, requiresApproval: e.target.checked }
                                            }))}
                                            className={styles.checkbox}
                                        />
                                        {ADD_PROGRAM_TEXT.LABELS.REQUIRES_APPROVAL}
                                    </label>

                                    <label className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={formData.registrationSettings.hasSeatsLimit}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                registrationSettings: { ...prev.registrationSettings, hasSeatsLimit: e.target.checked }
                                            }))}
                                            className={styles.checkbox}
                                        />
                                        {ADD_PROGRAM_TEXT.LABELS.HAS_SEAT_LIMIT}
                                    </label>
                                </div>

                                {formData.registrationSettings.hasSeatsLimit && (
                                    <div style={{ marginBottom: '16px' }}>
                                        <div className={styles.formField}>
                                            <label className={styles.label}>
                                                {ADD_PROGRAM_TEXT.LABELS.MAX_SEATS}
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.registrationSettings.maxSeats}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    registrationSettings: { ...prev.registrationSettings, maxSeats: e.target.value }
                                                }))}
                                                className={`${styles.input} ${errors.maxSeats ? styles.error : ''}`}
                                                style={{ width: '200px' }}
                                            />
                                            {errors.maxSeats && (
                                                <span className={styles.errorText}>{errors.maxSeats}</span>
                                            )}
                                        </div>

                                        <label className={styles.checkboxLabel} style={{ marginBottom: '12px' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.registrationSettings.hasWaitlist}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    registrationSettings: { ...prev.registrationSettings, hasWaitlist: e.target.checked }
                                                }))}
                                                className={styles.checkbox}
                                            />
                                            {ADD_PROGRAM_TEXT.LABELS.HAS_WAITLIST}
                                        </label>

                                        {formData.registrationSettings.hasWaitlist && (
                                            <div className={styles.formField}>
                                                <label className={styles.label}>
                                                    {ADD_PROGRAM_TEXT.LABELS.WAITLIST_TRIGGER_COUNT}
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.registrationSettings.waitlistTriggerCount}
                                                    onChange={(e) => setFormData(prev => ({
                                                        ...prev,
                                                        registrationSettings: { ...prev.registrationSettings, waitlistTriggerCount: e.target.value }
                                                    }))}
                                                    className={`${styles.input} ${errors.waitlistTriggerCount ? styles.error : ''}`}
                                                    style={{ width: '200px' }}
                                                />
                                                {errors.waitlistTriggerCount && (
                                                    <span className={styles.errorText}>{errors.waitlistTriggerCount}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className={styles.sessionFieldRow} style={{ marginBottom: '16px' }}>
                                    <div>
                                        <label className={styles.label}>
                                            {ADD_PROGRAM_TEXT.LABELS.HELPLINE_NUMBER}
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.helplineNumber}
                                            onChange={(e) => setFormData(prev => ({ ...prev, helplineNumber: e.target.value }))}
                                            placeholder="+91 98416 70000"
                                            className={`${styles.input} ${errors.helplineNumber ? styles.error : ''}`}
                                        />
                                        {errors.helplineNumber && (
                                            <span className={styles.errorText}>{errors.helplineNumber}</span>
                                        )}
                                    </div>

                                    <div>
                                        <label className={styles.label}>
                                            {ADD_PROGRAM_TEXT.LABELS.EMAIL_SENDER_NAME}
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.emailSenderName}
                                            onChange={(e) => setFormData(prev => ({ ...prev, emailSenderName: e.target.value }))}
                                            placeholder="hdb@infinitheism.com"
                                            className={`${styles.input} ${errors.emailSenderName ? styles.error : ''}`}
                                        />
                                        {errors.emailSenderName && (
                                            <span className={styles.errorText}>{errors.emailSenderName}</span>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.formField}>
                                    <label className={styles.label}>
                                        {ADD_PROGRAM_TEXT.LABELS.VENUE_NAME_IN_EMAILS}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.venueNameInEmails}
                                        onChange={(e) => setFormData(prev => ({ ...prev, venueNameInEmails: e.target.value }))}
                                        placeholder="Leonia Holistic Destination, Bommarasi"
                                        className={`${styles.input} ${errors.venueNameInEmails ? styles.error : ''}`}
                                    />
                                    {errors.venueNameInEmails && (
                                        <span className={styles.errorText}>{errors.venueNameInEmails}</span>
                                    )}
                                </div>

                                {formData.modeOfOperation === ADD_PROGRAM_TEXT.MODE_OPTIONS.OFFLINE && (
                                    <div className={styles.formField}>
                                        <label className={styles.label}>
                                            {ADD_PROGRAM_TEXT.LABELS.VENUE}
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.registrationSettings.venue}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                registrationSettings: { ...prev.registrationSettings, venue: e.target.value }
                                            }))}
                                            className={`${styles.input} ${errors.venue ? styles.error : ''}`}
                                        />
                                        {errors.venue && (
                                            <span className={styles.errorText}>{errors.venue}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h2 className={styles.formTitle}>{ADD_PROGRAM_TEXT.STEPS.SCHEDULES_LOGISTICS}</h2>
                            {formData.sessionsSchedule.map((session, index) => (
                                <div key={index} className={styles.sessionCard}>
                                    <h3 className={styles.sessionTitle}>{session.name}</h3>
                                    <div className={styles.sessionFieldRow}>
                                        <div>
                                            <label className={styles.label}>
                                                {ADD_PROGRAM_TEXT.LABELS.SESSION_START_DATE}
                                            </label>
                                            <input
                                                type="date"
                                                value={session.startDate}
                                                onChange={(e) => handleSessionDateChange(index, 'startDate', e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className={`${styles.input} ${errors[`session${index}StartDate`] ? styles.error : ''}`}
                                            />
                                            {errors[`session${index}StartDate`] && (
                                                <span className={styles.errorText}>{errors[`session${index}StartDate`]}</span>
                                            )}
                                        </div>
                                        <div>
                                            <label className={styles.label}>
                                                {ADD_PROGRAM_TEXT.LABELS.SESSION_END_DATE}
                                            </label>
                                            <input
                                                type="date"
                                                value={session.endDate}
                                                onChange={(e) => handleSessionDateChange(index, 'endDate', e.target.value)}
                                                min={session.startDate || new Date().toISOString().split('T')[0]}
                                                className={`${styles.input} ${errors[`session${index}EndDate`] ? styles.error : ''}`}
                                            />
                                            {errors[`session${index}EndDate`] && (
                                                <span className={styles.errorText}>{errors[`session${index}EndDate`]}</span>
                                            )}
                                        </div>
                                        {formData.modeOfOperation === ADD_PROGRAM_TEXT.MODE_OPTIONS.OFFLINE ? (
                                            <>
                                                <div>
                                                    <label className={styles.label}>
                                                        {ADD_PROGRAM_TEXT.LABELS.SESSION_CHECKIN_TIME}
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={session.checkinTime}
                                                        onChange={(e) => handleSessionDateChange(index, 'checkinTime', e.target.value)}
                                                        className={`${styles.input} ${errors[`session${index}CheckinTime`] ? styles.error : ''}`}
                                                    />
                                                    {errors[`session${index}CheckinTime`] && (
                                                        <span className={styles.errorText}>{errors[`session${index}CheckinTime`]}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className={styles.label}>
                                                        {ADD_PROGRAM_TEXT.LABELS.SESSION_CHECKOUT_TIME}
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={session.checkoutTime}
                                                        onChange={(e) => handleSessionDateChange(index, 'checkoutTime', e.target.value)}
                                                        className={`${styles.input} ${errors[`session${index}CheckoutTime`] ? styles.error : ''}`}
                                                    />
                                                    {errors[`session${index}CheckoutTime`] && (
                                                        <span className={styles.errorText}>{errors[`session${index}CheckoutTime`]}</span>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div>
                                                    <label className={styles.label}>
                                                        {ADD_PROGRAM_TEXT.LABELS.SESSION_START_TIME}
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={session.startTime}
                                                        onChange={(e) => handleSessionDateChange(index, 'startTime', e.target.value)}
                                                        className={`${styles.input} ${errors[`session${index}StartTime`] ? styles.error : ''}`}
                                                    />
                                                    {errors[`session${index}StartTime`] && (
                                                        <span className={styles.errorText}>{errors[`session${index}StartTime`]}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className={styles.label}>
                                                        {ADD_PROGRAM_TEXT.LABELS.SESSION_END_TIME}
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={session.endTime}
                                                        onChange={(e) => handleSessionDateChange(index, 'endTime', e.target.value)}
                                                        className={`${styles.input} ${errors[`session${index}EndTime`] ? styles.error : ''}`}
                                                    />
                                                    {errors[`session${index}EndTime`] && (
                                                        <span className={styles.errorText}>{errors[`session${index}EndTime`]}</span>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={styles.actionsFooter}>
                        <button
                            onClick={() => setCurrentScreen(ADD_PROGRAM_PAGE_TEXT.SCREEN_STATES.PROGRAM_TYPES)}
                            className={`${styles.button} ${styles.secondary}`}
                        >
                            {ADD_PROGRAM_TEXT.BUTTONS.BACK_TO_PROGRAM_TYPES}
                        </button>
                        <div className={styles.actionsRight}>
                            {activeStep > 0 && (
                                <button
                                    onClick={handleBack}
                                    className={`${styles.button} ${styles.secondary}`}
                                >
                                    {ADD_PROGRAM_TEXT.BUTTONS.BACK}
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                className={`${styles.button} ${styles.primary}`}
                            >
                                {activeStep === steps.length - 1 || selectedProgramType?.noOfSession === 0 ? ADD_PROGRAM_TEXT.BUTTONS.CREATE_PROGRAM : ADD_PROGRAM_TEXT.BUTTONS.NEXT}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddNewProgram





