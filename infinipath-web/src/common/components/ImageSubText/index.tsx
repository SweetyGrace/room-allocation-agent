import React from 'react';
import styles from './index.module.scss';
import { colorizeMahatriaInfinitheism } from '../ColorizeMahatriaInfinitheism';

interface ImageSubTextProps {
    selectedImageSrc: string;
    unselectedImageSrc?: string;
    text: string;
    isSelected?: boolean; 
    imageContainerClass?: string;
    imageClass?: string;
    textClass?: string;
    containerClass?: string;
}

const ImageSubText: React.FC<ImageSubTextProps> = ({ 
    selectedImageSrc, 
    unselectedImageSrc, 
    text, 
    isSelected = false,
    imageContainerClass = '',
    containerClass= '',
    imageClass = '', 
    textClass = '' 
}) => {
    return (
        <div className={`${styles.container} ${containerClass}`}>
            <div className={`${styles.imageContainer} ${imageContainerClass}`}>
                <img 
                    src={isSelected ? selectedImageSrc : (unselectedImageSrc || selectedImageSrc)} 
                    alt={`${text} ${isSelected ? 'selected' : 'unselected'}`} 
                    className={`${styles.image} ${imageClass}`} 
                />
            </div>
           <p className={`${styles.subtext} ${textClass}`}>{colorizeMahatriaInfinitheism(text)}</p>
        </div>
    );
};

export default ImageSubText;
