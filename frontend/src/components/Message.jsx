// type is "error" or "success". Renders nothing when there is no text.
export default function Message({ type = "error", children }) {
  if (!children) return null;
  return (
    <p className={`message ${type}`} role={type === "error" ? "alert" : "status"}>
      {children}
    </p>
  );
}
