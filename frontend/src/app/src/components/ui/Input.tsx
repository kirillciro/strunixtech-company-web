type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = "", ...props }: InputProps) {
  return (
    // Thin wrapper so forms share a consistent input style.
    <input
      {...props}
      className={`border p-2 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`.trim()}
    />
  );
}
