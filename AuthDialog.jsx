import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { DialogCloseButton } from './DialogPrimitives.jsx';

export function AuthDialog({ authView, setAuthView, authError, authMessage, initialEmail, pendingUser, onClose, onLogin, onRegister, onVerify, onResendVerification, isSubmitting }) {
	return (
		<section className="dialog auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title">
			<DialogCloseButton onClose={onClose} />
			{authView === 'verify' ? (
				<>
					<span className="dialog-eyebrow"><ShieldCheck size={15} /> ONE LAST THING</span>
					<h2 id="auth-title">Check your <em>inbox.</em></h2>
					<p className="dialog-copy">Enter the verification code sent to <strong>{pendingUser?.email || initialEmail}</strong>.</p>
					<form className="dialog-form" onSubmit={onVerify}>
						<label>6-DIGIT CODE<input name="code" autoComplete="one-time-code" inputMode="numeric" maxLength="6" placeholder="000000" required /></label>
						{authError && <p className="form-error">{authError}</p>}
						{authMessage && <p className="auth-message" role="status">{authMessage}</p>}
						<button className="form-submit" disabled={isSubmitting}>{isSubmitting ? 'VERIFYING…' : 'VERIFY EMAIL'} <ArrowRight size={15} /></button>
					</form>
					<button className="form-switch" onClick={onResendVerification} disabled={isSubmitting}>Resend verification code</button>
					<button className="form-switch" onClick={() => { setAuthView('register'); setAuthError(''); }}>Back to create account</button>
				</>
			) : (
				<>
					<span className="dialog-eyebrow"><LockKeyhole size={14} /> THE ASHWORLD CLIENT SPACE</span>
					<h2 id="auth-title">{authView === 'register' ? <>Make yourself <em>at home.</em></> : <>Good to have <em>you back.</em></>}</h2>
					<p className="dialog-copy">{authView === 'register' ? 'Create your Ashworld account to book a project and stay in touch with the studio.' : 'Sign in to follow a project or pick up a conversation.'}</p>
					<div className="auth-switcher">
						<button className={authView === 'login' ? 'is-active' : ''} onClick={() => { setAuthView('login'); authError(''); }}>SIGN IN</button>
						<button className={authView === 'register' ? 'is-active' : ''} onClick={() => { setAuthView('register'); authError(''); }}>CREATE ACCOUNT</button>
					</div>
					<form className="dialog-form" onSubmit={authView === 'register' ? onRegister : onLogin}>
						{authView === 'register' && <label>YOUR NAME<input name="name" autoComplete="name" required placeholder="First and last name" /></label>}
						<label>EMAIL ADDRESS<input name="email" type="email" autoComplete="email" defaultValue={initialEmail || ''} required placeholder="you@example.com" /></label>
						<label>PASSWORD<input name="password" type="password" autoComplete={authView === 'register' ? 'new-password' : 'current-password'} minLength={authView === 'register' ? 8 : undefined} required placeholder={authView === 'register' ? 'At least 8 characters' : 'Your password'} /></label>
						{authError && <p className="form-error">{authError}</p>}
						{authMessage && <p className="auth-message" role="status">{authMessage}</p>}
						<button className="form-submit" disabled={isSubmitting}>{isSubmitting ? 'PLEASE WAIT…' : authView === 'register' ? 'CREATE YOUR ACCOUNT' : 'SIGN IN TO YOUR ACCOUNT'} <ArrowRight size={15} /></button>
					</form>
					<p className="demo-disclaimer">Your account is secured by Ashworld authentication.</p>
				</>
			)}
		</section>
	);
}