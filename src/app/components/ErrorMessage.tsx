interface ErrorMessageProps {
  title?: string;
  message: string;
}

export default function ErrorMessage({
  title = "Klaida kraunant duomenis",
  message,
}: ErrorMessageProps) {
  return (
    <div className="min-h-screen bg-gray-50/60 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}
