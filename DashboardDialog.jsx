import { ArrowRight, Image, LockKeyhole, MessageCircle, Plus, Send } from 'lucide-react';
import { DialogCloseButton } from './DialogPrimitives.jsx';

export function DashboardDialog({ user, bookings, messages, dashboardStats, dashboardError, activeTab, setActiveTab, onClose, onSignOut, onOpenBooking, onOpenMessage, onUpdateBooking, onUpdateMessageStatus }) {
	const isAdmin = user.role === 'admin';
	const visibleBookings = isAdmin ? bookings : bookings.filter((booking) => booking.email === user.email);
	const visibleMessages = isAdmin ? messages : messages.filter((message) => message.email === user.email);
	const summary = isAdmin && dashboardStats ? [
		[dashboardStats.totalBookings ?? bookings.length, 'PROJECT NOTES'],
		[dashboardStats.totalMessages ?? messages.length, 'CONVERSATIONS'],
		[dashboardStats.pendingBookings ?? bookings.filter((booking) => booking.status === 'PENDING').length, 'PENDING'],
	] : [
		[visibleBookings.length, 'PROJECT NOTES'],
		[visibleMessages.length, 'CONVERSATIONS'],
		[bookings.filter((booking) => booking.status === 'CONFIRMED').length, 'CONFIRMED'],
	];

	return (
		<section className="dialog dashboard-dialog" aria-labelledby="dashboard-title">
			<DialogCloseButton onClose={onClose} />
			<div className="dashboard-head">
				<div>
					<span className="dialog-eyebrow">{isAdmin ? 'ASHWORLD · STUDIO ADMIN' : 'YOUR ASHWORLD SPACE'}</span>
					<h2 id="dashboard-title">{isAdmin ? <>Studio <em>overview.</em></> : <>Hello, <em>{user.name.split(' ')[0]}.</em></>}</h2>
				</div>
				<button className="signout-button" onClick={onSignOut}>SIGN OUT <ArrowRight size={13} /></button>
			</div>
			<div className="dashboard-stats">
				{summary.map(([number, label]) => (
					<div className="dashboard-stat" key={label}><strong>{number}</strong><span>{label}</span></div>
				))}
			</div>
			{dashboardError && <p className="form-error dashboard-error" role="alert">{dashboardError}</p>}
			<div className="dashboard-toolbar">
				<div className="dashboard-tabs">
					<button className={activeTab === 'bookings' ? 'is-selected' : ''} onClick={() => setActiveTab('bookings')}>PROJECT NOTES</button>
					<button className={activeTab === 'messages' ? 'is-selected' : ''} onClick={() => setActiveTab('messages')}>MESSAGES</button>
				</div>
				{!isAdmin && <button className="dashboard-compose" onClick={onOpenBooking}>NEW PROJECT NOTE <Plus size={14} /></button>}
			</div>
			{activeTab === 'bookings' && (
				<div className="dashboard-list">
					{visibleBookings.length === 0 ? (
						<div className="dashboard-empty">
							<Image size={23} /><p>Nothing on the board just yet.</p><span>Your next good idea can start here.</span>
							{!isAdmin && <button className="text-link" onClick={onOpenBooking}>TELL US ABOUT IT <Plus size={13} /></button>}
						</div>
					) : visibleBookings.map((booking) => (
						<article className="dashboard-item" key={booking.id}>
							<div className="dashboard-item-main">
								<span className={`status-dot status-${booking.status.toLowerCase().replace(' ', '-')}`} />
								<div>
									<strong>{booking.service}</strong>
									<span>{isAdmin ? `${booking.name} · ${booking.email}` : booking.name}{booking.date ? ` · ${booking.date}` : ''}</span>
									{booking.brief && <p>{booking.brief}</p>}
									{booking.budget && <span>{booking.budget}</span>}
								</div>
							</div>
							{isAdmin ? (
								<select aria-label={`Update status for ${booking.name}`} value={booking.status} onChange={(event) => onUpdateBooking(booking.id, event.target.value)}>
									<option value="PENDING">Pending</option><option value="CONFIRMED">Confirmed</option><option value="CANCELLED">Cancelled</option><option value="COMPLETED">Completed</option>
								</select>
							) : <span className={`status-label status-label-${booking.status.toLowerCase().replace(' ', '-')}`}>{booking.status}</span>}
						</article>
					))}
				</div>
			)}
			{activeTab === 'messages' && (
				<div className="dashboard-list">
					{visibleMessages.length === 0 ? (
						<div className="dashboard-empty">
							<MessageCircle size={23} /><p>It’s quiet in here.</p><span>Questions, thoughts, tiny updates. We’re around.</span>
							{!isAdmin && <button className="text-link" onClick={onOpenMessage}>WRITE A MESSAGE <Send size={13} /></button>}
						</div>
					) : visibleMessages.map((message) => (
						<article className="message-item" key={message.id}>
							<span className="message-from">{isAdmin ? `${message.name} · ${message.email}` : 'YOU'} <span>{new Date(message.sentAt).toLocaleDateString('en-NG')}</span></span>
							<p>{message.body}</p>
							{isAdmin && (
								<select aria-label={`Update message status for ${message.name}`} value={message.status || 'UNREAD'} onChange={(event) => onUpdateMessageStatus(message.id, event.target.value)}>
									<option value="UNREAD">Unread</option><option value="READ">Read</option><option value="REPLIED">Replied</option>
								</select>
							)}
						</article>
					))}
				</div>
			)}
			{!isAdmin && activeTab === 'messages' && visibleMessages.length > 0 && (
				<button className="dashboard-compose dashboard-message-compose" onClick={onOpenMessage}>WRITE A MESSAGE <Send size={13} /></button>
			)}
			<p className="dashboard-footnote"><LockKeyhole size={13} /> Private to you and the Ashworld team. Demo data is saved in this browser.</p>
		</section>
	);
}