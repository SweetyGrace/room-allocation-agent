
import { useState, useRef, useEffect } from 'react';
import { SubProgram } from '../types/program';
import { getInitialSubPrograms, prefillSubProgramFields } from '../utils/programUtils';

interface UseSubProgramsProps {
  programDescription: string;
  uploadedBanner: File | null;
  modeOfProgram: 'online' | 'offline' | 'hybrid';
  selectedCurrency: string;
  isPaymentRequired: 'yes' | 'no';
}

export const useSubPrograms = ({
  programDescription,
  uploadedBanner,
  modeOfProgram,
  selectedCurrency,
  isPaymentRequired
}: UseSubProgramsProps) => {
  const [subPrograms, setSubPrograms] = useState<SubProgram[]>(getInitialSubPrograms());
  const subProgramRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    // Handle highlight phases with fade effects
    const highlightedSubProgram = subPrograms.find(sp => sp.isHighlighted);
    
    if (highlightedSubProgram) {
      // Start with fade-in
      setSubPrograms(prev => prev.map(sp => 
        sp.id === highlightedSubProgram.id 
          ? { ...sp, highlightPhase: 'fade-in' } 
          : sp
      ));

      // Transition to visible after 200ms
      const visibleTimer = setTimeout(() => {
        setSubPrograms(prev => prev.map(sp => 
          sp.id === highlightedSubProgram.id 
            ? { ...sp, highlightPhase: 'visible' } 
            : sp
        ));
      }, 200);

      // Start fade-out after 800ms
      const fadeOutTimer = setTimeout(() => {
        setSubPrograms(prev => prev.map(sp => 
          sp.id === highlightedSubProgram.id 
            ? { ...sp, highlightPhase: 'fade-out' } 
            : sp
        ));
      }, 800);

      // Complete fade-out and remove highlight after 1200ms total
      const completeTimer = setTimeout(() => {
        setSubPrograms(prev => prev.map(sp => 
          sp.id === highlightedSubProgram.id 
            ? { ...sp, isHighlighted: false, highlightPhase: undefined } 
            : sp
        ));
      }, 1200);

      return () => {
        clearTimeout(visibleTimer);
        clearTimeout(fadeOutTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [subPrograms.some(sp => sp.isHighlighted)]);

  const handleAddSubProgram = () => {
    const newSubProgram: SubProgram = prefillSubProgramFields(
      {
        id: Date.now().toString(),
        title: `Sub-Program ${subPrograms.length + 1}`,
        description: '',
        modeOfProgram: 'online',
        venueAddress: [],
        customVenue: '',
        isPaymentRequired: 'yes',
        currency: 'INR',
        programFee: '',
        isHighlighted: true,
        showCustomVenue: false,
      },
      programDescription,
      uploadedBanner,
      modeOfProgram,
      selectedCurrency,
      isPaymentRequired
    );
    
    setSubPrograms(prev => [...prev, newSubProgram]);
    
    // Scroll to new subprogram with faster timing
    setTimeout(() => {
      const element = subProgramRefs.current[newSubProgram.id];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

  const handleSubProgramChange = (subProgramId: string, field: keyof SubProgram, value: any) => {
    setSubPrograms(prev => prev.map(sp => 
      sp.id === subProgramId ? { ...sp, [field]: value } : sp
    ));
  };

  const handleSubProgramVenueChange = (subProgramId: string, venues: string[]) => {
    if (venues.includes('Add Custom Venue')) {
      handleSubProgramChange(subProgramId, 'showCustomVenue', true);
      const filteredVenues = venues.filter(v => v !== 'Add Custom Venue');
      handleSubProgramChange(subProgramId, 'venueAddress', filteredVenues);
    } else {
      handleSubProgramChange(subProgramId, 'showCustomVenue', false);
      handleSubProgramChange(subProgramId, 'venueAddress', venues);
    }
  };

  const handleSubProgramBannerUpload = (subProgramId: string, file: File | null) => {
    handleSubProgramChange(subProgramId, 'banner', file);
  };

  const handleDeleteSubProgram = (subProgramId: string) => {
    setSubPrograms(prev => prev.filter(sp => sp.id !== subProgramId));
  };

  return {
    subPrograms,
    subProgramRefs,
    handleAddSubProgram,
    handleSubProgramChange,
    handleSubProgramVenueChange,
    handleSubProgramBannerUpload,
    handleDeleteSubProgram
  };
};
