import React from 'react';

const externalLinks = [
  ['footerWebsiteUrl', 'Website', 'website'],
  ['footerInstagramUrl', 'Instagram', 'instagram'],
  ['footerFacebookUrl', 'Facebook', 'facebook'],
  ['footerTikTokUrl', 'TikTok', 'tiktok'],
  ['footerYouTubeUrl', 'YouTube', 'youtube'],
  ['footerWhatsAppUrl', 'WhatsApp', 'whatsapp']
];

function BrandIcon({ platform }) {
  const common = { viewBox: '0 0 24 24', 'aria-hidden': true, focusable: false };
  if (platform === 'instagram') return <svg {...common}><defs><linearGradient id="instagram-brand-gradient" x1="0" x2="1" y1="1" y2="0"><stop stopColor="#ffdc80"/><stop offset=".48" stopColor="#f77737"/><stop offset="1" stopColor="#c13584"/></linearGradient></defs><rect x="2" y="2" width="20" height="20" rx="6" fill="url(#instagram-brand-gradient)"/><rect x="6" y="6" width="12" height="12" rx="4" fill="none" stroke="#fff" strokeWidth="1.8"/><circle cx="12" cy="12" r="3" fill="none" stroke="#fff" strokeWidth="1.8"/><circle cx="17.4" cy="6.8" r="1.1" fill="#fff"/></svg>;
  if (platform === 'facebook') return <svg {...common}><circle cx="12" cy="12" r="12" fill="#0866ff"/><path fill="#fff" d="M13.55 21v-8.2h2.76l.41-3.2h-3.17V7.56c0-.93.26-1.57 1.59-1.57h1.7V3.13c-.3-.04-1.34-.13-2.54-.13-2.52 0-4.25 1.54-4.25 4.38V9.6H7.2v3.2h2.85V21h3.5Z"/></svg>;
  if (platform === 'tiktok') return <svg {...common}><path fill="#25f4ee" d="M15.5 2h3.1c.2 2.2 1.4 4.1 3.4 5.1v3.4a10 10 0 0 1-3.4-1.4v6.2a6.6 6.6 0 1 1-6.6-6.6c.5 0 1 .1 1.5.2v3.5a3.3 3.3 0 1 0 1.9 3V2Z"/><path fill="#fe2c55" d="M13.5 4h3.1c.2 2.2 1.4 4.1 3.4 5.1v3.4a10 10 0 0 1-3.4-1.4v6.2a6.6 6.6 0 1 1-6.6-6.6c.5 0 1 .1 1.5.2v3.5a3.3 3.3 0 1 0 1.9 3V4Z"/><path fill="#111" d="M14.5 3h3.1c.2 2.2 1.4 4.1 3.4 5.1v3.4a10 10 0 0 1-3.4-1.4v6.2a6.6 6.6 0 1 1-6.6-6.6c.5 0 1 .1 1.5.2v3.5a3.3 3.3 0 1 0 1.9 3V3Z"/></svg>;
  if (platform === 'youtube') return <svg {...common}><rect x="1" y="4" width="22" height="16" rx="5" fill="#ff0033"/><path fill="#fff" d="m10 8 6.5 4-6.5 4V8Z"/></svg>;
  if (platform === 'whatsapp') return <svg {...common}><circle cx="12" cy="12" r="12" fill="#25d366"/><path fill="#fff" d="M6.1 18.3 7 15.5a7 7 0 1 1 2.5 2.1l-3.4.7Zm3.6-2.1.4.2a5.2 5.2 0 1 0-1.4-1.2l.3.4-.5 1.4 1.2-.8Zm6-1.5c-.2-.1-1.1-.5-1.3-.6-.2-.1-.3-.1-.5.1l-.6.7c-.1.2-.3.2-.5.1a5.8 5.8 0 0 1-2.8-2.5c-.2-.3.2-.4.5-1 .1-.2 0-.3 0-.4l-.6-1.4c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2 1 2.4a7.5 7.5 0 0 0 3 2.6c1.1.5 1.6.5 2.2.4.7-.1 1.1-.6 1.3-1 .2-.4.2-.8.1-.9-.1-.1-.2-.2-.4-.3Z"/></svg>;
  return <svg {...common}><circle cx="12" cy="12" r="11" fill="#476b55"/><circle cx="12" cy="12" r="7" fill="none" stroke="#fff" strokeWidth="1.3"/><path d="M2 12h20M12 1c2.5 2.8 3.7 6.5 3.7 11s-1.2 8.2-3.7 11c-2.5-2.8-3.7-6.5-3.7-11S9.5 3.8 12 1Z" fill="none" stroke="#fff" strokeWidth="1.1"/></svg>;
}

function safeExternalUrl(value) {
  if (!value?.trim()) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export default function Footer({ content = {}, onNavigate = () => {} }) {
  return <footer className="footer">
    <div className="footer-main">
      <div className="footer-brand">
        <a href="/" className="logo" onClick={(event) => { event.preventDefault(); onNavigate('home'); }}>
          <span className="logo-icon">g<span>+</span></span><span>{content.brandName || 'gather & bloom'}</span>
        </a>
        <p>{content.footerText || 'Good things happen when we gather.'}</p>
      </div>
    </div>
    {externalLinks.some(([key]) => safeExternalUrl(content[key])) && <nav className="footer-external-links" aria-label="Website and social links">
      {externalLinks.map(([key, label, platform]) => {
        const href = safeExternalUrl(content[key]);
        return href ? <a className={`footer-social-link footer-social-${platform}`} key={key} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}><BrandIcon platform={platform} /></a> : null;
      })}
    </nav>}
    <small>© {new Date().getFullYear()} {content.footerFineprint || 'Gather & Bloom Studio | Johannesburg'}</small>
  </footer>;
}
