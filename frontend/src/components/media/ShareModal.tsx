import { Dialog } from '../common/Dialog';
import { Media } from '../../types';
import { WhatsappIcon, FacebookIcon, TwitterIcon, EmailIcon } from '../icons/SocialIcons';

interface ShareModalProps {
  media: Media;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareModal({ media, isOpen, onClose }: ShareModalProps) {
  const shareUrl = `${window.location.origin}/share/${media.id}`;
  
  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: WhatsappIcon,
      url: `https://wa.me/?text=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'Facebook',
      icon: FacebookIcon,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'Twitter',
      icon: TwitterIcon,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'Email',
      icon: EmailIcon,
      url: `mailto:?body=${encodeURIComponent(shareUrl)}`,
    },
  ];

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Share File">
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {shareOptions.map((option) => (
            <a
              key={option.name}
              href={option.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-lg border hover:bg-gray-50"
            >
              <option.icon className="w-5 h-5" />
              {option.name}
            </a>
          ))}
        </div>
      </div>
    </Dialog>
  );
}