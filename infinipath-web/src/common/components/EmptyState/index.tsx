import noData from "../../../assets/images/aggregated-empty.svg"
import styles from "./index.module.scss";


interface EmptyStateProps {
    msg: string;
}

export const EmptyState = ({ msg }: EmptyStateProps) => {
    return (
        <div className={styles.container}>
            <div className={styles.container_img}>
                <img src = {noData}/>
            </div>
            <p>{msg}</p>
        </div>
    );
}