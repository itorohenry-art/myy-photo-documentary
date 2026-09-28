
import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AnnouncementBar, SiteFooter, SiteHeader } from './components/layout/index.js';
import { AuthDialog, BookingDialog, ClientReviewDialog, DashboardDialog, MessageDialog, ModalLayer, ProjectStoryDialog, ReelDialog, Toast } from './components/dialogs/index.js';
import { ContactSection, HeroSection, ManifestoSection, ReviewsSection, SelectedWorkSection, ServicesSection, StudioIntroSection } from './components/sections/index.js';
import { ProtectedRoute } from './components/auth/ProtectedRoute.jsx';
import { projects, services } from './data/studioContent.js';
import { formatNaira } from './utils/currency.js';
import { apiRequest, getArray, getAuthToken, getAuthUser, unwrapData } from './api/client.js';
import { read, STORAGE, write } from './utils/demoStorage.js';
import '../style.css';
import './styles/ashworld.css';
import './styles/ashworld-portfolio.css';
import './styles/ashworld-atmosphere.css';

function toBookingView(booking, fallbackUser) {
	return {
		...booking,
		name: booking.client?.name || booking.user?.name || booking.name || fallbackUser?.name || 'Client',
		email: booking.client?.email || booking.user?.email || booking.email || fallbackUser?.email || '',
		service: booking.service?.name || booking.serviceName || 'Photography session',
		date: booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('en-NG') : '',
		brief: booking.notes || '',
		status: String(booking.status || 'PENDING'),
	};
}

function toMessageView(message) {
	return { ...message, body: message.message, sentAt: message.createdAt, replies: [] };
}

export default function App() {
	return <BrowserRouter><AppRoutes /></BrowserRouter>;
}

