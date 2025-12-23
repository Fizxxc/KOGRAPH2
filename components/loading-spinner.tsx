export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <lord-icon
        src="https://cdn.lordicon.com/lqxfrxad.json"
        trigger="loop"
        colors="primary:#6366f1,secondary:#8b5cf6"
        style={{ width: "80px", height: "80px" }}
      />
    </div>
  )
}
