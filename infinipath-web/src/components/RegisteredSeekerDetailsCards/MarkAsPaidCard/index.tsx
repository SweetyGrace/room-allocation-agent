import React from 'react';
import styles from './index.module.scss';
import { Button } from '../../../common/components/Button';

interface MarkAsPaidCardProps {
    handleMarkAsPaid: () => void;
  sendInvoice ?: boolean; // Optional prop to indicate if the invoice should be sent
  sendPaymentLink?: boolean; // Optional prop to indicate if the payment link should be sent
}

const MarkAsPaidCard: React.FC<MarkAsPaidCardProps> = ({ handleMarkAsPaid , sendInvoice , sendPaymentLink }) => {
    return (
          <div className={styles.confirmCard}>
        <div className={styles.fieldRow}>
       
        <div>
          <div>
            <Button
              buttonClassName={styles.buttonContainer}
              buttonTextClassName={styles.buttonContainer}
              type="submit"
              onClick={handleMarkAsPaid}

            >
              {sendInvoice ? 'Re send Invoice' : 'Mark as payment received'}
            </Button>
          </div>
        </div>
      </div>
      </div>
    );
};

export default MarkAsPaidCard;