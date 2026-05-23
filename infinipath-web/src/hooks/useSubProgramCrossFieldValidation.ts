import { useEffect } from 'react';
import { FORM_FIELD_NAMES, MODE_OF_PROGRAM_VALUES, YES_NO_VALUES } from '../constants/textConstants';
import { SubProgramCrossFieldValidationOptions } from '../types/dynamicForm';

export const useSubProgramCrossFieldValidation = ({ watch, trigger, index }: SubProgramCrossFieldValidationOptions) => {
  const base = `${FORM_FIELD_NAMES.SUB_PROGRAMS}.${index}`;
  const field = (name: string) => `${base}.${name}` as any;

  const startsAt = watch(field(FORM_FIELD_NAMES.STARTS_AT));
  const startsAtTime = watch(field(FORM_FIELD_NAMES.STARTS_AT_TIME));
  const endsAtTime = watch(field(FORM_FIELD_NAMES.ENDS_AT_TIME));
  const checkinAt = watch(field(FORM_FIELD_NAMES.CHECKIN_AT));
  const checkinAtTime = watch(field(FORM_FIELD_NAMES.CHECKIN_AT_TIME));
  const checkinEndsAtTime = watch(field(FORM_FIELD_NAMES.CHECKIN_ENDS_AT_TIME));
  const checkoutAt = watch(field(FORM_FIELD_NAMES.CHECKOUT_AT));
  const checkoutAtTime = watch(field(FORM_FIELD_NAMES.CHECKOUT_AT_TIME));
  const checkoutEndsAtTime = watch(field(FORM_FIELD_NAMES.CHECKOUT_ENDS_AT_TIME));
  const modeOfOperation = watch(field(FORM_FIELD_NAMES.MODE_OF_OPERATION));
  const hasCheckinCheckout = watch(field(FORM_FIELD_NAMES.HAS_CHECKIN_CHECKOUT));

  const isCheckinVisible =
    modeOfOperation === MODE_OF_PROGRAM_VALUES.OFFLINE &&
    hasCheckinCheckout === YES_NO_VALUES.YES;

  // startsAt/startsAtTime → re-validate endsAt
  useEffect(() => {
    if (!startsAt) return;
    if (watch(field(FORM_FIELD_NAMES.ENDS_AT))) trigger(field(FORM_FIELD_NAMES.ENDS_AT));
  }, [startsAt, startsAtTime]); // eslint-disable-line react-hooks/exhaustive-deps

  // endsAtTime → re-validate endsAt (its same-day test reads endsAtTime)
  useEffect(() => {
    if (watch(field(FORM_FIELD_NAMES.ENDS_AT))) trigger(field(FORM_FIELD_NAMES.ENDS_AT));
  }, [endsAtTime]); // eslint-disable-line react-hooks/exhaustive-deps

  // checkinAt/checkinAtTime → re-validate checkinEndsAt and checkoutAt
  useEffect(() => {
    if (!isCheckinVisible || !checkinAt) return;
    if (watch(field(FORM_FIELD_NAMES.CHECKIN_ENDS_AT))) trigger(field(FORM_FIELD_NAMES.CHECKIN_ENDS_AT));
    if (watch(field(FORM_FIELD_NAMES.CHECKOUT_AT))) trigger(field(FORM_FIELD_NAMES.CHECKOUT_AT));
  }, [checkinAt, checkinAtTime, isCheckinVisible]); // eslint-disable-line react-hooks/exhaustive-deps

  // checkinEndsAtTime → re-validate checkinEndsAt (its same-day test reads checkinEndsAtTime)
  useEffect(() => {
    if (!isCheckinVisible) return;
    if (watch(field(FORM_FIELD_NAMES.CHECKIN_ENDS_AT))) trigger(field(FORM_FIELD_NAMES.CHECKIN_ENDS_AT));
  }, [checkinEndsAtTime, isCheckinVisible]); // eslint-disable-line react-hooks/exhaustive-deps

  // checkoutAtTime → re-validate checkoutAt (its same-day test reads checkoutAtTime)
  useEffect(() => {
    if (!isCheckinVisible) return;
    if (watch(field(FORM_FIELD_NAMES.CHECKOUT_AT))) trigger(field(FORM_FIELD_NAMES.CHECKOUT_AT));
  }, [checkoutAtTime, isCheckinVisible]); // eslint-disable-line react-hooks/exhaustive-deps

  // checkoutAt/checkoutAtTime → re-validate checkoutEndsAt
  useEffect(() => {
    if (!isCheckinVisible || !checkoutAt) return;
    if (watch(field(FORM_FIELD_NAMES.CHECKOUT_ENDS_AT))) trigger(field(FORM_FIELD_NAMES.CHECKOUT_ENDS_AT));
  }, [checkoutAt, checkoutAtTime, isCheckinVisible]); // eslint-disable-line react-hooks/exhaustive-deps

  // checkoutEndsAtTime → re-validate checkoutEndsAt (its same-day test reads checkoutEndsAtTime)
  useEffect(() => {
    if (!isCheckinVisible) return;
    if (watch(field(FORM_FIELD_NAMES.CHECKOUT_ENDS_AT))) trigger(field(FORM_FIELD_NAMES.CHECKOUT_ENDS_AT));
  }, [checkoutEndsAtTime, isCheckinVisible]); // eslint-disable-line react-hooks/exhaustive-deps
};
