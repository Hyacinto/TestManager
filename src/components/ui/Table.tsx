type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function Textarea(props: Props) {
    return (
        <textarea
            {...props}
            className="
        w-full border border-gray-300 rounded px-3 py-2
        focus:outline-none focus:ring-2 focus:ring-primary
      "
        />
    );
}
