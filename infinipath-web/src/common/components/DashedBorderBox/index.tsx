import styles from "./index.module.scss";
export const DashedBorderBox: React.FC<{
  children: React.ReactNode;
  isDragOver?: boolean;
}> = ({ children, isDragOver = false }) => (
  <div className={styles.noUsers}>
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill={isDragOver ? "url(#dragGradient)" : "none"}
        stroke={isDragOver ? "#1859B4" : "#d9d9d9"}
        strokeWidth="2"
        strokeDasharray="8 5"
        rx="8"
        ry="8"
      >
        {isDragOver && (
          <defs>
            <linearGradient
              id="dragGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="17.85%" stopColor="rgba(110, 169, 225, 0.15)" />
              <stop offset="70.24%" stopColor="rgba(48, 104, 188, 0.15)" />
            </linearGradient>
          </defs>
        )}
      </rect>
    </svg>
    {children}
  </div>
);
