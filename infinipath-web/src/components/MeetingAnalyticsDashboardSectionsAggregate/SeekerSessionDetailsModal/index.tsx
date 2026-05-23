import { Button, Modal, Paper, Typography } from "@mui/material";
import Loader from "../../../common/components/Loader";
import styles from "./index.module.scss";
import crossIcon from "../../../assets/images/text-cross-icon.svg";
import { useNavigate } from "react-router-dom";
import { endPoints } from "../../../constants/urlConstants";
interface SeekerSessionDetailsModalProps {
    title: string;
    open: boolean;
    onClose: () => void;
    sessions?: unknown[];
    loading?: boolean;
}

const SeekerSessionDetailsModal: React.FC<SeekerSessionDetailsModalProps>= ({title, open, onClose,sessions,loading}) => {
    const navigate = useNavigate();
    const onRowClick = (session: unknown) => {
        // Handle row click event
       
        navigate(endPoints.sessionAnalytics+`?sessionId=${session.id}`);
        onClose();
    }
    return (
        <Modal open={open} onClose={onClose} className={styles.modal}>
            <Paper className={styles.modalPaper}>
                    {/* Modal Header */}
                    <div className={styles.modalHeader}>
                      <Typography variant="h6">{title}</Typography>
                      <Button onClick={onClose}>
                        <img src={crossIcon} alt="close" />
                      </Button>
                    </div>
                    <div>
                {loading ? <Loader type="small" data-testid="loader" />:
                sessions === undefined && sessions?.length === 0? <div>No data found!!</div>:
                sessions?.map((session, index) => (
                <div key={index} onClick={() => onRowClick && onRowClick(session)}>
                    <p>{session.sessionDate}</p>
                </div>
                ))
                }
                </div>
            </Paper>
        </Modal>
    );
}

export default SeekerSessionDetailsModal;