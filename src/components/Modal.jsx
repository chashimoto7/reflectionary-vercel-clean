// frontend/ src/components/Modal.jsx
export default function Modal({ onClose, children, className = "" }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`relative max-w-4xl w-full max-h-[90vh] overflow-y-auto ${className}`}>
        {children}
      </div>
    </div>
  );
}
