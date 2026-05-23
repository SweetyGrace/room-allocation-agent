import React from "react";

interface MaskedPhoneNumberProps {
  phoneNumber: string;
  className?: string;
}

const PhoneNumberMasking: React.FC<MaskedPhoneNumberProps> = ({
  phoneNumber,
  className,
}) => {
  const maskPhoneNumber = (number: string) => {
    if (!number || number.length < 5) {
      return "";
    }
    const maskedSection = "X".repeat(number.length - 5);
    return `${number.slice(0, 2)}${maskedSection}${number.slice(-3)}`;
  };

  return <span className={className}>{maskPhoneNumber(phoneNumber)}</span>;
};

export default PhoneNumberMasking;