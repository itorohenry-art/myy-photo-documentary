import { Check, X } from 'lucide-react';

export function ModalLayer({ children, onClose }) {
	return (
		<div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
			{children}
		</div>
	);
}

export function DialogCloseButton({ onClose }) {
	return <button className="dialog-close" onClick={onClose} aria-label="Close"><X size={19} /></button>;
}

export function Toast({ notice }) {
	if (!notice) return null;
	return <div className="toast" role="status"><Check size={16} /> {notice}</div>;
}