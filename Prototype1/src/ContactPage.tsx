import { useState } from "react";
import MainNav from "./components/MainNav";
import StyleInject from "./components/StyleInject";
import { COLORS, Container } from "./components/common";
import Cards from "./sections/home/Cards";
import MomentsMarquee from "./sections/home/MomentsMarquee";
import Footer from "./sections/home/Footer";

function GlobalBackground({ scoped = false }: { scoped?: boolean }) {
  const base = scoped ? "about-bgfx-scope" : "about-bgfx";
  return (
    <>
      <style>{`
        .about-bgfx{position:fixed; inset:0; pointer-events:none; z-index:0}
        .about-bgfx-scope{position:absolute; inset:0; pointer-events:none; z-index:0}
        .about-bgfx-base{ background:${COLORS.lightBG}; }
        .about-bgfx-aurora{ filter: blur(80px); opacity:.75; }
        .about-bgfx-aurora-b{ opacity:.55; }
        .about-bgfx-aurora-a{
          animation: about-driftA 26s ease-in-out infinite alternate;
          background:
            radial-gradient(38% 46% at 12% 20%, rgba(76,175,140,.35), transparent 62%),
            radial-gradient(36% 42% at 86% 18%, rgba(26,115,232,.24), transparent 64%);
        }
        .about-bgfx-aurora-b{
          animation: about-driftB 34s ease-in-out infinite alternate;
          background:
            radial-gradient(44% 54% at 78% 84%, rgba(255,181,67,.28), transparent 68%),
            radial-gradient(28% 34% at 18% 86%, rgba(13,140,116,.22), transparent 62%);
        }
        @keyframes about-driftA{ 0%{ transform: translate3d(-4%, -2%, 0) scale(1.02) } 50%{ transform: translate3d(4%, 1%, 0) scale(1.06) } 100%{ transform: translate3d(-2%, 3%, 0) scale(1.03) } }
        @keyframes about-driftB{ 0%{ transform: translate3d(2%, 3%, 0) scale(1.03) } 50%{ transform: translate3d(-3%, -2%, 0) scale(1.06) } 100%{ transform: translate3d(3%, -1%, 0) scale(1.02) } }
        .about-bgfx-grid{
          background-image:
            linear-gradient(to right, rgba(0,0,0,.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,.035) 1px, transparent 1px);
          background-size:24px 24px; opacity:.12;
        }
        .about-bgfx-noise{opacity:.06; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='2' stitchTiles='stitch' type='fractalNoise'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E");}
      `}</style>
      <div className={`${base} about-bgfx-base`} />
      <div className={`${base} about-bgfx-aurora about-bgfx-aurora-a`} />
      <div className={`${base} about-bgfx-aurora about-bgfx-aurora-b`} />
      <div className={`${base} about-bgfx-grid`} />
      <div className={`${base} about-bgfx-noise`} />
    </>
  );
}

