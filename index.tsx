
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from "@google/genai";

// --- CONTROL DE ESTADO DEL SORTEO ---
const IS_RAFFLE_OPEN = false; 

// --- SUPABASE CONFIGURATION ---
const SUPABASE_URL = 'https://epyqaqxlgqcxbenaydct.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVweXFhcXhsZ3FjeGJlbmF5ZGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NzAyOTIsImV4cCI6MjA4MDM0NjI5Mn0.4FKPSM-UfQlfrKQoXRnBps9RLCX2MT8HkqcQlEHgc5Q';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Icons
const ListIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>);
const BookIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>);
const XIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const MenuIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>);

const ConfettiBackground = () => (
    <div className="confetti-container">
        {[...Array(15)].map((_, i) => (
            <div key={i} className="confetti" style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                backgroundColor: ['#e1306c', '#833ab4', '#fd1d1d', '#fcb045', '#00b894'][Math.floor(Math.random() * 5)],
                width: `${Math.random() * 10 + 5}px`,
                height: `${Math.random() * 10 + 5}px`
            }}></div>
        ))}
    </div>
);

function ThankYouAnnouncementModal({ onClose }: { onClose: () => void }) {
    return (
        <div className="modal-overlay-fullscreen">
            <div className="announcement-pop-container">
                <ConfettiBackground />
                <button className="promo-close-btn" onClick={onClose}><XIcon /></button>
                <div className="promo-pill">COMUNIDAD TRIBU 🚀</div>
                <h2 className="promo-title">¡GRACIAS POR PARTICIPAR!</h2>
                <div className="promo-main-stat">+1800</div>
                <p className="promo-subtitle">EMPRENDEDORES CONECTADOS</p>
                <div className="promo-details">
                    <div className="promo-detail-item">
                        <span className="promo-detail-val">36</span>
                        <span className="promo-detail-lbl">REGALOS</span>
                    </div>
                </div>
                <p className="promo-text">El sorteo ha cerrado inscripciones con un éxito rotundo. ¡Atento a los resultados!</p>
                <button className="promo-action-btn" onClick={onClose}>¡ENTENDIDO!</button>
            </div>
        </div>
    );
}

function App() {
  const [entries, setEntries] = useState<any[]>([]);
  const [isThankYouOpen, setIsThankYouOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchEntries = async () => {
      const { data } = await supabase.from('entrepreneurs').select('*').limit(32);
      if (data) setEntries(data);
    };
    fetchEntries();
    if (!IS_RAFFLE_OPEN) {
        setTimeout(() => setIsThankYouOpen(true), 800);
    }
  }, []);

  return (
    <div className="site-wrapper">
      <nav className="main-nav">
        <div className="nav-container">
          <div className="nav-logo">SorteoTribu</div>
          <div className={`nav-links ${mobileMenuOpen ? 'mobile-active' : ''}`}>
            <button className="nav-item"><ListIcon /> Lista Oficial</button>
            <button className="nav-item"><BookIcon /> Directorio</button>
            {!IS_RAFFLE_OPEN && <span className="status-badge">Sorteo Finalizado</span>}
          </div>
          <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <MenuIcon />
          </button>
        </div>
      </nav>

      <main>
        <header className="hero">
          <ConfettiBackground />
          <div className="container hero-content">
            <h1 className="hero-h1">¡GANA PREMIOS <span className="gradient-text">PARA TU NEGOCIO!</span></h1>
            <p className="hero-p">Un evento único donde la comunidad premia a la comunidad.</p>
            <div className="status-box">
              <h3>Inscripciones Finalizadas</h3>
              <p>Gracias a los más de 1800 participantes. El periodo de ingreso ha cerrado.</p>
              <div className="prize-count-badge">32 PREMIOS CONFIRMADOS 🎁</div>
            </div>
          </div>
        </header>

        <section className="prizes-section">
          <div className="container">
            <h2 className="section-title">🎁 Galería de Premios</h2>
            <div className="prizes-grid">
              {entries.map((e) => (
                <div key={e.id} className="prize-card">
                  <div className="prize-img-wrapper">
                    <img src={e.prize_image_url || 'https://via.placeholder.com/400'} alt={e.business_name} />
                  </div>
                  <div className="prize-body">
                    <h4>{e.business_name}</h4>
                    <p>{e.prize}</p>
                    <span className="prize-val">S/ {e.prize_value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="main-footer">
          <div className="container footer-inner">
              <div className="footer-logo">iM</div>
              <p>Iniciativa de <strong>INFOMERCADO TRIBU</strong></p>
              <small>Mago26 & GAOR System</small>
          </div>
      </footer>

      {isThankYouOpen && <ThankYouAnnouncementModal onClose={() => setIsThankYouOpen(false)} />}
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) createRoot(rootElement).render(<App />);
