import React, {
  ChangeEvent,
  ClipboardEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./index.module.scss";

type InputProps = {
  length?: number;
  onComplete: (pin: string, isCompelte: boolean) => void;
  invalidOtp?: boolean;
  setOtpError?: (error: string) => void;
  className?: string;
};

const OtpFields: React.FC<InputProps> = ({
  length = 6,
  onComplete,
  invalidOtp,
  setOtpError = () => {},
  className,
}) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    setOtpError("");
    const { value } = e.target;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Automatically focus on the next input field when a digit is entered
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if all inputs are filled (OTP is complete)
    const isComplete = newOtp.every((digit) => digit !== "");

    // If OTP is complete, call the onComplete callback with the joined OTP value
    if (newOtp?.length === 6) {
      onComplete(newOtp.join(""), isComplete);
    } else {
      onComplete(newOtp.join(""), isComplete);
    }
  };

  const handleClick = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("Text").slice(0, length);
    const newOtp = Array(length).fill("");

    for (let i = 0; i < length; i++) {
      if (pasteData[i]) {
        newOtp[i] = pasteData[i];
      } else {
        break;
      }
    }
    setOtp(newOtp);

    // Focus the first empty input after paste
    const firstEmptyIndex = newOtp.indexOf("");
    if (firstEmptyIndex !== -1) {
      inputRefs.current[firstEmptyIndex]?.focus();
    } else {
      inputRefs.current[length - 1]?.focus();
    }
  };

  // Reset OTP fields on invalidOtp prop change
  useEffect(() => {
    if (invalidOtp) {
      setOtp(Array(length).fill(""));
      inputRefs.current[0]?.focus();
    }
  }, [invalidOtp, length]);

  return (
    <div
      className={`${styles.otpContainer} ${className || ""}`}
      data-testid="otp-fields"
    >
      {otp.map((value, index) => (
        <input
          key={index}
          type="password"
          ref={(input) => (inputRefs.current[index] = input)}
          value={value}
          onChange={(e) => handleChange(index, e)}
          onClick={() => handleClick(index)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={styles.otpInput}
          maxLength={1}
          data-testid={`otp-field-${index}`}
        />
      ))}
    </div>
  );
};

export default OtpFields;
