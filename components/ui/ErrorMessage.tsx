export default function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-sm text-red-600 font-medium">Error</p>
      <p className="text-sm text-red-500 mt-1">{message}</p>
    </div>
  )
}