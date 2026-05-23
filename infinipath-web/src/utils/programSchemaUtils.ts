import * as yup from 'yup';
import {
  ADD_PROGRAM_PAGE_TEXT,
  FIELD_TYPES,
  FIELD_VALIDATION_MESSAGES,
  FORM_FIELD_NAMES,
  MODE_OF_PROGRAM_VALUES,
  PROGRAM_STRUCTURE_VALUES,
  PROGRAM_TYPE_NAMES,
  YES_NO_VALUES,
  CODE_FORMAT_REGEX,
  YUP_TEST_IDS,
} from '../constants/textConstants';
import { isSameDayDate, isTimeAfter } from './validationUtils';

const { VALIDATION } = ADD_PROGRAM_PAGE_TEXT;

// Wraps a base yup schema with visibility-aware required validation.
// Fields hidden by visibleWhen/visibleWhenAll are made optional so they
// don't block form submission when not rendered.
const applyCondition = (base: any, field: any, requiredMsg: string) => {
  if (field.visibleWhen) {
    return base.when(field.visibleWhen.field, {
      is: (val: any) => field.visibleWhen.values.includes(val),
      then: (s: any) => s.required(requiredMsg),
      otherwise: (s: any) => s.optional().nullable(),
    });
  }
  if (field.visibleWhenAll?.length) {
    const condFields = field.visibleWhenAll.map((c: any) => c.field);
    return base.when(condFields, {
      is: (...vals: any[]) => field.visibleWhenAll.every((cond: any, i: number) => cond.values.includes(vals[i])),
      then: (s: any) => s.required(requiredMsg),
      otherwise: (s: any) => s.optional().nullable(),
    });
  }
  return base.required(requiredMsg);
};

// Builds a yup shape from a flat list of field configs (config-driven validation).
export const buildSchemaFromFields = (fields: any[]): Record<string, any> => {
  const shape: Record<string, any> = {};

  fields.forEach((field) => {
    if (field.disabled) return;

    const hasFormatConstraints = field.minLength !== undefined || field.maxLength !== undefined || field.pattern || field.isUrl;
    if (!field.required && !hasFormatConstraints) return;

    switch (field.type) {
      case FIELD_TYPES.EMAIL: {
        if (!field.required) return;
        const base = yup.string().email(FIELD_VALIDATION_MESSAGES.MUST_BE_EMAIL(field.label));
        shape[field.name] = applyCondition(base, field, FIELD_VALIDATION_MESSAGES.REQUIRED(field.label));
        return;
      }
      case FIELD_TYPES.NUMBER: {
        if (!field.required) return;
        let base = yup.number()
          .transform((value, originalValue) => (originalValue === '' ? undefined : value))
          .typeError(FIELD_VALIDATION_MESSAGES.MUST_BE_NUMBER(field.label));
        if (field.min !== undefined) base = base.min(field.min, FIELD_VALIDATION_MESSAGES.AT_LEAST(field.label, field.min));
        if (field.max !== undefined) base = base.max(field.max, FIELD_VALIDATION_MESSAGES.AT_MOST(field.label, field.max));
        shape[field.name] = applyCondition(base, field, FIELD_VALIDATION_MESSAGES.REQUIRED(field.label));
        return;
      }
      case FIELD_TYPES.MULTISELECT: {
        if (!field.required) return;
        const applyArrayCondition = (f: any, msg: string) => {
          const base = yup.array().nullable();
          if (f.visibleWhen) {
            return base.when(f.visibleWhen.field, {
              is: (val: any) => f.visibleWhen.values.includes(val),
              then: (s: any) => s.min(1, msg),
              otherwise: (s: any) => s.optional().nullable(),
            });
          }
          if (f.visibleWhenAll?.length) {
            return base.when(f.visibleWhenAll.map((c: any) => c.field), {
              is: (...vals: any[]) => f.visibleWhenAll.every((c: any, i: number) => c.values.includes(vals[i])),
              then: (s: any) => s.min(1, msg),
              otherwise: (s: any) => s.optional().nullable(),
            });
          }
          return base.min(1, msg);
        };
        shape[field.name] = applyArrayCondition(field, FIELD_VALIDATION_MESSAGES.REQUIRED(field.label));
        return;
      }
      case FIELD_TYPES.DATERANGE:
        if (!field.required) return;
        if (field.fields?.length >= 2) {
          shape[field.fields[0]] = applyCondition(
            yup.date().nullable().typeError(FIELD_VALIDATION_MESSAGES.START_DATE_REQUIRED(field.label)),
            field,
            FIELD_VALIDATION_MESSAGES.START_DATE_REQUIRED(field.label),
          );
          shape[field.fields[1]] = applyCondition(
            yup.date().nullable().typeError(FIELD_VALIDATION_MESSAGES.END_DATE_REQUIRED(field.label)),
            field,
            FIELD_VALIDATION_MESSAGES.END_DATE_REQUIRED(field.label),
          );
        }
        return;
      case FIELD_TYPES.DATETIME:
        if (!field.required) return;
        if (field.fields?.length >= 2) {
          shape[field.fields[0]] = applyCondition(
            yup.date().nullable().typeError(FIELD_VALIDATION_MESSAGES.DATE_REQUIRED(field.label)),
            field,
            FIELD_VALIDATION_MESSAGES.DATE_REQUIRED(field.label),
          );
          shape[field.fields[1]] = applyCondition(
            yup.date().nullable().typeError(FIELD_VALIDATION_MESSAGES.TIME_REQUIRED(field.label)),
            field,
            FIELD_VALIDATION_MESSAGES.TIME_REQUIRED(field.label),
          );
        } else {
          shape[field.name] = applyCondition(
            yup.date().nullable().typeError(FIELD_VALIDATION_MESSAGES.DATE_REQUIRED(field.label)),
            field,
            FIELD_VALIDATION_MESSAGES.DATE_REQUIRED(field.label),
          );
          shape[`${field.name}Time`] = applyCondition(
            yup.date().nullable().typeError(FIELD_VALIDATION_MESSAGES.TIME_REQUIRED(field.label)),
            field,
            FIELD_VALIDATION_MESSAGES.TIME_REQUIRED(field.label),
          );
        }
        return;
      default: {
        // Transform empty/null strings to undefined so optional().nullable() fully suppresses
        // format constraints (min/max/pattern) on hidden or unfilled fields.
        let base: any = yup.string().transform((v: string) => v === '' || v == null ? undefined : v);
        if (field.isUrl) base = base.transform((v: string) => v?.trim() || undefined).url(FIELD_VALIDATION_MESSAGES.MUST_BE_URL(field.label));
        if (field.minLength !== undefined) base = base.min(field.minLength, FIELD_VALIDATION_MESSAGES.MIN_LENGTH(field.label, field.minLength));
        if (field.maxLength !== undefined) base = base.max(field.maxLength, FIELD_VALIDATION_MESSAGES.MAX_LENGTH(field.label, field.maxLength));
        if (field.pattern) base = base.matches(new RegExp(field.pattern), FIELD_VALIDATION_MESSAGES.FORMAT_INVALID(field.label));
        shape[field.name] = field.required
          ? applyCondition(base, field, FIELD_VALIDATION_MESSAGES.REQUIRED(field.label))
          : base.nullable().optional();
        return;
      }
    }
  });

  return shape;
};

