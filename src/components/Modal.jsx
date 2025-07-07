// frontend/ src/components/Modal.jsx
export default function Modal({ onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-xl w-full relative shadow-lg">
        <button
          className="absolute top-2 right-3 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
