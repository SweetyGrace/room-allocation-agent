// src/components/InvoiceDetails/InvoiceDetails.tsx

import React from "react";
import styles from "./index.module.scss";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import CustomDropDown from "../../../common/components/CustomDropDown";
import { TDS_APPLICATION_OPTIONS } from "../../../constants/textConstants";

interface InvoiceDetailsProps {
  control: Control<any>;
  errors: FieldErrors<any>;
}

const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({
  control: _control,
  errors: _errors,
}) => {
  return (
    <div className={styles.invoiceDetails}>
      <div className={styles.sectionTitle}>Business tax information</div>

      <div className={styles.tdsRow}>
        <div className={styles.formGroup}>
          <label htmlFor="tdsLimit">TDS (%)</label>
          <Controller
            name="tdsLimit"
            control={_control}
            render={({ field }) => (
              <input
                {...field}
                id="tdsLimit"
                type="text"
                className={`${styles.inputField} ${_errors.tdsLimit ? styles.inputError : ""}`}
                placeholder="Enter TDS limit"
              />
            )}
          />
          {_errors.tdsLimit && (
            <span className={styles.errorText}>{_errors.tdsLimit.message}</span>
          )}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="tdsApplicableTo">TDS applicable to</label>
          <Controller
            name="tdsApplicableTo"
            control={_control}
            render={({ field }) => (
              <CustomDropDown
                value={field.value || ""}
                onChange={(val: string) => field.onChange(val)}
                options={TDS_APPLICATION_OPTIONS}
                placeholder="Select option"
                width={340}
                height={40}
                error={!!_errors.tdsApplicableTo}
                className={styles.selectFieldFixed}
              />
            )}
          />
          {_errors.tdsApplicableTo && (
            <span className={styles.errorText}>
              {_errors.tdsApplicableTo.message}
            </span>
          )}
        </div>
      </div>
      <div className={styles.tdsRow}>
        <div className={styles.formGroup}>
          <label htmlFor="sgstLimit">SGST (%)</label>
          <Controller
            name="sgstLimit"
            control={_control}
            render={({ field }) => (
              <input
                {...field}
                id="sgstLimit"
                type="text"
                className={`${styles.inputField} ${_errors.sgstLimit ? styles.inputError : ""}`}
                placeholder="Enter SGST limit"
              />
            )}
          />
          {_errors.sgstLimit && (
            <span className={styles.errorText}>
              {_errors.sgstLimit.message}
            </span>
          )}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="cgstLimit">CGST (%)</label>
          <Controller
            name="cgstLimit"
            control={_control}
            render={({ field }) => (
              <input
                {...field}
                id="cgstLimit"
                type="text"
                className={`${styles.inputField} ${_errors.cgstLimit ? styles.inputError : ""}`}
                placeholder="Enter CGST limit"
              />
            )}
          />
          {_errors.cgstLimit && (
            <span className={styles.errorText}>
              {_errors.cgstLimit.message}
            </span>
          )}
        </div>
      </div>
      <div className={styles.tdsRow}>
        <div className={styles.formGroup}>
          <label htmlFor="igstLimit">IGST (%)</label>
          <Controller
            name="igstLimit"
            control={_control}
            render={({ field }) => (
              <input
                {...field}
                id="igstLimit"
                type="text"
                className={`${styles.inputField} ${_errors.igstLimit ? styles.inputError : ""}`}
                placeholder="Enter IGST limit"
              />
            )}
          />
          {_errors.igstLimit && (
            <span className={styles.errorText}>
              {_errors.igstLimit.message}
            </span>
          )}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="nameInInvoice">Name in invoice</label>
          <Controller
            name="nameInInvoice"
            control={_control}
            render={({ field }) => (
              <input
                {...field}
                id="nameInInvoice"
                type="text"
                className={`${styles.inputField} ${_errors.nameInInvoice ? styles.inputError : ""}`}
                placeholder="Enter name"
              />
            )}
          />
          {_errors.nameInInvoice && (
            <span className={styles.errorText}>
              {_errors.nameInInvoice.message}
            </span>
          )}
        </div>
      </div>
      <br></br>
      <div className={styles.tdsRow}>
        <div className={styles.formGroup}>
          <label htmlFor="pan">PAN</label>
          <Controller
            name="pan"
            control={_control}
            render={({ field }) => (
              <input
                {...field}
                id="pan"
                type="text"
                className={`${styles.inputField} ${_errors.pan ? styles.inputError : ""}`}
                placeholder="Enter PAN"
              />
            )}
          />
          {_errors.pan && (
            <span className={styles.errorText}>{_errors.pan.message}</span>
          )}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="gstin">GSTIN</label>
          <Controller
            name="gstin"
            control={_control}
            render={({ field }) => (
              <input
                {...field}
                id="gstin"
                type="text"
                className={`${styles.inputField} ${_errors.gstin ? styles.inputError : ""}`}
                placeholder="Enter GSTIN"
              />
            )}
          />
          {_errors.gstin && (
            <span className={styles.errorText}>{_errors.gstin.message}</span>
          )}
        </div>
      </div>
      <br></br>
      <div className={styles.tdsRow}>
        <div className={styles.formGroup}>
          <label htmlFor="cin">CIN</label>
          <Controller
            name="cin"
            control={_control}
            render={({ field }) => (
              <input
                {...field}
                id="cin"
                type="text"
                className={`${styles.inputField} ${_errors.cin ? styles.inputError : ""}`}
                placeholder="Enter CIN"
              />
            )}
          />
          {_errors.cin && (
            <span className={styles.errorText}>{_errors.cin.message}</span>
          )}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="address">Address</label>
          <Controller
            name="address"
            control={_control}
            render={({ field }) => (
              <textarea
                {...field}
                id="address"
                className={`${styles.inputField} ${_errors.address ? styles.inputError : ""}`}
                placeholder="Enter address"
                rows={3}
              />
            )}
          />
          {_errors.address && (
            <span className={styles.errorText}>{_errors.address.message}</span>
          )}
        </div>
      </div>
      <br></br>
    </div>
  );
};

export default InvoiceDetails;
// Generated by Copilot
