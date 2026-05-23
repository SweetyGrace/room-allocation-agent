import styles from "./index.module.scss";
export function colorizeMahatriaInfinitheism(text: string) {
  if (!text) return "";
  return text?.split(/(mahatria ra|mahatria|infinitheism)/gi)?.map((part, idx) => {
    const lower = part.toLowerCase();
      if (
        lower === "mahatria" ||
        lower === "mahatria ra" 
      )
     {
      return (
        <span key={idx} className={styles.mahatria}>{part}</span>
      );
    }
    if (lower === "infinitheism") {
      return (
        <span key={idx} className={styles.infinitheism}>{part}</span>
      );
    }
    return part;
  });
}