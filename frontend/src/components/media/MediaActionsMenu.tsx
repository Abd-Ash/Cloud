// import { LucideIcon } from 'lucide-react';

interface Action {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

interface MediaActionsMenuProps {
  actions: Action[];
  onClose: () => void;
}

export default function MediaActionsMenu({ actions, onClose }: MediaActionsMenuProps) {
  return (
    <div 
      className="absolute top-2 right-8 bg-white rounded-lg shadow-lg py-1 z-10"
      onClick={(e) => e.stopPropagation()}
    >
      {actions.map((action, index) => (
        <button
          key={index}
          className="w-full px-4 py-1 text-sm text-left hover:bg-gray-100 flex items-center gap-2"
          onClick={() => {
            action.onClick();
            onClose();
          }}
        >
          {action.icon}
          {action.label}
        </button>
      ))}
    </div>
  );
}