import { Spin } from "antd";

interface LoadingIndicatorProps {
  text?: string;
}

export const LoadingIndicator = ({ text }: LoadingIndicatorProps) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        minHeight: 240,
      }}
    >
      <Spin size="large" />
      {text ? (
        <span style={{ color: "#999", fontSize: 14 }}>{text}</span>
      ) : null}
    </div>
  );
};