export default function ContactPage() {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Keep button usable even if name/email omitted; only require a message
  const valid = message.trim().length >= 1;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || sending) return;
    setSending(true);
    // Use mailto to send via user's email client
    const subject = encodeURIComponent(`BIOTech Futures – Message from ${first} ${last}`);
    const body = encodeURIComponent(`Name: ${first} ${last}\nEmail: ${email}\n\nMessage:\n${message}`);
    const mail = `mailto:zwan9790@uni.sydney.edu.au?subject=${subject}&body=${body}`;
    // Open default email client
    window.open(mail, "_self");
    // Also copy the message details as a convenience fallback
    try {
      void navigator.clipboard?.writeText(`To: zwan9790@uni.sydney.edu.au\nSubject: BIOTech Futures – Message from ${first} ${last}\n\n${decodeURIComponent(body)}`);
    } catch {}
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setFirst("");
      setLast("");
      setEmail("");
      setMessage("");
    }, 600);
  };

  return (
    <main style={{ fontFamily: "Arial, Helvetica, sans-serif", color: COLORS.charcoal, background: "transparent", position: "relative", minHeight: "100vh" }}>
      <GlobalBackground />
      <div style={{ position: "relative", zIndex: 1 }}>
        <StyleInject />
        <MainNav />

      {/* Hero / Intro */}
      <section className="relative overflow-hidden" style={{ background: "transparent" }}>
        <Container className="py-16 md:py-20">
          <div className="reveal-in">
            <p style={{ color: COLORS.mint, fontWeight: 800, letterSpacing: 0.6 }}>GET IN TOUCH</p>
            <h1 style={{ fontSize: "clamp(28px, 4.5vw, 48px)", lineHeight: 1.1, margin: "8px 0 6px" }}>
              Got Qs? We've got answers.
            </h1>
            <p style={{ maxWidth: 720, opacity: 0.9 }}>
              Chat with the BIOTech Futures team about the Challenge, events, or how to get involved.
              Peek at our FAQs first, then shoot us a message - we're friendly!
            </p>

            <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
              <a href="#contact-form" className="btn-primary">Let's Chat</a>
              <a href="https://www.facebook.com/BIOTechFuturesChallenge/?_rdr" target="_blank" rel="noreferrer" className="btn-social btn-fb">Facebook</a>
              <a href="https://x.com/biotech_futures" target="_blank" rel="noreferrer" className="btn-social btn-tw">Twitter</a>
              <a href="https://www.instagram.com/biotech_futures/" target="_blank" rel="noreferrer" className="btn-social btn-ig">Instagram</a>
            </div>
          </div>
        </Container>
      </section>

      {/* Contact Form */}
      <section id="contact-form" className="w-full">
        <Container className="py-14 md:py-18">
          <div className="reveal-in" style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr", alignItems: "start" }}>
            <div className="card-soft" style={{ boxShadow: "0 10px 28px rgba(0,0,0,0.05)", borderRadius: 18 }}>
              <h2 style={{ marginTop: 0, marginBottom: 8, color: COLORS.green }}>Contact Us</h2>
              <p style={{ marginTop: 0, opacity: 0.9 }}>
                Can't find the answer in the FAQs? Drop your message here - we'll ping you back soon.
              </p>

              <form onSubmit={onSubmit} style={{ marginTop: 12, display: "grid", gap: 12 }}>
                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr", }}>
                  <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
                    <Field label="First Name">
                      <input value={first} onChange={(e) => setFirst(e.target.value)} required placeholder="Alex"
                             className="btf-input" aria-label="First Name" />
                    </Field>
                    <Field label="Last Name">
                      <input value={last} onChange={(e) => setLast(e.target.value)} required placeholder="Kim"
                             className="btf-input" aria-label="Last Name" />
                    </Field>
                  </div>
                  <Field label="Email">
                    <input value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@school.edu"
                           type="email" className="btf-input" aria-label="Email" />
                  </Field>
                  <Field label="Message">
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} required placeholder="Tell us what's up!"
                              rows={6} className="btf-input" aria-label="Message" />
                  </Field>
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 6 }}>
                  <button
  type="submit"
  disabled={!valid || sending}
  className="btn-primary"
  style={{
    background: sending ? COLORS.mint : COLORS.green,
    boxShadow: "0 10px 24px rgba(1,113,81,0.35)",
    opacity: !valid ? 0.7 : 1,
  }}
>
  {sending ? "Sending..." : sent ? "Sent!" : "Send Message"}
</button>
                  
                </div>
              </form>
            </div>

            <TipsCard />
          </div>
        </Container>
      </section>

      <Cards />
      <MomentsMarquee />
      <Footer />

      <style>{`
        .btf-input { width: 100%; padding: 12px 14px; border-radius: 12px; border: 1px solid #E2EEE8; background: #fff; outline: none; transition: box-shadow .15s ease, transform .1s ease; }
        .btf-input:focus { box-shadow: 0 0 0 4px rgba(1,113,81,.12); transform: translateY(-1px); }
        .field-label { font-size: 13px; font-weight: 700; color: ${COLORS.green}; margin-bottom: 6px; display: inline-flex; gap: 6px; align-items: center; }
        .btn-social { display: inline-block; padding: 10px 16px; border-radius: 14px; color: #fff; text-decoration: none; font-weight: 700; letter-spacing: .2px; box-shadow: 0 10px 24px rgba(0,0,0,0.12); transition: transform .15s ease, box-shadow .15s ease; }
        .btn-social:hover { transform: translateY(-1px); box-shadow: 0 14px 28px rgba(0,0,0,0.18); }
        .btn-fb { background: #1877F2; }
        .btn-tw { background: #000000; }
        .btn-ig { background: #E1306C; }
      `}</style>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label>
      <div className="field-label">{label} <span aria-hidden="true">*</span></div>
      {children}
    </label>
  );
}

function TipsCard() {
  return (
    <div className="card-soft" style={{ borderRadius: 18 }}>
      <h3 style={{ marginTop: 0, color: COLORS.green }}>Quick Tips</h3>
      <ul className="tick-list">
        <li>Check the FAQ for instant answers</li>
        <li>Add your school or team name</li>
        <li>Keep it short and sweet - we'll follow up!</li>
      </ul>
    </div>
  );
}

