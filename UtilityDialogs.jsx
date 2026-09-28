import { useState } from 'react';
import { ArrowRight, MessageCircle, Play, Send, Star } from 'lucide-react';
import { DialogCloseButton } from './DialogPrimitives.jsx';
import { formatNaira } from '../../utils/currency.js';
import showreelCover from '../../assets/portfolio/aso-ebi-after-dark.jpg';

export function ReelDialog({ onClose }) {
	return (
		<section className="dialog reel-dialog" role="dialog" aria-modal="true" aria-labelledby="reel-title">
			<DialogCloseButton onClose={onClose} />
			<div className="reel-still">
				<img src={showreelCover} alt="A couple holding hands in warm golden wedding light" />
				<span><Play fill="currentColor" size={23} /></span>
			</div>
			<span className="dialog-eyebrow">A LITTLE BIT ABOUT US · 01:42</span>
			<h2 id="reel-title">Out there is <em>where it starts.</em></h2>
			<p className="dialog-copy">This film reel is a preview. Replace it with your studio’s showreel when the project has a video host.</p>
		</section>
	);
}

export function ProjectStoryDialog({ project, onClose, onOpenBooking }) {
	return (
		<section className="dialog project-story-dialog" role="dialog" aria-modal="true" aria-labelledby="project-story-title">
			<DialogCloseButton onClose={onClose} />
			<div className="project-story-image">
				<img src={project.image} alt={project.alt} />
				<span>ASHWORLD FIELD NOTES <span>{project.number} / 05</span></span>
			</div>
			<div className="project-story-copy">
				<span className="dialog-eyebrow">{project.type}</span>
				<h2 id="project-story-title">{project.name}</h2>
				<p className="project-story-note">{project.story || project.note}</p>
				{project.portraitPrice && <p className="project-story-price">PORTRAIT SESSION FROM <strong>{formatNaira(project.portraitPrice)}</strong></p>}
				<div className="project-story-credit"><span>ASHWORLD · NIGERIA</span><span>{project.year}</span></div>
				<button className="form-submit" onClick={onOpenBooking}>MAKE A STORY LIKE THIS <ArrowRight size={15} /></button>
			</div>
		</section>
	);
}

export function MessageDialog({ user, onClose, onSubmit }) {
	return (
		<section className="dialog message-dialog" role="dialog" aria-modal="true" aria-labelledby="message-title">
			<DialogCloseButton onClose={onClose} />
			<span className="dialog-eyebrow"><MessageCircle size={14} /> THE STUDIO INBOX</span>
			<h2 id="message-title">Leave us <em>a note.</em></h2>
			<p className="dialog-copy">A quick question or a project update. It lands in the right inbox.</p>
			<form className="dialog-form" onSubmit={onSubmit}>
				<label>YOUR NAME<input name="name" autoComplete="name" defaultValue={user?.name || ''} required placeholder="Your name" /></label>
				<label>EMAIL ADDRESS<input name="email" type="email" autoComplete="email" defaultValue={user?.email || ''} required placeholder="you@example.com" /></label>
				<label>PHONE <span>OPTIONAL</span><input name="phone" type="tel" autoComplete="tel" placeholder="+234 801 234 5678" /></label>
				<label>SUBJECT<input name="subject" defaultValue="Ashworld project enquiry" required /></label>
				<label>YOUR MESSAGE<textarea name="body" rows="5" required placeholder="What’s on your mind?" /></label>
				<button className="form-submit">SEND TO THE STUDIO <Send size={14} /></button>
			</form>
		</section>
	);
}

export function ClientReviewDialog({ user, error, isSubmitting, onClose, onSubmit }) {
	const [rating, setRating] = useState(5);

	return (
		<section className="dialog review-dialog" role="dialog" aria-modal="true" aria-labelledby="review-title">
			<DialogCloseButton onClose={onClose} />
			<span className="dialog-eyebrow">A NOTE FROM YOU, KEPT WITH CARE</span>
			<h2 id="review-title">How did it <em>feel?</em></h2>
			<p className="dialog-copy">Your honest review helps future collaborators know what working with Ashworld is like.</p>
			<form className="dialog-form" onSubmit={onSubmit}>
				<label>YOUR NAME<input name="name" autoComplete="name" defaultValue={user?.name || ''} required placeholder="Your name" /></label>
				<label>EMAIL ADDRESS<input name="email" type="email" autoComplete="email" defaultValue={user?.email || ''} required placeholder="you@example.com" /></label>
				<label>PROJECT<input name="project" placeholder="Portrait, documentary, wedding…" /></label>
				<fieldset className="review-rating">
					<legend>YOUR RATING</legend>
					<div role="group" aria-label="Choose a rating from one to five stars">
						{Array.from({ length: 5 }, (_, index) => {
							const value = index + 1;
							return <button key={value} type="button" aria-label={`${value} ${value === 1 ? 'star' : 'stars'}`} aria-pressed={rating === value} onClick={() => setRating(value)}><Star size={25} fill={rating >= value ? 'currentColor' : 'none'} /></button>;
						})}
					</div>
					<input type="hidden" name="rating" value={rating} />
				</fieldset>
				<label>YOUR TESTIMONIAL<textarea name="body" rows="4" required placeholder="What stood out about working together?" /></label>
				<label className="review-consent"><input type="checkbox" name="consent" value="yes" required /> I give Ashworld permission to review this testimonial for publication.</label>
				{error && <p className="form-error">{error}</p>}
				<button className="form-submit" disabled={isSubmitting}>{isSubmitting ? 'SENDING…' : 'SUBMIT CLIENT REVIEW'} <Send size={14} /></button>
			</form>
			<p className="form-footnote">Your review is sent privately to the studio. It is not published automatically.</p>
		</section>
	);
}