type Props = React.InputHTMLAttributes<HTMLInputElement>;

export default function Input(props: Props) {
    return (
        <input
            {...props}
            className="
        w-full border border-gray-300 rounded px-3 py-2
        focus:outline-none focus:ring-2 focus:ring-primary
      "
        />
    );
}
