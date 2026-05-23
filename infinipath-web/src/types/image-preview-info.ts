export interface ImagePreviewProps {
    imageUrl: string;
    altText: string;
    setOpen: (open: boolean) => void; 
    isOpen: boolean;
    width?: string | number;
    height?: string | number;
}