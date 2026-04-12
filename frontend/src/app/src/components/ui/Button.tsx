type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export default function Button({
  children,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    // Thin wrapper so forms and pages reuse the same button styling.
    <button
      type={type}
      {...props}
      className={`px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition ${className}`.trim()}
    >
      {children}
    </button>
  );
}
