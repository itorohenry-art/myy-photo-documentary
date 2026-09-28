import { ArrowRight } from 'lucide-react';
import { DialogCloseButton } from './DialogPrimitives.jsx';

export function BookingDialog({ user, services, error, isSubmitting, onClose, onSubmit }) {
	return (
		<section className="dialog booking-dialog" role="dialog" aria-modal="true" aria-labelledby="booking-title">
			<DialogCloseButton onClose={onClose} />
			<span className="dialog-eyebrow">GOOD THINGS START SOMEWHERE</span>
			<h2 id="booking-title">What are you <em>dreaming up?</em></h2>
			<p className="dialog-copy">Booking as <strong>{user?.name}</strong> · {user?.email}</p>
			<form className="dialog-form two-col-form" onSubmit={onSubmit}>
				<label className="form-wide">WHAT CAN WE HELP WITH?
					<select name="service" defaultValue="" required>
						<option value="" disabled>Select a service</option>
						{services.map((service) => <option key={service.id || service.number || service.name} value={service.id || service.name}>{service.name}</option>)}
					</select>
				</label>
				<label>BOOKING DATE<input name="date" type="date" min={new Date().toISOString().slice(0, 10)} required /></label>
				<label>START TIME<input name="time" type="time" /></label>
				<label className="form-wide">LOCATION<input name="location" defaultValue="Lagos, Nigeria" placeholder="City or venue" /></label>
				<label className="form-wide">PROJECT BUDGET IN NAIRA (₦)<input name="budget" type="number" min="0" step="1000" inputMode="decimal" placeholder="Optional estimate, e.g. 500000" /></label>
				<label className="form-wide">THE SHORT VERSION<textarea name="brief" rows="3" required placeholder="The idea, the place, the feeling. Whatever you have so far." /></label>
				{error && <p className="form-error form-wide">{error}</p>}
				<button className="form-submit form-wide" disabled={isSubmitting}>{isSubmitting ? 'SENDING…' : 'SEND A PROJECT NOTE'} <ArrowRight size={15} /></button>
			</form>
			<p className="form-footnote">No commitment. No awkward follow-up. Just a real conversation.</p>
		</section>
	);
}