import React from 'react';
import { Controller } from 'react-hook-form';
import DropdownWithInput from '../../../common/components/DropdownTextfield';
import styles from './index.module.scss';
import { ConfigFieldProps} from '../../../types/question';



const ConfigField: React.FC<ConfigFieldProps> = ({
  field,
  control,
  register,
  errors,
  watch,
  setValue,
  clearErrors,
  validationRuleOptions
}) => {
  const commonProps = {
    className: `${styles.inputFields} ${errors[field] ? styles.errorFields : ''}`,
    ...register(field)
  };

  switch (field) {

    case 'isDisabled':
      return (
        <div className={styles.labelInput} key={field}>
          <div className={styles.fieldLabel}>is Disabled Field ?</div>
          <div className={styles.RadioContainer}>
         <label className={styles.customradio}>
            <input
                type="radio"
                checked={watch('isDisabled') === true}
                onChange={() => setValue('isDisabled', true)}
                className={styles.radioInput}
            />
            <span className={styles.labelText}>true</span>
        </label>
         <label className={styles.customradio}>
            <input
                type="radio"
                checked={watch('isDisabled') === false}
                onChange={() => setValue('isDisabled', false)}
                className={styles.radioInput}
            />
            <span className={styles.labelText}>false</span>
        </label>
        </div>
          {errors[field] && (
            <span className={styles.errorMsg}>{errors[field]?.message}</span>
          )}
        </div>
      );


    case 'isMandatory':
      return (
        <div className={styles.labelInput} key={field}>
          <div className={styles.fieldLabel}>Reguired Field ?</div>
          <div className={styles.RadioContainer}>
         <label className={styles.customradio}>
            <input
                type="radio"
                // {...commonProps}
                checked={watch('isMandatory') === true}
                onChange={() => setValue('isMandatory', true)}
                className={styles.radioInput}
            />
            <span className={styles.labelText}>true</span>
        </label>
         <label className={styles.customradio}>
            <input
                type="radio"
                // {...commonProps}
                checked={watch('isMandatory') === false}
                onChange={() => setValue('isMandatory', false)}
                className={styles.radioInput}
            />
            <span className={styles.labelText}>false</span>
        </label>
        </div>
          {errors[field] && (
            <span className={styles.errorMsg}>{errors[field]?.message}</span>
          )}
        </div>
      );
    case 'placeholder':
      return (
        <div className={styles.labelInput} key={field}>
          <div className={styles.fieldLabel}>Placeholder Text</div>
          <input {...commonProps} placeholder="Enter placeholder text" />
          {errors[field] && (
            <span className={styles.errorMsg}>{errors[field]?.message}</span>
          )}
        </div>
      );

    case 'minChars':
      return (
        <div className={styles.labelInput} key={field}>
          <div className={styles.fieldLabel}>Minimum Characters</div>
          <input
            {...register(field, {
              valueAsNumber: true,
              setValueAs: (value) => (value === '' ? undefined : parseInt(value))
            })}
            type="number"
            className={`${styles.inputFields} ${errors[field] ? styles.errorFields : ''}`}
            placeholder="Enter minimum characters"
          />
          {errors[field] && (
            <span className={styles.errorMsg}>{errors[field]?.message}</span>
          )}
        </div>
      );

    case 'maxChars':
    case 'minValue':
    case 'maxValue':
      return (
        <div className={styles.labelInput} key={field}>
          <div className={styles.fieldLabel}>
            {field.includes('min') ? 'Minimum' : 'Maximum'}{' '}
            {field.includes('Chars') ? 'Characters' : 'Value'}
          </div>
          <input
            {...register(field, { valueAsNumber: true })}
            type="number"
            className={`${styles.inputFields} ${errors[field] ? styles.errorFields : ''}`}
            placeholder={`Enter ${field}`}
          />
          {errors[field] && (
            <span className={styles.errorMsg}>{errors[field]?.message}</span>
          )}
        </div>
      );

    case 'validationRule':
      return (
        <div className={styles.labelInput} key={field}>
          <Controller
            name="validationRule"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <DropdownWithInput
                {...field}
                label='Validation Rule'
                options={validationRuleOptions}
                onValueChange={(value: string) => {
                  setValue('validationRule', value);
                  if (value !== 'Other') {
                    setValue('otherValidationRule', '');
                  }
                  clearErrors('validationRule');
                }}
                error={errors.validationRule?.message}
                otherError={errors.otherValidationRule?.message}
                showOtherField={watch('validationRule') === 'Other'}
                height="35px"
                isMulti={false} // Set this to false for single selection
                value={field.value || ''}
              />
            )}
          />
          {watch('validationRule') === 'Other' && (
            <div className={styles.otherValidationField}>
              <input
                {...register('otherValidationRule')}
                className={`${styles.inputFields} ${
                  errors.otherValidationRule ? styles.errorFields : ''
                }`}
                placeholder="Enter custom validation (regex or description)"
              />
              {errors.otherValidationRule && (
                <span className={styles.errorMsg}>
                  {errors.otherValidationRule.message}
                </span>
              )}
            </div>
          )}
        </div>
      );

    case 'enableOtherOption':
      return (
        <div className={styles.labelInput} key={field}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              {...register(field)}
              className={errors[field] ? styles.errorFields : ''}
            />
            Enable &quot;Other&quot; option
          </label>
          {errors[field] && (
            <span className={styles.errorMsg}>{errors[field]?.message}</span>
          )}
        </div>
      );

    default:
      return null;
  }
};

export default ConfigField;