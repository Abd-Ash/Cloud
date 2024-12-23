interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    maxWidth?: string;
  }
  
  export function Dialog({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }: DialogProps) {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="fixed inset-0 bg-black opacity-50" onClick={onClose} />
          <div className={`relative bg-white rounded-lg shadow-xl ${maxWidth} w-full`}>
            {title && (
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold">{title}</h3>
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    );
  }