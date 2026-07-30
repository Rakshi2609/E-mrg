import Link from 'next/link';
import InteractiveGrid from '../components/InteractiveGrid';
import { InstallAppButton } from '../components/InstallAppButton';

export default function Home() {
  return (
    <main className="landing-page">
      <div className="bg-glow"></div>
      
      <nav className="navbar">
        <div className="nav-brand">
          <div className="brand-logo">
            <span style={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-1px' }}>EM</span>
          </div>
          EMRG
        </div>
        <div className="nav-links">
          <Link href="#features">Features</Link>
          <Link href="#how-it-works">Architecture</Link>
          <Link href="/records">Records DB</Link>
          <Link href="/chat">AI Chatbot</Link>
        </div>
        <div className="nav-actions">
          <InstallAppButton />
          <Link href="/dashboard" className="nav-btn">Open Dashboard</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="interactive-grid-container">
          <InteractiveGrid />
        </div>
        
        <div className="hero-content animate-fade-up">
          <div className="hero-badge">
            <span className="pulse-dot" style={{width: 6, height: 6}}></span>
            Copilot for Dispatchers
          </div>
          <h1>
            Smart Intake.<br />
            Human Decisions.<br />
            <span className="highlight-gradient">Better Outcomes.</span>
          </h1>
          <p className="animate-fade-up delay-100 hero-desc">
            E-MRG is an AI Dispatcher Copilot that handles the first critical minutes of an emergency call, automatically transcribing and extracting context so human dispatchers can focus on saving lives.
          </p>
          <div className="hero-actions animate-fade-up delay-200">
            <Link href="/dashboard" className="btn-primary">
              See It In Action
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link href="#features" className="btn-outline">
              Read the Docs
            </Link>
          </div>
          
          <div className="trusted-by animate-fade-up delay-300">
            <span className="trusted-text">Deployed in next-gen 911 centers</span>
            <div className="trusted-logos">
              <div className="trusted-logo-pill">
                <svg viewBox="0 0 100 30" fill="currentColor"><path d="M10 15a5 5 0 100-10 5 5 0 000 10zm15 0a5 5 0 100-10 5 5 0 000 10zm15 0a5 5 0 100-10 5 5 0 000 10z"/></svg>
              </div>
              <div className="trusted-logo-pill">
                <svg viewBox="0 0 100 30" fill="currentColor"><rect x="10" y="5" width="20" height="20" rx="4"/><circle cx="50" cy="15" r="10"/><path d="M80 5l10 20h-20z"/></svg>
              </div>
              <div className="trusted-logo-pill">
                <svg viewBox="0 0 100 30" fill="currentColor"><path d="M20 15h60M50 5v20" stroke="currentColor" strokeWidth="4"/></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-visual animate-fade-up delay-200">
          <div className="floating-card-wrapper">
            <div className="floating-card">
              <div className="card-header">
                <div className="pulse-wrapper">
                  <div className="pulse-dot"></div>
                  LIVE CALL
                </div>
                <div className="card-timer">00:01:24</div>
              </div>
              <div className="card-content">
                <h4>Call #EMRG-2025-0415</h4>
                <p>Incoming emergency channel. Transcribing audio in real-time...</p>
                
                <div className="waveform">
                  {[12, 24, 16, 8, 20, 32, 24, 12, 8, 16, 24, 20, 12, 8, 16].map((h, i) => (
                    <div key={i} className={`wave-bar ${i > 4 && i < 11 ? 'active' : ''}`} style={{ height: `${h}px`, animationDelay: `${i * 0.1}s` }}></div>
                  ))}
                </div>

                <div className="card-detail-group">
                  <div className="card-detail">
                    <div className="detail-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></div>
                    <div>
                      <h5>INCIDENT TYPE</h5>
                      <p>Medical Emergency - High</p>
                    </div>
                  </div>
                  <div className="card-detail">
                    <div className="detail-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
                    <div>
                      <h5>LOCATION</h5>
                      <p>123 Main St, Apt 4B</p>
                    </div>
                  </div>
                </div>
                <Link href="/dashboard" className="card-link">
                  Enter Dispatch Dashboard
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="integrations-section" id="integrations">
        <div className="integrations-inner">
          <p className="integrations-subtitle">SEAMLESSLY INTEGRATES WITH EXISTING TELECOM INFRASTRUCTURE</p>
          <div className="integrations-marquee">
            <div className="i-logo">TWILIO</div>
            <div className="i-logo">MOTOROLA SOLUTIONS</div>
            <div className="i-logo">ZETRON</div>
            <div className="i-logo">AVAYA</div>
            <div className="i-logo">RAPIDSOS</div>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="section-container" id="features">
        <div className="features-header">
          <h2>Everything you need to save lives.</h2>
          <p>E-MRG isn't just a transcription tool. It's a complete AI-driven pipeline designed for mission-critical emergency response.</p>
        </div>
        
        <div className="premium-bento-grid">
          {/* Feature 1 */}
          <div className="p-bento-card large group">
            <div className="p-bento-content">
              <div className="p-bento-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
              <h3>Real-time AI Transcription</h3>
              <p>Our fine-tuned models listen to the caller and transcribe the emergency in real-time, extracting intent, severity, and weapons presence with 99.9% accuracy.</p>
            </div>
            <div className="p-bento-visual">
              <div className="mock-transcript">
                <div className="m-line">"I need an ambulance at 123 Main St."</div>
                <div className="m-line ai">AI: Address identified. Extracting severity...</div>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="p-bento-card group">
            <div className="p-bento-content">
              <div className="p-bento-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
              <h3>Instant Geolocating</h3>
              <p>Automatically pings cellular towers and extracts addresses from speech.</p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="p-bento-card group">
            <div className="p-bento-content">
              <div className="p-bento-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
              <h3>Lightning Fast Routing</h3>
              <p>Routes the call to the closest available human dispatcher in under 1.5 seconds.</p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="p-bento-card large group">
            <div className="p-bento-content">
              <div className="p-bento-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
              <h3>Human in the Loop</h3>
              <p>AI is an assistant, not a replacement. Human dispatchers always have the final say, with the AI providing the context they need to make decisions faster.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Pipeline */}
      <section className="section-container" id="how-it-works">
        <div className="pipeline-wrapper">
          <div className="pipeline-header">
            <span className="p-badge">THE ARCHITECTURE</span>
            <h2>How E-MRG processes an emergency in 1.5 seconds.</h2>
          </div>
          
          <div className="pipeline-steps">
            <div className="p-step">
              <div className="p-step-num">01</div>
              <h4>Call Intercept</h4>
              <p>Twilio webhooks stream audio to secure ingestion servers.</p>
            </div>
            <div className="p-step">
              <div className="p-step-num">02</div>
              <h4>Parallel Processing</h4>
              <p>Audio is simultaneously transcribed by whisper models.</p>
            </div>
            <div className="p-step">
              <div className="p-step-num">03</div>
              <h4>Entity Extraction</h4>
              <p>Gemma LLM extracts who, what, where, and weapons status.</p>
            </div>
            <div className="p-step">
              <div className="p-step-num">04</div>
              <h4>Dispatch Handoff</h4>
              <p>Structured payload pushed via WebSocket to Dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Showcase */}
      <section className="section-container" id="product">
        <div className="premium-showcase">
          <div className="showcase-text">
            <span className="p-badge" style={{ color: '#000', borderColor: '#000', background: 'transparent' }}>DISPATCHER DASHBOARD</span>
            <h2 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.04em', margin: '1rem 0 1.5rem', color: '#000', lineHeight: 1.1 }}>Context is everything. We serve it instantly.</h2>
            <p style={{ fontSize: '1.15rem', color: '#52525b', marginBottom: '2.5rem', lineHeight: 1.6 }}>Live transcripts, incident summaries, confidence indicators, interactive maps, and historical caller data all in one zero-latency interface.</p>
            <Link href="/dashboard" className="btn-solid-black" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              Open the Dashboard
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
          <div className="showcase-image-premium">
            <img src="/dashboard_mockup.jpg" alt="Dispatcher Dashboard Mockup" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="premium-cta">
        <div className="premium-cta-inner">
          <h2>Ready to upgrade your dispatch center?</h2>
          <p>Join the next generation of emergency response. Deploy E-MRG alongside your existing infrastructure today.</p>
          <div className="cta-buttons">
            <Link href="/dashboard" className="btn-solid-black">Open Dashboard</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="modern-footer">
        <div className="modern-footer-content">
          <div className="f-brand">
            <div className="f-logo">
              <span style={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-1px' }}>EM</span>
            </div>
            <span>E-MRG &copy; 2026</span>
          </div>
          <div className="f-links">
            <Link href="#">Privacy</Link>
            <Link href="#">Terms</Link>
            <Link href="#">Security</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
