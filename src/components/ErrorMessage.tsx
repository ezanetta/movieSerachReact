interface ErrorMessageProps {
  message: string
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <div className="text-4xl">⚠️</div>
      <p className="text-red-400 font-medium">{message}</p>
    </div>
  )
}
