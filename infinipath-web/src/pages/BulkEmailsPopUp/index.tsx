import { DialogActions, DialogTitle, FormControlLabel, IconButton, Typography } from "@mui/material";
import { Dialog, DialogContent, DialogFooter } from "../../components/components/ui/dialog";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Button } from "../../common/components/Button";
import { getCall, postCallWithLoader } from "../../services/apiService";
import Loader from "../../common/components/Loader";
import styles from "./index.module.scss";
import { BulkEmailsPopupProps, EmailTriggerOption, RadioType } from "./type";
import { BULKEMAIL, STATUS_CODES } from "../../constants/textConstants";
import DataGridWithPagination from "../../common/components/DataGridWithPagination";
import { endPoints, PORTAL } from "../../constants/urlConstants";
import emailIcon from '../../assets/images/emailIcon.svg';
import closeIcon from '../../assets/images/crossIconBlue.svg';
import CheckBoxChecked from "../../assets/images/checkBoxChecked.svg";
import CheckBoxUnchecked from "../../assets/images/checkboxUnchecked.svg";
import PartiallyChecked from "../../assets/images/partiallyChecked.svg";
import { notify } from "../../common/components/ToastMessage";
import Stack from "@mui/material/Stack";
import Grid2 from "@mui/material/Grid2";
import Card from "@mui/material/Card";


interface BulkEmailPayload {
    templateIds?: number[];
    programId?: number;
    subProgramId?: number;
    filters?: any;
    isTestMail?: boolean;
    userIds?: number[];
    selectionMode?: typeof BULKEMAIL.selectionModes.ALL | typeof BULKEMAIL.selectionModes.SELECTED | typeof BULKEMAIL.selectionModes.EXCLUDED;
    registrationIds?: number[];
    includeRM?: boolean;
}

const Radio = ({ value, checked, onChange, className = '' }: RadioType) => (
    <input
        type={BULKEMAIL.inputTypes.RADIO}
        value={value}
        checked={checked}
        onChange={onChange}
        className={`radio ${className}`}
    />
);

