import { useEffect } from 'react';
import { Path } from 'react-hook-form';
import { FORM_FIELD_NAMES } from '../constants/textConstants';
import { CrossFieldDateValidationOptions } from '../types/dynamicForm';

// Re-validates dependent date fields when their source date OR time changes.
// Only triggers if the dependent field already has a value to avoid premature errors.
export const useCrossFieldDateValidation = <T extends object>({
  watch,
  trigger,
}: CrossFieldDateValidationOptions<T>) => {
  const startDate = watch(FORM_FIELD_NAMES.START_DATE as Path<T>);
  const startTime = watch(FORM_FIELD_NAMES.START_TIME as Path<T>);
  const endDate = watch(FORM_FIELD_NAMES.END_DATE as Path<T>);
  const endTime = watch(FORM_FIELD_NAMES.END_TIME as Path<T>);
  const registrationStartDateValue = watch(FORM_FIELD_NAMES.REGISTRATION_START_DATE as Path<T>);
  const registrationStartTime = watch(FORM_FIELD_NAMES.REGISTRATION_START_TIME as Path<T>);
  const registrationEndTime = watch(FORM_FIELD_NAMES.REGISTRATION_END_TIME as Path<T>);
  const checkinAtValue = watch(FORM_FIELD_NAMES.CHECKIN_AT as Path<T>);
  const checkinAtTime = watch(FORM_FIELD_NAMES.CHECKIN_AT_TIME as Path<T>);
  const checkinEndsAtTime = watch(FORM_FIELD_NAMES.CHECKIN_ENDS_AT_TIME as Path<T>);
  const checkoutAtValue = watch(FORM_FIELD_NAMES.CHECKOUT_AT as Path<T>);
  const checkoutAtTime = watch(FORM_FIELD_NAMES.CHECKOUT_AT_TIME as Path<T>);
  const checkoutEndsAtTime = watch(FORM_FIELD_NAMES.CHECKOUT_ENDS_AT_TIME as Path<T>);

  // startDate/startTime → re-validate endDate and registrationStartDate
  useEffect(() => {
    if (!startDate) return;
    if (endDate) trigger(FORM_FIELD_NAMES.END_DATE as Path<T>);
    if (registrationStartDateValue) trigger(FORM_FIELD_NAMES.REGISTRATION_START_DATE as Path<T>);
  }, [startDate, startTime]); // eslint-disable-line react-hooks/exhaustive-deps

  // endTime → re-validate endDate (its same-day test reads endTime)
  useEffect(() => {
    if (endDate && endTime) trigger(FORM_FIELD_NAMES.END_DATE as Path<T>);
  }, [endTime]); // eslint-disable-line react-hooks/exhaustive-deps

  // registrationStartDate/registrationStartTime → re-validate registrationEndDate
  useEffect(() => {
    if (!registrationStartDateValue) return;
    const regEndDate = watch(FORM_FIELD_NAMES.REGISTRATION_END_DATE as Path<T>);
    if (regEndDate) trigger(FORM_FIELD_NAMES.REGISTRATION_END_DATE as Path<T>);
  }, [registrationStartDateValue, registrationStartTime]); // eslint-disable-line react-hooks/exhaustive-deps

  // registrationEndTime → re-validate registrationEndDate (its same-day test reads registrationEndTime)
  useEffect(() => {
    const regEndDate = watch(FORM_FIELD_NAMES.REGISTRATION_END_DATE as Path<T>);
    if (regEndDate && registrationEndTime) trigger(FORM_FIELD_NAMES.REGISTRATION_END_DATE as Path<T>);
  }, [registrationEndTime]); // eslint-disable-line react-hooks/exhaustive-deps

  // checkinAt/checkinAtTime → re-validate checkinEndsAt and checkoutAt
  useEffect(() => {
    if (!checkinAtValue) return;
    const checkinEndsAt = watch(FORM_FIELD_NAMES.CHECKIN_ENDS_AT as Path<T>);
    if (checkinEndsAt) trigger(FORM_FIELD_NAMES.CHECKIN_ENDS_AT as Path<T>);
    if (checkoutAtValue) trigger(FORM_FIELD_NAMES.CHECKOUT_AT as Path<T>);
  }, [checkinAtValue, checkinAtTime]); // eslint-disable-line react-hooks/exhaustive-deps

  // checkinEndsAtTime → re-validate checkinEndsAt (its same-day test reads checkinEndsAtTime)
  useEffect(() => {
    const checkinEndsAt = watch(FORM_FIELD_NAMES.CHECKIN_ENDS_AT as Path<T>);
    if (checkinEndsAt && checkinEndsAtTime) trigger(FORM_FIELD_NAMES.CHECKIN_ENDS_AT as Path<T>);
  }, [checkinEndsAtTime]); // eslint-disable-line react-hooks/exhaustive-deps

  // checkoutAtTime → re-validate checkoutAt (its same-day test reads checkoutAtTime)
  useEffect(() => {
    if (checkoutAtValue && checkoutAtTime) trigger(FORM_FIELD_NAMES.CHECKOUT_AT as Path<T>);
  }, [checkoutAtTime]); // eslint-disable-line react-hooks/exhaustive-deps

  // checkoutAt/checkoutAtTime → re-validate checkoutEndsAt
  useEffect(() => {
    if (!checkoutAtValue) return;
    const checkoutEndsAt = watch(FORM_FIELD_NAMES.CHECKOUT_ENDS_AT as Path<T>);
    if (checkoutEndsAt) trigger(FORM_FIELD_NAMES.CHECKOUT_ENDS_AT as Path<T>);
  }, [checkoutAtValue, checkoutAtTime]); // eslint-disable-line react-hooks/exhaustive-deps

  // checkoutEndsAtTime → re-validate checkoutEndsAt (its same-day test reads checkoutEndsAtTime)
  useEffect(() => {
    const checkoutEndsAt = watch(FORM_FIELD_NAMES.CHECKOUT_ENDS_AT as Path<T>);
    if (checkoutEndsAt && checkoutEndsAtTime) trigger(FORM_FIELD_NAMES.CHECKOUT_ENDS_AT as Path<T>);
  }, [checkoutEndsAtTime]); // eslint-disable-line react-hooks/exhaustive-deps
};