function AppRoutes() {
	const navigate = useNavigate();
	const location = useLocation();
	const [user, setUser] = useState(() => localStorage.getItem(STORAGE.token) ? read(STORAGE.session, null) : null);
	const [token, setToken] = useState(() => localStorage.getItem(STORAGE.token) || '');
	const [modal, setModal] = useState(null);
	const [activeProject, setActiveProject] = useState(null);
	const [mobileOpen, setMobileOpen] = useState(false);
	const [notice, setNotice] = useState('');
	const [bookings, setBookings] = useState([]);
	const [messages, setMessages] = useState([]);
	const [apiServices, setApiServices] = useState([]);
	const [dashboardStats, setDashboardStats] = useState(null);
	const [pendingUser, setPendingUser] = useState(() => {
		try { return JSON.parse(sessionStorage.getItem('ashworld-pending-user') || 'null'); } catch { return null; }
	});
	const [authError, setAuthError] = useState('');
	const [authMessage, setAuthMessage] = useState('');
	const [bookingError, setBookingError] = useState('');
	const [reviewError, setReviewError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [dashboardError, setDashboardError] = useState('');
	const [activeTab, setActiveTab] = useState('bookings');
	const authView = location.pathname === '/register' ? 'register' : location.pathname === '/verify-email' ? 'verify' : 'login';
	const bookingServices = apiServices.length ? apiServices : [...services.map((service) => ({ ...service, name: service.title })), { name: 'Something a little different' }];

	useEffect(() => {
		if (token) return;
		localStorage.removeItem(STORAGE.session);
		setUser(null);
	}, [token]);

	useEffect(() => {
		if (!notice) return undefined;
		const timeout = window.setTimeout(() => setNotice(''), 3200);
		return () => window.clearTimeout(timeout);
	}, [notice]);

	useEffect(() => {
		const onKeyDown = (event) => { if (event.key === 'Escape') setModal(null); };
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, []);

	useEffect(() => {
		let cancelled = false;
		apiRequest('/services').then((payload) => {
			if (!cancelled) setApiServices(getArray(payload, 'services'));
		}).catch(() => {});
		return () => { cancelled = true; };
	}, []);

	useEffect(() => {
		if (!token) return undefined;
		let cancelled = false;
		apiRequest('/auth/me', { token }).then((payload) => {
			if (cancelled) return;
			const account = getAuthUser(payload) || unwrapData(payload);
			if (account?.email) {
				const session = { id: account.id, name: account.name, email: account.email, role: String(account.role || 'CLIENT').toLowerCase() };
				write(STORAGE.session, session);
				setUser(session);
			}
		}).catch(() => {
			if (cancelled) return;
			localStorage.removeItem(STORAGE.token);
			localStorage.removeItem(STORAGE.session);
			setToken('');
			setUser(null);
		});
		return () => { cancelled = true; };
	}, [token]);

	useEffect(() => {
		if (!token || !user) return undefined;
		const controller = new AbortController();
		const loadDashboard = async () => {
			setDashboardError('');
			try {
				const [bookingPayload, messagePayload, statsPayload] = await Promise.all([
					apiRequest(user.role === 'admin' ? '/bookings' : '/bookings/my', { token, signal: controller.signal }),
					user.role === 'admin' ? apiRequest('/messages', { token, signal: controller.signal }) : Promise.resolve(null),
					user.role === 'admin' ? apiRequest('/admin/dashboard', { token, signal: controller.signal }) : Promise.resolve(null),
				]);
				if (controller.signal.aborted) return;
				setBookings(getArray(bookingPayload, 'bookings').map((booking) => toBookingView(booking, user)));
				setMessages(messagePayload ? getArray(messagePayload, 'messages').map(toMessageView) : []);
				setDashboardStats(statsPayload ? unwrapData(statsPayload) : null);
			} catch (error) {
				if (!controller.signal.aborted) setDashboardError(error.message);
			}
		};
		loadDashboard();
		return () => controller.abort();
	}, [token, user, location.pathname]);

	const showAuth = (view = 'login') => {
		setAuthError('');
		setAuthMessage('');
		setMobileOpen(false);
		navigate(view === 'register' ? '/register' : '/login');
	};

	const openBooking = () => {
		setBookingError('');
		if (!user || !token) {
			setNotice('Sign in or create an account to request a booking.');
			navigate('/login', { state: { from: { pathname: '/client' } } });
			return;
		}
		setModal('booking');
		setMobileOpen(false);
	};

	const openProject = (project) => {
		setActiveProject(project);
		setModal('project');
	};

	const establishSession = (account) => {
		const session = { id: account.id, name: account.name, email: account.email, role: String(account.role || 'CLIENT').toLowerCase() };
		write(STORAGE.session, session);
		setToken(account.token);
		localStorage.setItem(STORAGE.token, account.token);
		setUser(session);
	};

	const completeSignIn = (account) => {
		setModal(null);
		establishSession(account);
		const requestedPath = location.state?.from?.pathname;
		const role = String(account.role || 'CLIENT').toLowerCase();
		const defaultPath = role === 'admin' ? '/admin' : '/client';
		const allowedPath = role === 'admin' ? ['/admin', '/client'] : ['/client'];
		navigate(allowedPath.includes(requestedPath) ? requestedPath : defaultPath, { replace: true });
	};

	const handleRegister = (event) => {
		event.preventDefault();
		const form = new FormData(event.currentTarget);
		const name = String(form.get('name') || '').trim();
		const email = String(form.get('email') || '').trim().toLowerCase();
		const password = String(form.get('password') || '');
		setIsSubmitting(true);
		setAuthError('');
		setAuthMessage('');
		apiRequest('/auth/register', { method: 'POST', body: { name, email, password } }).then(() => {
			const pending = { name, email };
			setPendingUser(pending);
			sessionStorage.setItem('ashworld-pending-user', JSON.stringify(pending));
			navigate('/verify-email');
		}).catch((error) => setAuthError(error.message)).finally(() => setIsSubmitting(false));
	};

	const handleVerify = (event) => {
		event.preventDefault();
		const otp = String(new FormData(event.currentTarget).get('code') || '').trim();
		if (!pendingUser?.email) { navigate('/register', { replace: true }); return; }
		setIsSubmitting(true);
		setAuthError('');
		setAuthMessage('');
		apiRequest('/auth/verify-email', { method: 'POST', body: { email: pendingUser.email, otp } }).then(() => {
			sessionStorage.removeItem('ashworld-pending-user');
			setAuthMessage('Email verified. Sign in to continue.');
			navigate('/login', { replace: true });
		}).catch((error) => setAuthError(error.message)).finally(() => setIsSubmitting(false));
	};

	const handleResendVerification = () => {
		if (!pendingUser?.email) return;
		setIsSubmitting(true);
		setAuthError('');
		setAuthMessage('');
		apiRequest('/auth/resend-verification', { method: 'POST', body: { email: pendingUser.email } }).then((payload) => {
			setAuthMessage(payload?.message || 'A new verification code has been sent.');
		}).catch((error) => setAuthError(error.message)).finally(() => setIsSubmitting(false));
	};

	const handleLogin = (event) => {
		event.preventDefault();
		const form = new FormData(event.currentTarget);
		const email = String(form.get('email') || '').trim().toLowerCase();
		const password = String(form.get('password') || '');
		setIsSubmitting(true);
		setAuthError('');
		setAuthMessage('');
		apiRequest('/auth/login', { method: 'POST', body: { email, password } }).then(async (payload) => {
			const accessToken = getAuthToken(payload);
			if (!accessToken) throw new Error('The API login response did not include an access token.');
			let account = getAuthUser(payload);
			if (!account?.email) account = getAuthUser(await apiRequest('/auth/me', { token: accessToken }));
			if (!account?.email) throw new Error('Signed in, but the API did not return your account details.');
			completeSignIn({ ...account, token: accessToken });
		}).catch((error) => setAuthError(error.message)).finally(() => setIsSubmitting(false));
	};

	const handleBooking = (event) => {
		event.preventDefault();
		const form = new FormData(event.currentTarget);
		const serviceSelection = String(form.get('service') || '');
		const selectedService = bookingServices.find((service) => (service.id || service.name) === serviceSelection);
		const date = String(form.get('date') || '');
		const time = String(form.get('time') || '');
		const brief = String(form.get('brief') || '').trim();
		const budget = Number(form.get('budget'));
		if (!date || !selectedService || !brief) {
			setBookingError('Choose a service and date, then add a short project brief.');
			return;
		}
		const bookingDate = new Date(`${date}T${time || '09:00'}`);
		const notes = [`Service: ${selectedService.name}`, brief, budget > 0 ? `Estimated budget: ${formatNaira(budget)}` : ''].filter(Boolean).join('\n\n');
		const body = {
			...(selectedService.id ? { serviceId: selectedService.id } : {}),
			bookingDate: bookingDate.toISOString(),
			...(time ? { bookingTime: new Date(`2000-01-01T${time}`).toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' }) } : {}),
			location: String(form.get('location') || 'Lagos, Nigeria').trim(),
			notes,
		};
		setIsSubmitting(true);
		setBookingError('');
		apiRequest('/bookings', { method: 'POST', token, body }).then(async () => {
			const payload = await apiRequest(user.role === 'admin' ? '/bookings' : '/bookings/my', { token });
			setBookings(getArray(payload, 'bookings').map((booking) => toBookingView(booking, user)));
			setModal(null);
			setNotice('Your booking request has been sent to Ashworld.');
		}).catch((error) => setBookingError(error.message)).finally(() => setIsSubmitting(false));
	};

	const handleSendMessage = (event) => {
		event.preventDefault();
		const form = new FormData(event.currentTarget);
		const body = String(form.get('body') || '').trim();
		const name = String(form.get('name') || user?.name || '').trim();
		const email = String(form.get('email') || user?.email || '').trim().toLowerCase();
		if (!body || !name || !email) return;
		setIsSubmitting(true);
		apiRequest('/messages', { method: 'POST', body: {
			name,
			email,
			phone: String(form.get('phone') || '').trim(),
			subject: String(form.get('subject') || 'Ashworld project enquiry').trim(),
			message: body,
		} }).then(() => {
			setModal(null);
			setNotice('Your message has been sent to Ashworld.');
		}).catch((error) => setNotice(error.message)).finally(() => setIsSubmitting(false));
	};

	const handleSendReview = (event) => {
		event.preventDefault();
		const form = new FormData(event.currentTarget);
		const name = String(form.get('name') || '').trim();
		const email = String(form.get('email') || '').trim().toLowerCase();
		const rating = Number(form.get('rating'));
		const project = String(form.get('project') || '').trim();
		const testimonial = String(form.get('body') || '').trim();
		if (!name || !email || rating < 1 || rating > 5 || !testimonial || form.get('consent') !== 'yes') {
			setReviewError('Complete the review and publication permission to submit.');
			return;
		}
		const message = [`Rating: ${rating}/5 stars`, project ? `Project: ${project}` : '', `Testimonial: ${testimonial}`, 'Publication permission: granted for review; approval is not automatic.'].filter(Boolean).join('\n\n');
		setIsSubmitting(true);
		setReviewError('');
		apiRequest('/messages', { method: 'POST', body: { name, email, subject: `Client testimonial submission · ${rating}/5 stars`, message } }).then(() => {
			setModal(null);
			setNotice('Your review has been sent privately to Ashworld for review.');
		}).catch((error) => setReviewError(error.message)).finally(() => setIsSubmitting(false));
	};

	const updateBooking = (bookingId, status) => {
		apiRequest(`/bookings/admin/${bookingId}`, { method: 'PATCH', token, body: { status } }).then(() => {
			setBookings((current) => current.map((booking) => booking.id === bookingId ? { ...booking, status } : booking));
		}).catch((error) => setDashboardError(error.message));
	};

	const updateMessageStatus = (messageId, status) => {
		apiRequest(`/messages/${messageId}/status`, { method: 'PATCH', token, body: { status } }).then(() => {
			setMessages((current) => current.map((message) => message.id === messageId ? { ...message, status } : message));
		}).catch((error) => setDashboardError(error.message));
	};

	const signOut = () => {
		localStorage.removeItem(STORAGE.session);
		localStorage.removeItem(STORAGE.token);
		setUser(null);
		setToken('');
		setModal(null);
		navigate('/');
		setNotice('You’re signed out. See you next time.');
	};

	const openDashboard = () => navigate(user?.role === 'admin' ? '/admin' : '/client');
	const switchAuthRoute = (view) => {
		setAuthError('');
		navigate(view === 'register' ? '/register' : '/login');
	};
	const landingPage = (
		<main>
			<HeroSection />
			<StudioIntroSection />
			<SelectedWorkSection projects={projects} onOpenProject={openProject} />
			<ServicesSection services={services} onOpenBooking={openBooking} />
			<ReviewsSection onWriteReview={() => { setReviewError(''); setModal('review'); }} />
			<ManifestoSection />
			<ContactSection onOpenBooking={openBooking} />
		</main>
	);
	const authPage = (view) => (
		<>
			{landingPage}
			<ModalLayer onClose={() => navigate('/')}>
				<AuthDialog authView={view} setAuthView={switchAuthRoute} authError={authError} authMessage={authMessage} initialEmail={pendingUser?.email || ''} pendingUser={pendingUser} isSubmitting={isSubmitting} onResendVerification={handleResendVerification} onClose={() => navigate('/')} onLogin={handleLogin} onRegister={handleRegister} onVerify={handleVerify} />
			</ModalLayer>
		</>
	);
	const dashboardPage = (role) => (
		<ProtectedRoute user={user} role={role}>
			<div className="account-route">
				<DashboardDialog user={user} bookings={bookings} messages={messages} dashboardStats={dashboardStats} dashboardError={dashboardError} activeTab={activeTab} setActiveTab={setActiveTab} onClose={() => navigate('/')} onSignOut={signOut} onOpenBooking={openBooking} onOpenMessage={() => setModal('message')} onUpdateBooking={updateBooking} onUpdateMessageStatus={updateMessageStatus} />
			</div>
		</ProtectedRoute>
	);

	return (
		<>
			<AnnouncementBar />
			<SiteHeader user={user} mobileOpen={mobileOpen}
				onToggleMenu={() => setMobileOpen(!mobileOpen)}
				onCloseMenu={() => setMobileOpen(false)}
				onOpenAuth={() => showAuth('register')}
				onOpenDashboard={openDashboard}
			/>
			<Routes>
				<Route path="/" element={landingPage} />
				<Route path="/netizen.html" element={<Navigate to="/" replace />} />
				<Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/client'} replace /> : authPage('login')} />
				<Route path="/register" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/client'} replace /> : authPage('register')} />
				<Route path="/verify-email" element={user ? <Navigate to="/client" replace /> : pendingUser ? authPage('verify') : <Navigate to="/register" replace />} />
				<Route path="/client" element={dashboardPage('client')} />
				<Route path="/admin" element={dashboardPage('admin')} />
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
			<SiteFooter user={user} onOpenAuth={() => showAuth()} onOpenDashboard={openDashboard} />
			<Toast notice={notice} />
			{modal && (
				<ModalLayer onClose={() => setModal(null)}>
					{modal === 'project' && activeProject && <ProjectStoryDialog project={activeProject} onClose={() => setModal(null)} onOpenBooking={openBooking} />}
					{modal === 'booking' && <BookingDialog user={user} services={bookingServices} error={bookingError} isSubmitting={isSubmitting} onClose={() => setModal(null)} onSubmit={handleBooking} />}
					{modal === 'reel' && <ReelDialog onClose={() => setModal(null)} />}
					{modal === 'message' && <MessageDialog user={user} onClose={() => setModal(null)} onSubmit={handleSendMessage} />}
					{modal === 'review' && <ClientReviewDialog user={user} error={reviewError} isSubmitting={isSubmitting} onClose={() => setModal(null)} onSubmit={handleSendReview} />}
				</ModalLayer>
			)}
		</>
	);
}