const BulkEmailsPopUp: React.FC<BulkEmailsPopupProps> = ({
    open,
    onClose,
    bulkEmailUrlData,
    headers = [],
    programKey,
    kpiFilter,
}) => {
    const [deselectedRows, setDeselectedRows] = useState<number[]>([]); // Track deselections instead of selections
    const [allSeenIds, setAllSeenIds] = useState<number[]>([]); // Track all IDs we've seen across pagination
    const [gridData, setGridData] = useState<any[]>([]);
    const [pageSize, setPageSize] = useState(100);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentStep, setCurrentStep] = useState(BULKEMAIL.SELECTION);
    const [templateData, setTemplateData] = useState<EmailTriggerOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTemplateKey, setSelectedTemplateKey] = useState('');
    const [selectedCommunicationTypes, setSelectedCommunicationTypes] = useState<string[]>([]);
    const [includeRM, setIncludeRM] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [uniqueCommunicationTypes, setUniqueCommunicationTypes] = useState<{type: string, templateId: number}[]>([]);

    // API to fetch all users and filter by userType 'Org'
    const fetchOrgMembers = useCallback(async () => {
        setIsLoading(true);
        try {
            const filters = encodeURIComponent(JSON.stringify({ userType: [BULKEMAIL.filters.USER_TYPE_ORG] }));
            const response = await getCall(`${endPoints.user}?limit=${pageSize}&offset=${(currentPage - 1) * pageSize}&filters=${filters}`, undefined, PORTAL);
            const allUsers = response.data?.data?.data || [];
            setGridData(allUsers);
            setTotalCount(response.data?.data?.pagination?.totalRecords || allUsers.length);
        } catch (error) {
            console.error(BULKEMAIL.messages.ERROR_FETCHING_TEST_USERS, error);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize]);

    const isSelectionStep = currentStep === BULKEMAIL.SELECTION;
    const isViewSeekersStep = currentStep === BULKEMAIL.VIEW_SEEKERS;
    const isTestEmailStep = currentStep === BULKEMAIL.TEST_COMMUNICATION;

    const selectedTemplate = useMemo(
        () => templateData.find(option => option.templateKey === selectedTemplateKey),
        [selectedTemplateKey, templateData]
    );

    // Helper function to check if a row has all communications sent
    const isRowNonSelectable = useCallback((row: any) => {
        if (!isViewSeekersStep || !row.communicationTracks || !selectedCommunicationTypes.length || !selectedTemplate) {
            return false;
        }
        
        // Get all communication tracks with success status
        const successfulTracks = row.communicationTracks.filter(
            (track: any) => track.stats === BULKEMAIL.statuses.SUCCESS
        );
        
        // Check if all selected communication types have successful tracks with matching template IDs
        return selectedCommunicationTypes.every(type => {
            const templateId = selectedTemplate.templateIds[type];
            if (!templateId) return false;
            
            // Check if there's a successful track with this specific template ID
            // Convert both to numbers for comparison since templateIds might be strings
            return successfulTracks.some((track: any) => 
                Number(track.templateId) === Number(templateId) && track.typ === type
            );
        });
    }, [isViewSeekersStep, selectedCommunicationTypes, selectedTemplate]);

    const buildBaseUrl = useCallback(() => {
        const params = new URLSearchParams({
            limit: pageSize.toString(),
            offset: ((currentPage - 1) * pageSize).toString(),
        });

        if (bulkEmailUrlData?.programId) {
            params.append(BULKEMAIL.params.PROGRAM_ID, String(bulkEmailUrlData.programId));
        }
        if (bulkEmailUrlData?.parentFilter) {
            params.append(BULKEMAIL.params.PARENT_FILTER, bulkEmailUrlData.parentFilter);
        }
        if (bulkEmailUrlData?.filters || selectedTemplate?.id) {
            // Clone the filters to avoid mutating the original
            const filters = { ...(bulkEmailUrlData?.filters || {}) };
            // Override numberOfHdbs to "=0" for first_timer template
            if (selectedTemplateKey === BULKEMAIL.templateKeys.HDB_FIRST_TIMER) {
                if(filters?.numberOfHdbs && filters?.numberOfHdbs!="=0") {
                    return "";
                }
                filters[BULKEMAIL.filterKeys.NUMBER_OF_HDBS] = BULKEMAIL.values.ZERO;
            }
            
            // Add templateIds to filters if a template is selected
            if (selectedTemplate?.id) {
                filters[BULKEMAIL.filterKeys.COMMUNICATION_TEMPLATE_IDS] = selectedCommunicationTypes.map(key => selectedTemplate.templateIds[key].toString());
            }
            
            params.append(BULKEMAIL.params.FILTERS, JSON.stringify(filters));
        }

        return `${endPoints.registeredSeekerList}?${params.toString()}`;
    }, [bulkEmailUrlData, currentPage, pageSize, selectedTemplateKey, selectedTemplate]);

    const fetchTemplates = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getCall(`communication/templates?&category=${kpiFilter}&programId=${bulkEmailUrlData.programId}`, undefined, PORTAL);
            if (response.data?.data) {
                setTemplateData(response.data.data.data || []);
            }
        } catch (error) {
            console.error(BULKEMAIL.messages.ERROR_FETCHING_COMMUNICATION_TEMPLATE, error);
        } finally {
            setIsLoading(false);
        }
    }, [kpiFilter, bulkEmailUrlData.programId]);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    useEffect(() => {
        setSelectedTemplateKey('');
        setSelectedCommunicationTypes([]);
        setCurrentStep(BULKEMAIL.SELECTION);
        setGridData([]);
        setCurrentPage(1);
        setPageSize(100);
        setDeselectedRows([]);
        setAllSeenIds([]);
    }, [kpiFilter, programKey]);

    const fetchSeekers = useCallback(async () => {
        if (!selectedTemplate) {
            return;
        }

        setIsLoading(true);
        try {
            const url = `${buildBaseUrl()}`;
            if(url){
                const response = await getCall(url, undefined, PORTAL);
                const data = response.data?.data?.data || [];
                setGridData(data);
                setTotalCount(response.data?.data?.pagination?.totalRecords);
                
                // Extract unique communication types with template IDs from all records
                const typesMap = new Map<string, {type: string, templateId: number}>();
                data.forEach((record: any) => {
                    if (record.communicationTracks && Array.isArray(record.communicationTracks)) {
                        record.communicationTracks.forEach((track: any) => {
                            if (track.typ && track.templateId) {
                                const key = `${track.typ}_${track.templateId}`;
                                if (!typesMap.has(key)) {
                                    typesMap.set(key, { type: track.typ, templateId: track.templateId });
                                }
                            }
                        });
                    }
                });
                setUniqueCommunicationTypes(Array.from(typesMap.values()));
            }
        } catch (error) {
            console.error(BULKEMAIL.messages.ERROR_FETCHING_SEEKERS, error);
        } finally {
            setIsLoading(false);
        }
    }, [buildBaseUrl, selectedTemplate]);

    // Fetch current page data
    useEffect(() => {
        if (isViewSeekersStep) {
            fetchSeekers();
        }
        if (isTestEmailStep) {
            fetchOrgMembers();
        }
    }, [fetchSeekers, isViewSeekersStep, isTestEmailStep, fetchOrgMembers, currentPage]);

    // Track all IDs we've seen across pagination
    useEffect(() => {
        if (gridData.length > 0 && (isViewSeekersStep || isTestEmailStep)) {
            const currentPageIds = gridData.map(row => row.id);
            setAllSeenIds(prev => {
                const combined = [...prev, ...currentPageIds];
                return Array.from(new Set(combined)); // Remove duplicates
            });
        }
    }, [gridData, isViewSeekersStep, isTestEmailStep]);

    const handleHeaderCheckboxClick = useCallback((allCurrentPageSelected: boolean, currentPageRowIds: number[], nonSelectableIds: number[]) => {
        if (allCurrentPageSelected) {
            // Deselect all selectable rows on current page - add them to deselected list
            const selectableIds = currentPageRowIds.filter(id => !nonSelectableIds.includes(id));
            setDeselectedRows(prev => Array.from(new Set([...prev, ...selectableIds])));
        } else {
            // Select all selectable rows on current page - remove them from deselected list
            const selectableIds = currentPageRowIds.filter(id => !nonSelectableIds.includes(id));
            setDeselectedRows(prev => prev.filter(id => !selectableIds.includes(id)));
        }
    }, []);

    const handleRowClick = useCallback((row: any) => {
        // Don't allow clicking on non-selectable rows
        if (isRowNonSelectable(row)) {
            return;
        }      
        const id = row.id;
        setDeselectedRows(prev =>
            prev.includes(id)
                ? prev.filter(rowId => rowId !== id) // Was deselected, now select it (remove from deselected list)
                : [...prev, id] // Was selected, now deselect it (add to deselected list)
        );
    }, [isRowNonSelectable]);

    // Create checkbox column with reusable logic
    const createCheckboxColumn = useCallback(() => {
        const currentPageRowIds = gridData.map(row => row.id);
        
        // Get non-selectable row IDs for current page
        const nonSelectableIds = gridData
            .filter(row => isRowNonSelectable(row))
            .map(row => row.id);
        
        // Get selectable row IDs (exclude non-selectable ones)
        const selectableRowIds = currentPageRowIds.filter(id => !nonSelectableIds.includes(id));
        
        // All selectable rows are selected if NONE of them are in the deselected list
        const allCurrentPageSelected =
            selectableRowIds.length > 0 &&
            selectableRowIds.every(id => !deselectedRows.includes(id));
        const isPartiallySelected = selectableRowIds?.length - deselectedRows?.length > 0 ;
        return {
            field: BULKEMAIL.fields.CHECKBOX,
            headerName: '',
            width: 50,
            sortable: false,
            filterable: false,
            renderHeader: () => (
                <div
                    className={styles.checkboxCellWrapper}
                    onClick={() => handleHeaderCheckboxClick(allCurrentPageSelected, currentPageRowIds, nonSelectableIds)}
                    title={allCurrentPageSelected ? BULKEMAIL.tooltipText.DESELECT_ALL : BULKEMAIL.tooltipText.SELECT_ALL}
                >
                    <input
                        type="checkbox"
                        checked={allCurrentPageSelected}
                        className={styles.hiddenCheckbox}
                        readOnly
                    />
                    <img
                        src={allCurrentPageSelected ? CheckBoxChecked : isPartiallySelected ? PartiallyChecked : CheckBoxUnchecked}
                        alt={allCurrentPageSelected ? BULKEMAIL.altText.CHECKED : BULKEMAIL.altText.UNCHECKED}
                        className={styles.customCheckbox}
                    />
                </div>
            ),
            renderCell: (params: any) => {
                const isNonSelectable = isRowNonSelectable(params.row);
                // Row is checked if it's NOT in the deselected list
                const isChecked = !deselectedRows.includes(params.row.id);
                
                return (
                    <div className={`${styles.checkboxCellWrapper} ${isNonSelectable ? styles.nonSelectableRow : styles.selectableRow}`}>
                        <input
                            type={BULKEMAIL.fields.CHECKBOX}
                            checked={isChecked}
                            className={styles.hiddenCheckbox}
                            readOnly
                            disabled={isNonSelectable}
                        />
                        <img
                            src={isChecked ? CheckBoxChecked : CheckBoxUnchecked}
                            alt={isChecked ? BULKEMAIL.altText.CHECKED : BULKEMAIL.altText.UNCHECKED}
                            className={`${styles.customCheckbox} ${isNonSelectable ? styles.nonSelectableCursor : styles.selectableCursor}`}
                        />
                    </div>
                );
            },
        };
    }, [gridData, deselectedRows, handleHeaderCheckboxClick, isRowNonSelectable]);

    // Org users grid headers
    const orgUserHeaders = useMemo(() => {
        return [
            createCheckboxColumn(),
            {
                field: BULKEMAIL.fields.ORG_USR_NAME,
                headerName: BULKEMAIL.tableHeaders.NAME,
                width: 180,
                sortable: false,
                filterable: false,
                renderCell: (params: any) => <span>{params.row.orgUsrName || BULKEMAIL.placeholders.EMPTY_VALUE}</span>,
            },
            {
                field: BULKEMAIL.fields.EMAIL,
                headerName: BULKEMAIL.tableHeaders.EMAIL,
                width: 220,
                sortable: false,
                filterable: false,
                renderCell: (params: any) => <span>{params.row.email || BULKEMAIL.placeholders.EMPTY_VALUE}</span>,
            },
            {
                field: BULKEMAIL.fields.PHONE_NUMBER,
                headerName: BULKEMAIL.tableHeaders.PHONE_NUMBER,
                width: 150,
                sortable: false,
                filterable: false,
                renderCell: (params: any) => <span>{params.row.phoneNumber || params.row.mobileNumber || BULKEMAIL.placeholders.EMPTY_VALUE}</span>,
            },
        ];
    }, [createCheckboxColumn]);

    // Handler for Test Mail button
    const handleTestEmailClick = useCallback(async () => {
        if (selectedCommunicationTypes.length === 0) {
            notify(BULKEMAIL.toastTitle, BULKEMAIL.toastMessage.NO_COMMUNICATION_TYPE, BULKEMAIL.toastType.WARNING);
            return;
        }
        setCurrentStep(BULKEMAIL.TEST_COMMUNICATION);
        setCurrentPage(1);
        setPageSize(100);
        setDeselectedRows([]);
        setAllSeenIds([]);
    }, [selectedCommunicationTypes]);

    // Memoized filteredHeaders for seekers view
    const filteredHeaders = useMemo(() => {
        if (!headers.length) {
            return [];
        }

        if (!isViewSeekersStep) {
            return headers.filter(header =>
                [BULKEMAIL.fields.SEEKER_NAME, BULKEMAIL.fields.BASIC_DETAILS, BULKEMAIL.fields.NUMBER_OF_HDBS, BULKEMAIL.fields.RM_CONTACT].includes(header.field)
            );
        }

        // Base columns
        const baseColumns = [
            createCheckboxColumn(),
            ...headers.filter(header =>
                [BULKEMAIL.fields.SEEKER_NAME, BULKEMAIL.fields.BASIC_DETAILS, BULKEMAIL.fields.NUMBER_OF_HDBS, BULKEMAIL.fields.RM_CONTACT].includes(header.field)
            ),
        ];
        
        // Add dynamic communication type columns
        const communicationColumns = uniqueCommunicationTypes.map(({type, templateId}) => ({
            field: `communication_${type}_${templateId}`,
            headerName: type.charAt(0).toUpperCase() + type.slice(1),
            width: 100,
            sortable: false,
            filterable: false,
            renderCell: (params: any) => {
                const tracks = params.row.communicationTracks || [];
                const hasSuccessfulTrack = tracks.some(
                    (track: any) => track.typ === type && track.templateId === templateId && track.stats === BULKEMAIL.statuses.SUCCESS
                );
                return (
                    <span className={hasSuccessfulTrack ? styles.communicationSent : ''}>{hasSuccessfulTrack ? BULKEMAIL.values.SENT : BULKEMAIL.values.DASH}</span>
                );
            },
        }));
        
        // Add mobile number column at the end
        const mobileColumn = {
            field: BULKEMAIL.fields.PHONE_NUMBER,
            headerName: BULKEMAIL.tableHeaders.MOBILE_NUMBER,
            width: 150,
            sortable: false,
            filterable: false,
            renderCell: (params: any) => (
                <span>{params.row.phoneNumber || params.row.mobileNumber || BULKEMAIL.placeholders.EMPTY_VALUE}</span>
            ),
        };

        return [...baseColumns, ...communicationColumns, mobileColumn];
    }, [headers, isViewSeekersStep, createCheckboxColumn, uniqueCommunicationTypes]);

    const handleBack = () => {
        setCurrentStep(BULKEMAIL.SELECTION);
        setCurrentPage(1);
        setPageSize(100);
    };

    const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newTemplateKey = event.target.value;
        setSelectedTemplateKey(newTemplateKey);
        
        // Auto-select all available communication types for this template
        const template = templateData.find(t => t.templateKey === newTemplateKey);
        if (template && template.templateIds) {
            setSelectedCommunicationTypes(Object.keys(template.templateIds));
        } else {
            setSelectedCommunicationTypes([]);
        }
        
        // Clear selection-related state when template changes
        setCurrentPage(1);
        setPageSize(100);
        setDeselectedRows([]);
        setAllSeenIds([]);
        setGridData([]);
        setTotalCount(0);
        setUniqueCommunicationTypes([]);
    };

    const handleCommunicationTypeChange = (type: string) => {
        setSelectedCommunicationTypes(prev => {
            if (prev.includes(type)) {
                return prev.filter(t => t !== type);
            } else {
                return [...prev, type];
            }
        });
    };

    const handleViewSeekersClick = () => {
        if (!selectedTemplate) {
            return;
        }
        if (selectedCommunicationTypes.length === 0) {
            notify(BULKEMAIL.toastTitle, BULKEMAIL.toastMessage.NO_COMMUNICATION_TYPE, BULKEMAIL.toastType.WARNING);
            return;
        }
        setCurrentStep(BULKEMAIL.VIEW_SEEKERS);
        setCurrentPage(1);
        setPageSize(100);
        setDeselectedRows([]);
        setAllSeenIds([]);
    };

    //to fetch all ids for bulk email when selected rows are less than deselected rows
    const fetchAllIDsForBulkEmail = async () => {
        const payload: BulkEmailPayload = {};
        try {
            const params: any = {
                limit: totalCount,
                offset: 0,
            };
            
            if (bulkEmailUrlData?.programId) {
                params[BULKEMAIL.params.PROGRAM_ID] = bulkEmailUrlData.programId;
            }
            if (bulkEmailUrlData?.parentFilter) {
                params[BULKEMAIL.params.PARENT_FILTER] = bulkEmailUrlData.parentFilter;
            }
            if (bulkEmailUrlData?.filters) {
                params[BULKEMAIL.params.FILTERS] = JSON.stringify(bulkEmailUrlData.filters);
            }                                    
            const paramsStr = new URLSearchParams(params).toString();
            const response = await getCall(`${endPoints.registeredSeekerList}?${paramsStr}`, undefined, PORTAL);
            const allData = response.data?.data?.data || [];
            const allIds = allData.map((row: any) => row.id);
            const selectedIds = allIds.filter((id: number) => !deselectedRows.includes(id));
            
            payload.selectionMode = BULKEMAIL.selectionModes.SELECTED;
            payload.registrationIds = selectedIds;
        } catch (error) {
            console.error(BULKEMAIL.messages.ERROR_FETCHING_ALL_IDS_SELECTED, error);
            throw error;
        }
        finally {
            setIsLoading(false);
        }
        return payload;
    }

    const handleSendMail = useCallback(async () => {
        if (!selectedTemplate) {
            return;
        }
        if (selectedCommunicationTypes.length === 0) {
            notify(BULKEMAIL.toastTitle, BULKEMAIL.toastMessage.NO_COMMUNICATION_TYPE, BULKEMAIL.toastType.WARNING);
            return;
        }
        
        // Check if there's any data in view seekers step
        if (isViewSeekersStep) {
            if (totalCount === 0) {
                notify(BULKEMAIL.toastTitle, BULKEMAIL.toastMessage.NO_SEEKERS_TO_SEND, BULKEMAIL.toastType.WARNING);
                return;
            }
            const selectedCount = totalCount - deselectedRows.length;
            if (selectedCount === 0) {
                notify(BULKEMAIL.toastTitle, BULKEMAIL.toastMessage.NO_SEEKERS_SELECTED, BULKEMAIL.toastType.WARNING);
                return;
            }
        }
        
        // Check if there's any data in test email step
        if (isTestEmailStep) {
            if (totalCount === 0) {
                notify(BULKEMAIL.toastTitle, BULKEMAIL.toastMessage.NO_TEST_USERS, BULKEMAIL.toastType.WARNING);
                return;
            }
            const selectedCount = totalCount - deselectedRows.length;
            if (selectedCount === 0) {
                notify(BULKEMAIL.toastTitle, BULKEMAIL.toastMessage.NO_TEST_USERS_SELECTED, BULKEMAIL.toastType.WARNING);
                return;
            }
        }
        
        setIsLoading(true);
        try {
            // Get template IDs based on selected communication types
            const templateIds = selectedCommunicationTypes
                .map(type => selectedTemplate.templateIds[type])
                .filter(id => id !== undefined)
                .map(id => Number(id));

            const basePayload: BulkEmailPayload = {
                templateIds: templateIds,
                includeRM: includeRM,
            };

            // Add programId if available
            if (bulkEmailUrlData?.programId) {
                basePayload.programId = bulkEmailUrlData.programId;
            }

            // Add subProgramId if available
            if (bulkEmailUrlData?.subProgramId) {
                basePayload.subProgramId = bulkEmailUrlData.subProgramId;
            }

            // Prepare filters with templateIds if a template is selected
            if (bulkEmailUrlData?.filters || selectedTemplate?.id) {
                const filters = { ...(bulkEmailUrlData?.filters || {}) };
                
                // Override numberOfHdbs to "=0" for first_timer template
                if (selectedTemplateKey === BULKEMAIL.templateKeys.HDB_FIRST_TIMER) {
                    filters[BULKEMAIL.filterKeys.NUMBER_OF_HDBS] = BULKEMAIL.values.ZERO;
                }
                
                basePayload.filters = filters;
            }

            if (isTestEmailStep) {
                // For test emails, always fetch all org user IDs and send the selected ones
                basePayload.isTestMail = true;
                
                try {
                    // Check if we already have all IDs tracked
                    const haveAllIds = allSeenIds.length === totalCount;
                    let selectedIds: number[];
                    
                    if (haveAllIds) {
                        // Use tracked IDs
                        selectedIds = allSeenIds.filter(id => !deselectedRows.includes(id));
                    } else {
                        // Fetch all org user IDs
                        const filters = encodeURIComponent(JSON.stringify({ [BULKEMAIL.apiFields.USER_TYPE]: BULKEMAIL.filterValues.USER_TYPE_ORG_ARRAY }));
                        const response = await getCall(`${endPoints.user}?limit=${totalCount}&offset=0&filters=${filters}`, undefined, PORTAL);
                        const allUsers = response.data?.data?.data || [];
                        const allIds = allUsers.map((row: any) => row.id);
                        selectedIds = allIds.filter((id: number) => !deselectedRows.includes(id));
                    }
                    
                    basePayload.registrationIds = selectedIds;
                } catch (error) {
                    console.error(BULKEMAIL.messages.ERROR_PREPARING_TEST_EMAIL_IDS, error);
                    setIsLoading(false);
                    throw error;
                }
            } else if (isViewSeekersStep) {
                // View Seekers step: Comprehensive payload optimization
                const deselectedCount = deselectedRows.length;
                const selectedCount = totalCount - deselectedCount;
                const threshold = BULKEMAIL.PAYLOAD_THRESHOLD;

                // Step 1: Check if all are selected
                if (deselectedCount === 0 && totalCount > 0) {
                    // All rows selected - use ALL mode with filters
                    basePayload.selectionMode = BULKEMAIL.selectionModes.ALL;
                } else {
                    // Step 2: Compare selected vs deselected counts with threshold
                    const selectedExceedsThreshold = selectedCount > threshold;
                    const deselectedExceedsThreshold = deselectedCount > threshold;

                    // Step 3: Check if both exceed threshold
                    if (selectedExceedsThreshold && deselectedExceedsThreshold) {
                        // Both exceed threshold - notify user to refine selection
                        notify(
                            BULKEMAIL.toastTitle,
                            `Cannot send emails. Please select ${threshold} or fewer recipients, or deselect ${threshold} or fewer recipients.`,
                            BULKEMAIL.toastType.WARNING
                        );
                        setIsLoading(false);
                        return;
                    } 
                    // Step 4: One or both are within threshold - choose the smaller one
                    else if (!selectedExceedsThreshold && !deselectedExceedsThreshold) {
                        // Both are within threshold - use the minimal one
                        if (selectedCount < deselectedCount) {
                            // Selected count is smaller - use SELECTED mode
                            // Check if we have all IDs in context already
                            const haveAllIds = allSeenIds.length === totalCount;
                            
                            if (haveAllIds) {
                                // We have all IDs - no API call needed!
                                const selectedIds = allSeenIds.filter(id => !deselectedRows.includes(id));
                                basePayload.selectionMode = BULKEMAIL.selectionModes.SELECTED;
                                basePayload.registrationIds = selectedIds;
                            } else {
                                // Need to fetch all IDs
                                const updatedPayload = await fetchAllIDsForBulkEmail();
                                basePayload.selectionMode = updatedPayload.selectionMode;
                                basePayload.registrationIds = updatedPayload.registrationIds;
                            }
                        } else {
                            // Deselected count is smaller or equal - use EXCLUDED mode
                            // No API call needed - we already have deselected IDs tracked
                            basePayload.selectionMode = BULKEMAIL.selectionModes.EXCLUDED;
                            basePayload.registrationIds = deselectedRows;
                        }
                    }
                    // Step 5: Only one exceeds threshold - use the one that doesn't exceed
                    else if (!selectedExceedsThreshold) {
                        // Selected is within threshold - use SELECTED mode
                        // Check if we have all IDs in context already
                        const haveAllIds = allSeenIds.length === totalCount;
                        
                        if (haveAllIds) {
                            // We have all IDs - no API call needed!
                            const selectedIds = allSeenIds.filter(id => !deselectedRows.includes(id));
                            basePayload.selectionMode = BULKEMAIL.selectionModes.SELECTED;
                            basePayload.registrationIds = selectedIds;
                        } else {
                            const updatedPayload = await fetchAllIDsForBulkEmail();
                            basePayload.selectionMode = updatedPayload.selectionMode;
                            basePayload.registrationIds = updatedPayload.registrationIds;
                        }
                    } else {
                        // Deselected is within threshold - use EXCLUDED mode
                        // No API call needed - we already have deselected IDs tracked
                        basePayload.selectionMode = BULKEMAIL.selectionModes.EXCLUDED;
                        basePayload.registrationIds = deselectedRows;
                    }
                }
            } else if (isSelectionStep) {
                // Selection step: Default "Send mail" button - use ALL mode with filters
                basePayload.selectionMode = BULKEMAIL.selectionModes.ALL;
            }

            const url = endPoints.sendBulkEmail;
            await postCallWithLoader(
                url, 
                basePayload, 
                PORTAL,
                "",
                {
                    onSuccess: {
                        title: BULKEMAIL.toastTitle,
                        message: BULKEMAIL.toastMessage.SUCCESS,
                        type: BULKEMAIL.toastType.SUCCESS
                    },
                    onError: {
                        title: BULKEMAIL.toastTitle,
                        message: BULKEMAIL.toastMessage.WARNING,
                        type: BULKEMAIL.toastType.WARNING
                    }
                }
            );
            
            // Notification is handled by apiService
            onClose();
        } catch (error: any) {
            console.error(BULKEMAIL.messages.ERROR_SENDING_BULK_EMAIL, error);
            // Error notification is handled by apiService
            onClose();
        } finally {
            setIsLoading(false);
        }
    }, [selectedTemplate, selectedCommunicationTypes, isTestEmailStep, isViewSeekersStep, isSelectionStep, deselectedRows, totalCount, bulkEmailUrlData, onClose]);

    // Footer button section
    const FooterButtonSection = useMemo(() => {
        const isCommunicationTypeSelected = selectedCommunicationTypes.length > 0;
        
        return (
            <div className={styles.footerButtonWrapper}>
                <Button 
                    onClick={handleSendMail} 
                    buttonClassName={styles.primaryButton} 
                    buttonTextClassName={styles.primaryButtonText} 
                    disable={!selectedTemplate || !isCommunicationTypeSelected}
                >
                    {BULKEMAIL.buttons.SEND_COMMUNICATION}
                </Button>
            </div>
        );
    }, [selectedTemplate, selectedCommunicationTypes.length, handleSendMail]);

    const renderSelectionOptions = () => {
        if (!templateData.length) {
            return (
                <div className={styles.emailIconWrapper}>
                    <img src={emailIcon} alt={BULKEMAIL.altText.EMAIL_ICON} className={styles.emailIcon} />
                </div>
            );
        }

        const selectedTemplate = templateData?.find((option) =>  selectedTemplateKey === option?.templateKey);
        const availableTypes = selectedTemplate?.templateIds ? Object.keys(selectedTemplate?.templateIds) : [];
        return (
            <>
                <div>
                    <Typography className={styles.selectionOptionsTitle}>{BULKEMAIL.SELECTION_OPTIONS_TITLE}</Typography>
                </div>
                
                {/* Template Selection Radio Buttons */}
                <Grid2 container className={styles.templateOptionsContainer} spacing={2}>
                    {templateData?.map((option) => {
                        const isSelected = selectedTemplateKey === option.templateKey;
                        return (
                            <Grid2 size={6} key={option.id}>
                                <FormControlLabel
                                    value={option.id}
                                    control={
                                        <Radio
                                            value={option.templateKey}
                                            checked={isSelected}
                                            onChange={handleRadioChange}
                                            className={styles.radioInput}
                                        />
                                    }
                                    label={option.templateName}
                                    className={styles.radioLabel}
                                />
                            </Grid2>
                        );
                    })}
                </Grid2>

                {/* Configuration Section */}
                {selectedTemplateKey && (
                    <Card elevation={0} className={styles.communicationModeArea} >
                        <Stack p={2} spacing={2}>
                            <Typography className={styles.configurationTitle}>{BULKEMAIL.CONFIGURATION}</Typography>
                            <div className={styles.configurationContent}>
                                <div className={styles.seekerCountSection}>
                                    <span className={styles.seekerCountText}>
                                        {BULKEMAIL.RECEIVERS_INFO}
                                    </span>
                                    <span 
                                        className={styles.viewSeekersLink}
                                        onClick={handleViewSeekersClick}
                                    >
                                        {BULKEMAIL.VIEW_SEEKERS_BUTTON}
                                    </span>
                                </div>
                                
                                <Grid2 container>
                                    {/* Email Checkbox */}
                                    {availableTypes?.includes(BULKEMAIL.communicationTypes.EMAIL_KEY) && <Grid2
                                        role="checkbox"
                                        size={3}
                                        onClick={() => handleCommunicationTypeChange(BULKEMAIL.communicationTypes.EMAIL_KEY)}
                                        className={styles.communicationOptionsWrapper}
                                    >
                                        <input
                                            type={BULKEMAIL.fields.CHECKBOX}
                                            checked={selectedCommunicationTypes.includes(BULKEMAIL.communicationTypes.EMAIL_KEY)}
                                            className={styles.hiddenCheckbox}
                                            readOnly
                                        />
                                        <img
                                            src={selectedCommunicationTypes.includes(BULKEMAIL.communicationTypes.EMAIL_KEY) ? CheckBoxChecked : CheckBoxUnchecked}
                                            alt={selectedCommunicationTypes.includes(BULKEMAIL.communicationTypes.EMAIL_KEY) ? BULKEMAIL.altText.CHECKED : BULKEMAIL.altText.UNCHECKED}
                                            className={styles.communicationTypeIcon}
                                        />
                                        <span>{BULKEMAIL.communicationTypes.EMAIL}</span>
                                    </Grid2>}

                                    {/* WhatsApp Checkbox */}
                                    {availableTypes?.includes(BULKEMAIL.communicationTypes.WHATSAPP_KEY) && <Grid2
                                        size={3}
                                        role="checkbox"
                                        onClick={() => handleCommunicationTypeChange(BULKEMAIL.communicationTypes.WHATSAPP_KEY)}
                                        className={styles.communicationOptionsWrapper}
                                    >
                                        <input
                                            type={BULKEMAIL.fields.CHECKBOX}
                                            checked={selectedCommunicationTypes.includes(BULKEMAIL.communicationTypes.WHATSAPP_KEY)}
                                            className={styles.hiddenCheckbox}
                                            readOnly
                                        />
                                        <img
                                            src={selectedCommunicationTypes.includes(BULKEMAIL.communicationTypes.WHATSAPP_KEY) ? CheckBoxChecked : CheckBoxUnchecked}
                                            alt={selectedCommunicationTypes.includes(BULKEMAIL.communicationTypes.WHATSAPP_KEY) ? BULKEMAIL.altText.CHECKED : BULKEMAIL.altText.UNCHECKED}
                                            className={styles.communicationTypeIcon}
                                        />
                                        <span>{BULKEMAIL.communicationTypes.WHATSAPP}</span>
                                    </Grid2>}

                                    {/* Include RMs Checkbox */}
                                    <Grid2
                                        size={3}
                                        role="checkbox"
                                        onClick={() => setIncludeRM(!includeRM)}
                                        className={styles.communicationOptionsWrapper}
                                    >
                                        <input
                                            type={BULKEMAIL.fields.CHECKBOX}
                                            checked={includeRM}
                                            className={styles.hiddenCheckbox}
                                            readOnly
                                        />
                                        <img
                                            src={includeRM ? CheckBoxChecked : CheckBoxUnchecked}
                                            alt={includeRM ? BULKEMAIL.altText.CHECKED : BULKEMAIL.altText.UNCHECKED}
                                            className={styles.communicationTypeIcon}
                                        />
                                        <span>{BULKEMAIL.INCLUDE_RM_LABEL}</span>
                                    </Grid2>
                                </Grid2>
                            </div>
                        </Stack>
                    </Card>
                )}
            </>
        );
    };

    // Dynamic DataGrid props based on view state
    const dataGridProps = useMemo(() => ({
        headers: isTestEmailStep ? orgUserHeaders : filteredHeaders,
        seekersData: gridData,
        totalData: totalCount,
        pageSize,
        setPageSize,
        currentPage,
        setCurrentPage,
        loading: isLoading,
        isheight: true,
        heightToApplyonGrid: BULKEMAIL.styles.GRID_HEIGHT,
        smallSize: true,
        onRowClick: handleRowClick,
    }), [isTestEmailStep, orgUserHeaders, filteredHeaders, gridData, totalCount, pageSize, currentPage, isLoading, handleRowClick]);

    // Memoized dialog header
    const DialogHeaderContent = useMemo(() => {
        const handleHeaderBack = () => {
            if (isTestEmailStep) {
                setCurrentStep(BULKEMAIL.SELECTION);
            } else {
                handleBack();
            }
        };

        const headerTitle = isTestEmailStep ? BULKEMAIL.headers.TEST_COMMUNICATION_USERS : BULKEMAIL.headers.SEEKERS_LIST;
        const headerWidthClass = isTestEmailStep ? styles.widthMedium : styles.widthSmall;
        const showHeader = isTestEmailStep || isViewSeekersStep;

        return (
            <DialogTitle className={styles.dialogHeader}>
                {showHeader ? (
                    <div className={styles.viewSeekersHeader}>
                        <IconButton onClick={handleHeaderBack}>
                            <ArrowLeft size={BULKEMAIL.sizes.ARROW_LEFT_SIZE} color={BULKEMAIL.colors.ARROW_LEFT_COLOR} />
                        </IconButton>
                        <Typography className={`${styles.styledDialogTitle} ${headerWidthClass}`}>{headerTitle}</Typography>
                    </div>
                ) : isSelectionStep && (
                    <Typography className={`${styles.styledDialogTitle} ${styles.widthLarge}`}>
                        {BULKEMAIL.headers.COMMUNICATION_TRIGGER}
                    </Typography>
                )}
                <hr className={styles.horizontalLine} />
                {isSelectionStep && !isTestEmailStep && <IconButton onClick={onClose}>
                    <img src={closeIcon} alt={BULKEMAIL.altText.CLOSE} className={styles.closeIcon} />
                </IconButton>}
            </DialogTitle>
        );
    }, [isTestEmailStep, isViewSeekersStep, isSelectionStep, currentStep, handleBack, onClose]);

    return (
        <div>
            <Dialog
                open={open}
                onOpenChange={onClose}
                onClose={onClose}
                className={styles.dialogContainer}
            >
                {DialogHeaderContent}
                <DialogContent 
                    className={styles.customDialogContent}
                    showCloseButton={false}
                >
                    {isLoading ? (
                        <div className={styles.loaderWrapper}>
                            <Loader type="small" />
                        </div>
                    ) : isTestEmailStep || isViewSeekersStep ? (
                        <>
                            <DataGridWithPagination {...dataGridProps} />
                            {FooterButtonSection}
                        </>
                    ) : isSelectionStep ? (
                        <>{renderSelectionOptions()}</>
                    ) : null
                    }
                </DialogContent>
                {!isViewSeekersStep && !isTestEmailStep && <DialogFooter className={styles.dialogFooter}>
                    {isSelectionStep && <DialogActions className={styles.dialogActions}>
                        <button onClick={onClose} className={styles.secondaryButton}>
                            {BULKEMAIL.CANCEL}
                        </button>
                        <button
                            onClick={handleTestEmailClick}
                            className={selectedTemplate ? styles.secondaryButton : styles.disabledButton}
                            disabled={!selectedTemplate}
                        >
                            {BULKEMAIL.buttons.TEST_MAIL}
                        </button>
                        <Button onClick={handleSendMail} buttonClassName={styles.primaryButton} buttonTextClassName={styles.primaryButtonText} disable={!selectedTemplate}>
                            {BULKEMAIL.buttons.SEND_COMMUNICATION}
                        </Button>
                    </DialogActions>}
                </DialogFooter>}
            </Dialog>
        </div>
    );
}
export default BulkEmailsPopUp;