export const createProgramSchema = (
  programType: any,
  mainStartDate?: Date | null,
  mainEndDate?: Date | null,
  progTypeName?: string,
  configSections?: any[],
  subProgramFields?: any[],
) => {
  const isCustomType = (progTypeName || programType?.name || '').toUpperCase().includes(PROGRAM_TYPE_NAMES.CUSTOM);

  if (isCustomType) {
    const allFields = (configSections || []).flatMap((s: any) => s.fields || []);
    const dynamicShape = buildSchemaFromFields(allFields);
    const subProgramShape = subProgramFields?.length ? buildSchemaFromFields(subProgramFields) : {};

    const dateOverrides: Record<string, any> = {};

    // startDate and endDate are only visible when programStructure === 'single'
    if (dynamicShape[FORM_FIELD_NAMES.END_DATE]) {
      dateOverrides[FORM_FIELD_NAMES.END_DATE] = yup.date().nullable().typeError(VALIDATION.PROGRAM_END_DATE_REQUIRED)
        .when(FORM_FIELD_NAMES.PROGRAM_STRUCTURE, {
          is: (v: string) => v === PROGRAM_STRUCTURE_VALUES.SINGLE,
          then: (s) => s
            .when(FORM_FIELD_NAMES.START_DATE, {
              is: (v: any) => v instanceof Date && !isNaN(v.getTime()),
              then: (s2) => s2
                .min(yup.ref(FORM_FIELD_NAMES.START_DATE), VALIDATION.END_DATE_ON_OR_AFTER_START)
                .test(YUP_TEST_IDS.END_TIME_AFTER_START_SAME_DAY, VALIDATION.PROGRAM_END_TIME_AFTER_START, function (endDate) {
                  const { startDate, startTime, endTime } = this.parent;
                  if (!endDate || !startDate || !isSameDayDate(endDate, startDate)) return true;
                  if (!endTime || !startTime) return true;
                  return isTimeAfter(endTime, startTime);
                }),
              otherwise: (s2) => s2,
            })
            .required(VALIDATION.PROGRAM_END_DATE_REQUIRED),
          otherwise: (s) => s.optional().nullable(),
        });
    }

    if (dynamicShape[FORM_FIELD_NAMES.REGISTRATION_START_DATE] && dynamicShape[FORM_FIELD_NAMES.START_DATE]) {
      dateOverrides[FORM_FIELD_NAMES.REGISTRATION_START_DATE] = yup.date().nullable().typeError(VALIDATION.REGISTRATION_START_REQUIRED)
        .when(FORM_FIELD_NAMES.START_DATE, {
          is: (v: any) => v instanceof Date && !isNaN(v.getTime()),
          then: (s) => s.max(yup.ref(FORM_FIELD_NAMES.START_DATE), VALIDATION.REGISTRATION_START_BEFORE_PROGRAM),
          otherwise: (s) => s,
        }).required(VALIDATION.REGISTRATION_START_REQUIRED);
    }

    if (dynamicShape[FORM_FIELD_NAMES.REGISTRATION_START_DATE]) {
      dateOverrides[FORM_FIELD_NAMES.REGISTRATION_END_DATE] = yup.date().nullable()
        .when(FORM_FIELD_NAMES.REGISTRATION_START_DATE, {
          is: (v: any) => v instanceof Date && !isNaN(v.getTime()),
          then: (s) => s
            .min(yup.ref(FORM_FIELD_NAMES.REGISTRATION_START_DATE), VALIDATION.REGISTRATION_END_AFTER_START)
            .test(YUP_TEST_IDS.REG_END_TIME_AFTER_START_SAME_DAY, VALIDATION.REGISTRATION_END_TIME_AFTER_START, function (regEndDate) {
              const { registrationStartDate, registrationStartTime, registrationEndTime } = this.parent;
              if (!regEndDate || !registrationStartDate || !isSameDayDate(regEndDate, registrationStartDate)) return true;
              if (!registrationEndTime || !registrationStartTime) return true;
              return isTimeAfter(registrationEndTime, registrationStartTime);
            }),
          otherwise: (s) => s,
        });
    }

    // checkin/checkout fields are only visible when programStructure === 'single' AND hasCheckinCheckout === 'yes'
    if (dynamicShape[FORM_FIELD_NAMES.CHECKIN_ENDS_AT] && dynamicShape[FORM_FIELD_NAMES.CHECKIN_AT]) {
      dateOverrides[FORM_FIELD_NAMES.CHECKIN_ENDS_AT] = yup.date().nullable()
        .when([FORM_FIELD_NAMES.PROGRAM_STRUCTURE, FORM_FIELD_NAMES.HAS_CHECKIN_CHECKOUT], {
          is: (structure: string, hasCheckin: string) => structure === PROGRAM_STRUCTURE_VALUES.SINGLE && hasCheckin === YES_NO_VALUES.YES,
          then: (s) => s.when(FORM_FIELD_NAMES.CHECKIN_AT, {
            is: (v: any) => v instanceof Date && !isNaN(v.getTime()),
            then: (s2) => s2
              .min(yup.ref(FORM_FIELD_NAMES.CHECKIN_AT), VALIDATION.CHECKIN_END_AFTER_CHECKIN_START)
              .test(YUP_TEST_IDS.CHECKIN_END_TIME_AFTER_CHECKIN_START_SAME_DAY, VALIDATION.CHECKIN_END_TIME_AFTER_START, function (checkinEndsAt) {
                const { checkinAt, checkinAtTime, checkinEndsAtTime } = this.parent;
                if (!checkinEndsAt || !checkinAt || !isSameDayDate(checkinEndsAt, checkinAt)) return true;
                if (!checkinEndsAtTime || !checkinAtTime) return true;
                return isTimeAfter(checkinEndsAtTime, checkinAtTime);
              }),
            otherwise: (s2) => s2,
          }),
          otherwise: (s) => s.optional().nullable(),
        });
    }

    if (dynamicShape[FORM_FIELD_NAMES.CHECKOUT_AT] && dynamicShape[FORM_FIELD_NAMES.CHECKIN_AT]) {
      dateOverrides[FORM_FIELD_NAMES.CHECKOUT_AT] = yup.date().nullable()
        .when([FORM_FIELD_NAMES.PROGRAM_STRUCTURE, FORM_FIELD_NAMES.HAS_CHECKIN_CHECKOUT], {
          is: (structure: string, hasCheckin: string) => structure === PROGRAM_STRUCTURE_VALUES.SINGLE && hasCheckin === YES_NO_VALUES.YES,
          then: (s) => s.when(FORM_FIELD_NAMES.CHECKIN_AT, {
            is: (v: any) => v instanceof Date && !isNaN(v.getTime()),
            then: (s2) => s2
              .min(yup.ref(FORM_FIELD_NAMES.CHECKIN_AT), VALIDATION.CHECKOUT_AFTER_CHECKIN_START)
              .test(YUP_TEST_IDS.CHECKOUT_TIME_AFTER_CHECKIN_SAME_DAY, VALIDATION.CHECKOUT_AFTER_CHECKIN_START, function (checkoutAt) {
                const { checkinAt, checkinAtTime, checkoutAtTime } = this.parent;
                if (!checkoutAt || !checkinAt || !isSameDayDate(checkoutAt, checkinAt)) return true;
                if (!checkoutAtTime || !checkinAtTime) return true;
                return isTimeAfter(checkoutAtTime, checkinAtTime);
              }),
            otherwise: (s2) => s2,
          }),
          otherwise: (s) => s.optional().nullable(),
        });
    }

    if (dynamicShape[FORM_FIELD_NAMES.CHECKOUT_ENDS_AT] && dynamicShape[FORM_FIELD_NAMES.CHECKOUT_AT]) {
      dateOverrides[FORM_FIELD_NAMES.CHECKOUT_ENDS_AT] = yup.date().nullable()
        .when([FORM_FIELD_NAMES.PROGRAM_STRUCTURE, FORM_FIELD_NAMES.HAS_CHECKIN_CHECKOUT], {
          is: (structure: string, hasCheckin: string) => structure === PROGRAM_STRUCTURE_VALUES.SINGLE && hasCheckin === YES_NO_VALUES.YES,
          then: (s) => s.when(FORM_FIELD_NAMES.CHECKOUT_AT, {
            is: (v: any) => v instanceof Date && !isNaN(v.getTime()),
            then: (s2) => s2
              .min(yup.ref(FORM_FIELD_NAMES.CHECKOUT_AT), VALIDATION.CHECKOUT_END_AFTER_CHECKOUT_START)
              .test(YUP_TEST_IDS.CHECKOUT_END_TIME_AFTER_CHECKOUT_START_SAME_DAY, VALIDATION.CHECKOUT_END_TIME_AFTER_START, function (checkoutEndsAt) {
                const { checkoutAt, checkoutAtTime, checkoutEndsAtTime } = this.parent;
                if (!checkoutEndsAt || !checkoutAt || !isSameDayDate(checkoutEndsAt, checkoutAt)) return true;
                if (!checkoutEndsAtTime || !checkoutAtTime) return true;
                return isTimeAfter(checkoutEndsAtTime, checkoutAtTime);
              }),
            otherwise: (s2) => s2,
          }),
          otherwise: (s) => s.optional().nullable(),
        });
    }

    const subProgramDateOverrides: Record<string, any> = {};

    if (subProgramShape[FORM_FIELD_NAMES.ENDS_AT] && subProgramShape[FORM_FIELD_NAMES.STARTS_AT]) {
      subProgramDateOverrides[FORM_FIELD_NAMES.ENDS_AT] = yup.date().nullable().typeError(VALIDATION.PROGRAM_END_DATE_REQUIRED)
        .when(FORM_FIELD_NAMES.STARTS_AT, {
          is: (v: any) => v instanceof Date && !isNaN(v.getTime()),
          then: (s) => s
            .min(yup.ref(FORM_FIELD_NAMES.STARTS_AT), VALIDATION.END_DATE_ON_OR_AFTER_START)
            .test(YUP_TEST_IDS.SUB_ENDS_AT_AFTER_STARTS_AT_SAME_DAY, VALIDATION.PROGRAM_END_TIME_AFTER_START, function (endsAt) {
              const { startsAt, startsAtTime, endsAtTime } = this.parent;
              if (!endsAt || !startsAt || !isSameDayDate(endsAt, startsAt)) return true;
              if (!endsAtTime || !startsAtTime) return true;
              return isTimeAfter(endsAtTime, startsAtTime);
            }),
          otherwise: (s) => s,
        })
        .required(VALIDATION.PROGRAM_END_DATE_REQUIRED);
    }

    if (subProgramShape[FORM_FIELD_NAMES.CHECKIN_ENDS_AT] && subProgramShape[FORM_FIELD_NAMES.CHECKIN_AT]) {
      subProgramDateOverrides[FORM_FIELD_NAMES.CHECKIN_ENDS_AT] = yup.date().nullable()
        .when([FORM_FIELD_NAMES.MODE_OF_OPERATION, FORM_FIELD_NAMES.HAS_CHECKIN_CHECKOUT], {
          is: (modeOfOp: string, hasCheckin: string) => modeOfOp === 'offline' && hasCheckin === YES_NO_VALUES.YES,
          then: (s) => s
            .when(FORM_FIELD_NAMES.CHECKIN_AT, {
              is: (v: any) => v instanceof Date && !isNaN(v.getTime()),
              then: (s2) => s2
                .min(yup.ref(FORM_FIELD_NAMES.CHECKIN_AT), VALIDATION.CHECKIN_END_AFTER_CHECKIN_START)
                .test(YUP_TEST_IDS.SUB_CHECKIN_END_AFTER_START_SAME_DAY, VALIDATION.CHECKIN_END_TIME_AFTER_START, function (checkinEndsAt) {
                  const { checkinAt, checkinAtTime, checkinEndsAtTime } = this.parent;
                  if (!checkinEndsAt || !checkinAt || !isSameDayDate(checkinEndsAt, checkinAt)) return true;
                  if (!checkinEndsAtTime || !checkinAtTime) return true;
                  return isTimeAfter(checkinEndsAtTime, checkinAtTime);
                }),
              otherwise: (s2) => s2,
            })
            .required(VALIDATION.CHECKIN_END_DATE_REQUIRED),
          otherwise: (s) => s.optional().nullable(),
        });
    }

    if (subProgramShape[FORM_FIELD_NAMES.CHECKOUT_AT] && subProgramShape[FORM_FIELD_NAMES.CHECKIN_AT]) {
      subProgramDateOverrides[FORM_FIELD_NAMES.CHECKOUT_AT] = yup.date().nullable()
        .when([FORM_FIELD_NAMES.MODE_OF_OPERATION, FORM_FIELD_NAMES.HAS_CHECKIN_CHECKOUT], {
          is: (modeOfOp: string, hasCheckin: string) => modeOfOp === 'offline' && hasCheckin === YES_NO_VALUES.YES,
          then: (s) => s
            .when(FORM_FIELD_NAMES.CHECKIN_AT, {
              is: (v: any) => v instanceof Date && !isNaN(v.getTime()),
              then: (s2) => s2
                .min(yup.ref(FORM_FIELD_NAMES.CHECKIN_AT), VALIDATION.CHECKOUT_AFTER_CHECKIN_START)
                .test(YUP_TEST_IDS.SUB_CHECKOUT_AFTER_CHECKIN_SAME_DAY, VALIDATION.CHECKOUT_AFTER_CHECKIN_START, function (checkoutAt) {
                  const { checkinAt, checkinAtTime, checkoutAtTime } = this.parent;
                  if (!checkoutAt || !checkinAt || !isSameDayDate(checkoutAt, checkinAt)) return true;
                  if (!checkoutAtTime || !checkinAtTime) return true;
                  return isTimeAfter(checkoutAtTime, checkinAtTime);
                }),
              otherwise: (s2) => s2,
            })
            .required(VALIDATION.CHECKOUT_START_DATE_REQUIRED),
          otherwise: (s) => s.optional().nullable(),
        });
    }

    if (subProgramShape[FORM_FIELD_NAMES.CHECKOUT_ENDS_AT] && subProgramShape[FORM_FIELD_NAMES.CHECKOUT_AT]) {
      subProgramDateOverrides[FORM_FIELD_NAMES.CHECKOUT_ENDS_AT] = yup.date().nullable()
        .when([FORM_FIELD_NAMES.MODE_OF_OPERATION, FORM_FIELD_NAMES.HAS_CHECKIN_CHECKOUT], {
          is: (modeOfOp: string, hasCheckin: string) => modeOfOp === 'offline' && hasCheckin === YES_NO_VALUES.YES,
          then: (s) => s
            .when(FORM_FIELD_NAMES.CHECKOUT_AT, {
              is: (v: any) => v instanceof Date && !isNaN(v.getTime()),
              then: (s2) => s2
                .min(yup.ref(FORM_FIELD_NAMES.CHECKOUT_AT), VALIDATION.CHECKOUT_END_AFTER_CHECKOUT_START)
                .test(YUP_TEST_IDS.SUB_CHECKOUT_END_AFTER_CHECKOUT_START_SAME_DAY, VALIDATION.CHECKOUT_END_TIME_AFTER_START, function (checkoutEndsAt) {
                  const { checkoutAt, checkoutAtTime, checkoutEndsAtTime } = this.parent;
                  if (!checkoutEndsAt || !checkoutAt || !isSameDayDate(checkoutEndsAt, checkoutAt)) return true;
                  if (!checkoutEndsAtTime || !checkoutAtTime) return true;
                  return isTimeAfter(checkoutEndsAtTime, checkoutAtTime);
                }),
              otherwise: (s2) => s2,
            })
            .required(VALIDATION.CHECKOUT_END_DATE_REQUIRED),
          otherwise: (s) => s.optional().nullable(),
        });
    }

    const enhancedSubProgramShape = { ...subProgramShape, ...subProgramDateOverrides };

    return yup.object().shape({
      ...dynamicShape,
      ...dateOverrides,
      programName: yup.string().required(VALIDATION.PROGRAM_NAME_REQUIRED),
      modeOfProgram: yup.string().required(VALIDATION.MODE_OF_PROGRAM_REQUIRED),
      programStructure: yup.string().required(VALIDATION.PROGRAM_STRUCTURE_REQUIRED),
      ...(Object.keys(enhancedSubProgramShape).length > 0 && {
        subPrograms: yup.array().of(yup.object().shape(enhancedSubProgramShape)),
      }),
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const baseSchema = {
    programName: yup.string().required(VALIDATION.PROGRAM_NAME_REQUIRED),
    programCode: yup
      .string()
      .required(VALIDATION.PROGRAM_CODE_REQUIRED)
      .min(3, VALIDATION.PROGRAM_CODE_MIN)
      .max(50, VALIDATION.PROGRAM_CODE_MAX)
      .matches(CODE_FORMAT_REGEX, VALIDATION.PROGRAM_CODE_FORMAT),
    description: yup.string(),
    banner: yup.string().nullable(),
    bannerAnimationUrl: yup.string().nullable(),
    modeOfProgram: yup.string().oneOf([MODE_OF_PROGRAM_VALUES.ONLINE, MODE_OF_PROGRAM_VALUES.OFFLINE, MODE_OF_PROGRAM_VALUES.HYBRID]).required(),
    startDate: yup
      .date()
      .nullable()
      .typeError(VALIDATION.START_DATE_REQUIRED)
      .required(VALIDATION.START_DATE_REQUIRED),
    endDate: yup
      .date()
      .nullable()
      .typeError(VALIDATION.END_DATE_REQUIRED)
      .min(yup.ref(FORM_FIELD_NAMES.START_DATE), VALIDATION.END_DATE_AFTER_START)
      .required(VALIDATION.END_DATE_REQUIRED),
    hdbFee: yup.string().when(FORM_FIELD_NAMES.PROGRAM_NAME, {
      is: (name: string) => name?.includes(PROGRAM_TYPE_NAMES.HDB),
      then: () => yup.string().required(VALIDATION.HDB_FEE_REQUIRED),
      otherwise: () => yup.string(),
    }),
    msdFee: yup.string().when(FORM_FIELD_NAMES.PROGRAM_NAME, {
      is: (name: string) => name?.includes(PROGRAM_TYPE_NAMES.MSD),
      then: () => yup.string().required(VALIDATION.MSD_FEE_REQUIRED),
      otherwise: () => yup.string(),
    }),
    registrationStartDate: yup
      .date()
      .nullable()
      .typeError(VALIDATION.REGISTRATION_START_REQUIRED)
      .required(VALIDATION.REGISTRATION_START_REQUIRED)
      .max(yup.ref(FORM_FIELD_NAMES.START_DATE), VALIDATION.REGISTRATION_START_BEFORE_PROGRAM),
    registrationStartTime: yup
      .date()
      .nullable()
      .typeError(VALIDATION.REGISTRATION_START_TIME_REQUIRED)
      .required(VALIDATION.REGISTRATION_START_TIME_REQUIRED),
    registrationEndDate: yup
      .date()
      .nullable()
      .when(FORM_FIELD_NAMES.REGISTRATION_START_DATE, {
        is: (val: any) => val != null,
        then: (schema) => schema.min(yup.ref(FORM_FIELD_NAMES.REGISTRATION_START_DATE), VALIDATION.REGISTRATION_END_AFTER_START),
        otherwise: (schema) => schema,
      }),
    registrationEndTime: yup
      .date()
      .nullable()
      .when([FORM_FIELD_NAMES.REGISTRATION_START_TIME, FORM_FIELD_NAMES.REGISTRATION_END_DATE, FORM_FIELD_NAMES.REGISTRATION_START_DATE], {
        is: (startTime: any, endDate: any, startDate: any) => startTime != null && endDate != null && startDate != null,
        then: (schema) =>
          schema.test(
            YUP_TEST_IDS.END_TIME_AFTER_START_TIME,
            VALIDATION.REGISTRATION_END_TIME_AFTER_START,
            function (endTime) {
              const { registrationStartTime, registrationEndDate, registrationStartDate } = this.parent;
              if (!endTime || !registrationStartTime || !registrationEndDate || !registrationStartDate) return true;
              if (!isSameDayDate(registrationEndDate, registrationStartDate)) return true;
              return isTimeAfter(endTime, registrationStartTime);
            },
          ),
        otherwise: (schema) => schema,
      }),
    tdsLimit: yup
      .number()
      .typeError(VALIDATION.TDS_LIMIT_NUMBER)
      .min(0, VALIDATION.TDS_LIMIT_NEGATIVE)
      .max(100, VALIDATION.TDS_LIMIT_EXCEED)
      .required(VALIDATION.TDS_LIMIT_REQUIRED),
    cgstLimit: yup
      .number()
      .typeError(VALIDATION.CGST_LIMIT_NUMBER)
      .min(0, VALIDATION.CGST_LIMIT_NEGATIVE)
      .max(100, VALIDATION.CGST_LIMIT_EXCEED)
      .required(VALIDATION.CGST_LIMIT_REQUIRED),
    sgstLimit: yup
      .number()
      .typeError(VALIDATION.SGST_LIMIT_NUMBER)
      .min(0, VALIDATION.SGST_LIMIT_NEGATIVE)
      .max(100, VALIDATION.SGST_LIMIT_EXCEED)
      .required(VALIDATION.SGST_LIMIT_REQUIRED),
    igstLimit: yup
      .number()
      .typeError(VALIDATION.IGST_LIMIT_NUMBER)
      .min(0, VALIDATION.IGST_LIMIT_NEGATIVE)
      .max(100, VALIDATION.IGST_LIMIT_EXCEED)
      .required(VALIDATION.IGST_LIMIT_REQUIRED),
    tdsApplicableTo: yup.string().required(VALIDATION.TDS_APPLICABLE_REQUIRED),
    nameInInvoice: yup.string().trim().required(VALIDATION.NAME_IN_INVOICE_REQUIRED),
    address: yup.string().required(VALIDATION.ADDRESS_REQUIRED),
    pan: yup
      .string()
      .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, VALIDATION.INVALID_PAN_FORMAT)
      .required(VALIDATION.PAN_REQUIRED)
      .length(10, VALIDATION.PAN_LENGTH),
    gstin: yup
      .string()
      .length(15, VALIDATION.GSTIN_LENGTH)
      .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, VALIDATION.INVALID_GSTIN_FORMAT)
      .required(VALIDATION.GSTIN_REQUIRED),
    cin: yup
      .string()
      .length(21, VALIDATION.CIN_LENGTH)
      .matches(/^[A-Z]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/, VALIDATION.INVALID_CIN_FORMAT)
      .length(21, VALIDATION.CIN_LENGTH)
      .required(VALIDATION.CIN_REQUIRED),
    helpLineNumber: yup.string().required(VALIDATION.HELP_LINE_REQUIRED),
    emailSenderName: yup
      .string()
      .required(VALIDATION.EMAIL_SENDER_NAME_REQUIRED)
      .min(3, VALIDATION.EMAIL_SENDER_NAME_MIN),
    emailSenderAddress: yup
      .string()
      .email(VALIDATION.EMAIL_SENDER_ADDRESS_INVALID)
      .required(VALIDATION.EMAIL_SENDER_ADDRESS_REQUIRED),
    emailBccName: yup.string().min(3, VALIDATION.EMAIL_BCC_NAME_MIN).optional(),
    emailBccAddress: yup.string().email(VALIDATION.EMAIL_BCC_ADDRESS_INVALID).optional(),
    venueNameInEmail: yup
      .string()
      .required(VALIDATION.VENUE_NAME_EMAIL_REQUIRED)
      .min(3, VALIDATION.VENUE_NAME_EMAIL_MIN),
    childMinAge: yup
      .number()
      .transform((value, originalValue) => (originalValue === '' ? undefined : value))
      .typeError(VALIDATION.CHILD_MIN_AGE_NUMBER)
      .min(0, VALIDATION.CHILD_MIN_AGE_NEGATIVE)
      .optional(),
    childMaxAge: yup
      .number()
      .transform((value, originalValue) => (originalValue === '' ? undefined : value))
      .typeError(VALIDATION.CHILD_MAX_AGE_NUMBER)
      .min(0, VALIDATION.CHILD_MAX_AGE_NEGATIVE)
      .optional(),
    elderMinAge: yup
      .number()
      .transform((value, originalValue) => (originalValue === '' ? undefined : value))
      .typeError(VALIDATION.ELDER_MIN_AGE_NUMBER)
      .min(0, VALIDATION.ELDER_MIN_AGE_NEGATIVE)
      .optional(),
    elderMaxAge: yup
      .number()
      .transform((value, originalValue) => (originalValue === '' ? undefined : value))
      .typeError(VALIDATION.ELDER_MAX_AGE_NUMBER)
      .min(18, VALIDATION.ELDER_MAX_AGE_MIN)
      .max(120, VALIDATION.ELDER_MAX_AGE_EXCEED)
      .optional(),
  } as Record<string, any>;

  if (programType?.requiresPayment) {
    Object.assign(baseSchema, {
      isPaymentRequired: yup.string().oneOf([YES_NO_VALUES.YES, YES_NO_VALUES.NO]),
      currency: yup.string().required(VALIDATION.CURRENCY_REQUIRED),
      gstPercentage: yup.number(),
    });
  }

  if (programType?.requiresApproval) {
    Object.assign(baseSchema, {
      approvalRequired: yup.string().oneOf([YES_NO_VALUES.YES, YES_NO_VALUES.NO]).required(),
    });
  }

  if (programType?.maxCapacity > 0) {
    Object.assign(baseSchema, {
      hasSeatLimit: yup.string().oneOf([YES_NO_VALUES.YES, YES_NO_VALUES.NO]),
      totalSeats: yup.number().max(programType.maxCapacity),
    });
  }

  if (programType?.waitlistApplicable) {
    Object.assign(baseSchema, {
      hasWaitlist: yup.string().oneOf([YES_NO_VALUES.YES, YES_NO_VALUES.NO]).required(),
      waitlistTriggerCount: yup
        .number()
        .nullable()
        .transform((value, originalValue) => (originalValue === '' ? null : value))
        .when(FORM_FIELD_NAMES.HAS_WAITLIST, {
          is: YES_NO_VALUES.YES,
          then: (schema) =>
            schema
              .required(VALIDATION.WAITLIST_TRIGGER_REQUIRED)
              .when(FORM_FIELD_NAMES.TOTAL_SEATS, {
                is: (totalSeats: number) => totalSeats && totalSeats > 0,
                then: (innerSchema) => innerSchema.max(yup.ref(FORM_FIELD_NAMES.TOTAL_SEATS), VALIDATION.WAITLIST_TRIGGER_LESS_THAN_SEATS),
                otherwise: (innerSchema) => innerSchema,
              }),
          otherwise: (schema) => schema,
        }),
    });
  }

  if (
    programType?.modeOfOperation === MODE_OF_PROGRAM_VALUES.OFFLINE ||
    programType?.modeOfOperation === MODE_OF_PROGRAM_VALUES.HYBRID
  ) {
    Object.assign(baseSchema, {
      venueAddress: yup.array().of(yup.string()).min(1, VALIDATION.AT_LEAST_ONE_VENUE),
    });
  }

  if (programType?.hasMultipleSessions) {
    Object.assign(baseSchema, {
      subPrograms: yup
        .array()
        .of(
          yup.object().shape({
            title: yup.string().required(VALIDATION.SESSION_NAME_REQUIRED),
            code: yup
              .string()
              .required(VALIDATION.SUB_PROGRAM_CODE_REQUIRED)
              .min(3, VALIDATION.SUB_PROGRAM_CODE_MIN)
              .max(50, VALIDATION.SUB_PROGRAM_CODE_MAX)
              .matches(CODE_FORMAT_REGEX, VALIDATION.SUB_PROGRAM_CODE_FORMAT)
              .test(YUP_TEST_IDS.UNIQUE_CODE, VALIDATION.SUB_PROGRAM_CODE_UNIQUE, function (value) {
                const subPrograms = this.from?.[1]?.value?.subPrograms as any[];
                if (!subPrograms || !value) return true;
                const match = this.path.match(/\[(\d+)\]/);
                const currentIndex = match ? parseInt(match[1], 10) : -1;
                return subPrograms.every((sp, i) => i === currentIndex || sp.code !== value);
              }),
            description: yup.string(),
            [FORM_FIELD_NAMES.MODE_OF_PROGRAM]: yup
              .string()
              .oneOf(
                [MODE_OF_PROGRAM_VALUES.ONLINE, MODE_OF_PROGRAM_VALUES.OFFLINE, MODE_OF_PROGRAM_VALUES.HYBRID],
                VALIDATION.MODE_OF_SESSION_VALUES,
              )
              .required(VALIDATION.MODE_OF_OPERATION_REQUIRED),
            venueAddress: yup.array().when(FORM_FIELD_NAMES.MODE_OF_PROGRAM, {
              is: (val: string) => val === MODE_OF_PROGRAM_VALUES.OFFLINE || val === MODE_OF_PROGRAM_VALUES.HYBRID,
              then: (schema) => schema.min(1, VALIDATION.AT_LEAST_ONE_VENUE),
              otherwise: (schema) => schema,
            }),
            banner: yup.string().nullable(),
            bannerImageUrl: yup.string().nullable(),
            seatLimit: yup.string().when(FORM_FIELD_NAMES.HAS_SEAT_LIMIT, {
              is: YES_NO_VALUES.YES,
              then: (schema) => schema.required(VALIDATION.SEAT_LIMIT_REQUIRED),
              otherwise: (schema) => schema,
            }),
            registrationStartDate: yup.date(),
            registrationEndDate: yup.date(),
            waitlistTriggerCount: yup.string().when(FORM_FIELD_NAMES.HAS_WAITLIST, {
              is: YES_NO_VALUES.YES,
              then: (schema) => schema.required(VALIDATION.WAITLIST_TRIGGER_REQUIRED),
              otherwise: (schema) => schema,
            }),
            programStartDate: yup
              .date()
              .nullable()
              .min(today, VALIDATION.PROGRAM_START_DATE_IN_PAST)
              .test(YUP_TEST_IDS.SUB_PROGRAM_START_WITHIN_RANGE, VALIDATION.PROGRAM_START_DATE_BEFORE_MAIN, function (value) {
                if (!value || !mainStartDate) return true;
                return new Date(value) >= new Date(mainStartDate);
              })
              .required(VALIDATION.PROGRAM_START_DATE_REQUIRED),
            programStartTime: yup
              .date()
              .required(VALIDATION.PROGRAM_START_TIME_REQUIRED)
              .test(YUP_TEST_IDS.START_TIME_AFTER_PREV_END, VALIDATION.PROGRAM_START_TIME_AFTER_PREV, function (startTime) {
                const { programStartDate } = this.parent;
                const subProgramsArray = this.from?.[1]?.value?.subPrograms as any[];
                if (!subProgramsArray || !startTime || !programStartDate) return true;
                const currentIndex = subProgramsArray.indexOf(this.parent);
                if (currentIndex <= 0) return true;
                const prev = subProgramsArray[currentIndex - 1];
                if (!prev?.programEndDate || !prev?.programEndTime) return true;
                if (!isSameDayDate(programStartDate, prev.programEndDate)) return true;
                return isTimeAfter(startTime, prev.programEndTime);
              }),
            programEndDate: yup
              .date()
              .nullable()
              .min(yup.ref(FORM_FIELD_NAMES.PROGRAM_START_DATE), VALIDATION.PROGRAM_END_DATE_AFTER_START)
              .test(YUP_TEST_IDS.SUB_PROGRAM_END_WITHIN_RANGE, VALIDATION.PROGRAM_END_DATE_AFTER_MAIN, function (value) {
                if (!value || !mainEndDate) return true;
                return new Date(value) <= new Date(mainEndDate);
              })
              .required(VALIDATION.PROGRAM_END_DATE_REQUIRED),
            programEndTime: yup
              .date()
              .required(VALIDATION.PROGRAM_END_TIME_REQUIRED)
              .test(YUP_TEST_IDS.PROGRAM_END_TIME_AFTER_START, VALIDATION.PROGRAM_END_TIME_AFTER_START, function (endTime) {
                const { programStartTime, programEndDate, programStartDate } = this.parent;
                if (!endTime || !programStartTime || !programEndDate || !programStartDate) return true;
                if (!isSameDayDate(programEndDate, programStartDate)) return true;
                return isTimeAfter(endTime, programStartTime);
              }),
            checkInStartDate: yup.date().when(FORM_FIELD_NAMES.MODE_OF_PROGRAM, {
              is: (val: string) => val === MODE_OF_PROGRAM_VALUES.OFFLINE || val === MODE_OF_PROGRAM_VALUES.HYBRID,
              then: (schema) => schema
                .required(VALIDATION.CHECKIN_START_DATE_REQUIRED)
                .max(yup.ref(FORM_FIELD_NAMES.PROGRAM_END_DATE), VALIDATION.CHECKIN_START_BEFORE_PROGRAM_END),
              otherwise: (schema) => schema.nullable(),
            }),
            checkInStartTime: yup.date().when(FORM_FIELD_NAMES.MODE_OF_PROGRAM, {
              is: (val: string) => val === MODE_OF_PROGRAM_VALUES.OFFLINE || val === MODE_OF_PROGRAM_VALUES.HYBRID,
              then: (schema) => schema.required(VALIDATION.CHECKIN_START_TIME_REQUIRED),
              otherwise: (schema) => schema.nullable(),
            }),
            checkInEndDate: yup.date().when(FORM_FIELD_NAMES.MODE_OF_PROGRAM, {
              is: (val: string) => val === MODE_OF_PROGRAM_VALUES.OFFLINE || val === MODE_OF_PROGRAM_VALUES.HYBRID,
              then: (schema) => schema
                .required(VALIDATION.CHECKIN_END_DATE_REQUIRED)
                .min(yup.ref(FORM_FIELD_NAMES.CHECK_IN_START_DATE), VALIDATION.CHECKIN_END_DATE_AFTER_START)
                .max(yup.ref(FORM_FIELD_NAMES.PROGRAM_END_DATE), VALIDATION.CHECKIN_END_BEFORE_PROGRAM_END),
              otherwise: (schema) => schema.nullable(),
            }),
            checkInEndTime: yup.date().when(FORM_FIELD_NAMES.MODE_OF_PROGRAM, {
              is: (val: string) => val === MODE_OF_PROGRAM_VALUES.OFFLINE || val === MODE_OF_PROGRAM_VALUES.HYBRID,
              then: (schema) => schema
                .required(VALIDATION.CHECKIN_END_TIME_REQUIRED)
                .test(YUP_TEST_IDS.CHECKIN_END_TIME_AFTER_START, VALIDATION.CHECKIN_END_TIME_AFTER_START, function (endTime) {
                  const { checkInStartTime, checkInEndDate, checkInStartDate } = this.parent;
                  if (!endTime || !checkInStartTime || !checkInEndDate || !checkInStartDate) return true;
                  if (!isSameDayDate(checkInEndDate, checkInStartDate)) return true;
                  return isTimeAfter(endTime, checkInStartTime);
                }),
              otherwise: (schema) => schema.nullable(),
            }),
            checkOutStartDate: yup.date().when(FORM_FIELD_NAMES.MODE_OF_PROGRAM, {
              is: (val: string) => val === MODE_OF_PROGRAM_VALUES.OFFLINE || val === MODE_OF_PROGRAM_VALUES.HYBRID,
              then: (schema) => schema
                .required(VALIDATION.CHECKOUT_START_DATE_REQUIRED)
                .min(yup.ref(FORM_FIELD_NAMES.PROGRAM_END_DATE), VALIDATION.CHECKOUT_START_BEFORE_PROGRAM_END),
              otherwise: (schema) => schema.nullable(),
            }),
            checkOutStartTime: yup.date().when(FORM_FIELD_NAMES.MODE_OF_PROGRAM, {
              is: (val: string) => val === MODE_OF_PROGRAM_VALUES.OFFLINE || val === MODE_OF_PROGRAM_VALUES.HYBRID,
              then: (schema) => schema
                .required(VALIDATION.CHECKOUT_START_TIME_REQUIRED)
                .test(YUP_TEST_IDS.CHECKOUT_START_TIME_AFTER_PROGRAM_END, VALIDATION.CHECKOUT_START_TIME_AFTER_PROGRAM_END, function (startTime) {
                  const { checkOutStartDate, programEndDate, programEndTime } = this.parent;
                  if (!startTime || !checkOutStartDate || !programEndDate || !programEndTime) return true;
                  if (!isSameDayDate(checkOutStartDate, programEndDate)) return true;
                  return isTimeAfter(startTime, programEndTime);
                }),
              otherwise: (schema) => schema.nullable(),
            }),
            checkOutEndDate: yup.date().when(FORM_FIELD_NAMES.MODE_OF_PROGRAM, {
              is: (val: string) => val === MODE_OF_PROGRAM_VALUES.OFFLINE || val === MODE_OF_PROGRAM_VALUES.HYBRID,
              then: (schema) => schema
                .required(VALIDATION.CHECKOUT_END_DATE_REQUIRED)
                .min(yup.ref(FORM_FIELD_NAMES.CHECK_OUT_START_DATE), VALIDATION.CHECKOUT_END_AFTER_START)
                .min(yup.ref(FORM_FIELD_NAMES.PROGRAM_END_DATE), VALIDATION.CHECKOUT_END_AFTER_PROGRAM_END),
              otherwise: (schema) => schema.nullable(),
            }),
            checkOutEndTime: yup.date().when(FORM_FIELD_NAMES.MODE_OF_PROGRAM, {
              is: (val: string) => val === MODE_OF_PROGRAM_VALUES.OFFLINE || val === MODE_OF_PROGRAM_VALUES.HYBRID,
              then: (schema) => schema
                .required(VALIDATION.CHECKOUT_END_TIME_REQUIRED)
                .test(YUP_TEST_IDS.CHECKOUT_END_TIME_AFTER_START, VALIDATION.CHECKOUT_END_TIME_AFTER_START, function (endTime) {
                  const { checkOutStartTime, checkOutEndDate, checkOutStartDate } = this.parent;
                  if (!endTime || !checkOutStartTime || !checkOutEndDate || !checkOutStartDate) return true;
                  if (!isSameDayDate(checkOutEndDate, checkOutStartDate)) return true;
                  return isTimeAfter(endTime, checkOutStartTime);
                }),
              otherwise: (schema) => schema.nullable(),
            }),
            sessionType: yup.string().required(VALIDATION.SESSION_TYPE_REQUIRED),
            sessionPrice: yup
              .number()
              .typeError(VALIDATION.SESSION_PRICE_NUMBER)
              .min(0, VALIDATION.SESSION_PRICE_NEGATIVE)
              .required(VALIDATION.SESSION_PRICE_REQUIRED),
          }),
        )
        .min(1, VALIDATION.AT_LEAST_ONE_SESSION),
    });
  }

  return yup.object().shape(baseSchema);
};
