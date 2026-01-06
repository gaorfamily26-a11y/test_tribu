import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from "@google/genai";
import html2canvas from 'html2canvas';

// --- CONTROL DE ESTADO DEL SORTEO ---
const IS_RAFFLE_OPEN = false; // Cambiar a 'true' para volver a habilitar inscripciones

// --- CONFIGURACIÓN INTERNACIONAL ---
const COUNTRY_CODES = [
    { code: '+51', country: 'PE', label: '🇵🇪 Perú', min: 9, max: 9 },
    { code: '+1', country: 'US', label: '🇺🇸 USA', min: 10, max: 10 },
    { code: '+1', country: 'CA', label: '🇨🇦 Canadá', min: 10, max: 10 },
    { code: '+52', country: 'MX', label: '🇲🇽 México', min: 10, max: 10 },
    { code: '+57', country: 'CO', label: '🇨🇴 Colombia', min: 10, max: 10 },
    { code: '+54', country: 'AR', label: '🇦🇷 Argentina', min: 10, max: 11 },
    { code: '+56', country: 'CL', label: '🇨🇱 Chile', min: 9, max: 9 },
    { code: '+593', country: 'EC', label: '🇪🇨 Ecuador', min: 9, max: 9 },
    { code: '+58', country: 'VE', label: '🇻🇪 Venezuela', min: 10, max: 10 },
    { code: '+591', country: 'BO', label: '🇧🇴 Bolivia', min: 8, max: 8 },
    { code: '+34', country: 'ES', label: '🇪🇸 España', min: 9, max: 9 },
    { code: '+33', country: 'FR', label: '🇫🇷 Francia', min: 9, max: 9 },
    { code: '+49', country: 'DE', label: '🇩🇪 Alemania', min: 10, max: 11 },
    { code: '+39', country: 'IT', label: '🇮🇹 Italia', min: 9, max: 10 },
    { code: '+31', country: 'NL', label: '🇳🇱 Holanda', min: 9, max: 9 },
    { code: '+43', country: 'AT', label: '🇦🇹 Austria', min: 10, max: 13 },
    { code: '+41', country: 'CH', label: '🇨🇭 Suiza', min: 9, max: 9 },
    { code: '+61', country: 'AU', label: '🇦🇺 Australia', min: 9, max: 9 },
];

// Helper to get full WhatsApp link regardless of format (Legacy Peru vs International)
const getWhatsAppLink = (phone: string) => {
    const clean = phone.replace(/\D/g, '');
    if (clean.length === 9 && clean.startsWith('9')) {
        return `https://wa.me/51${clean}`;
    }
    return `https://wa.me/${clean}`;
};

// --- ERROR BOUNDARY ---
interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, error: null };
  constructor(props: ErrorBoundaryProps) { super(props); }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState { return { hasError: true, error }; }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) { console.error("Uncaught error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'center' }}>
          <h1 style={{ color: '#e1306c' }}>Algo salió mal :(</h1>
          <p>Hubo un error al cargar la aplicación.</p>
          <pre style={{ background: '#f1f5f9', padding: '20px', borderRadius: '8px', overflow: 'auto', textAlign: 'left', fontSize: '0.8rem' }}>
            {this.state.error?.toString()}
          </pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: '20px', padding: '10px 20px', background: '#e1306c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Recargar Página</button>
        </div>
      );
    }
    return (this as any).props.children;
  }
}

// --- SUPABASE CONFIGURATION ---
const SUPABASE_URL = 'https://epyqaqxlgqcxbenaydct.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVweXFhcXhsZ3FjeGJlbmF5ZGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NzAyOTIsImV4cCI6MjA4MDM0NjI5Mn0.4FKPSM-UfQlfrKQoXRnBps9RLCX2MT8HkqcQlEHgc5Q';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- GEMINI AI HELPER ---
const getAiModel = () => {
    let apiKey = '';
    try { if (typeof process !== 'undefined' && process.env && process.env.API_KEY) apiKey = process.env.API_KEY; } catch (e) { console.warn("Environment variable access failed", e); }
    if (!apiKey) { console.warn("API Key missing. AI features will be disabled."); return null; }
    return new GoogleGenAI({ apiKey: apiKey });
};

// Icons
const GiftIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>);
const UsersIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>);
const CheckCircleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#2ecc71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>);
const XIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const MenuIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>);
const ImageIcon = ({ size=32 }: { size?: number }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>);
const InstagramIcon = ({ size=20 }: { size?: number }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>);
const FacebookIcon = ({ size=20 }: { size?: number }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>);
const TikTokIcon = ({ size=20 }: { size?: number }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>);
const GlobeIcon = ({ size=20 }: { size?: number }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path></svg>);
const SearchIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);
const BookIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>);
const TagIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>);
const StarFilledIcon = ({ size = 20, color = "#f1c40f" }: { size?: number, color?: string }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>);
const StarOutlineIcon = ({ size = 20 }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>);
const UserIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>);
const LoaderIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spinner"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>);
const WhatsAppIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>);
const LockIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>);
const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>);
const DownloadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>);
const PlusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);
const EyeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>);
const EditIcon = ({ size=20 }: { size?: number }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>);
const ShareIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>);
const QrIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>);
const ArrowRightIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>);
const SparkleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>);
const BriefcaseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>);
const RocketIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path><path d="M18 9a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"></path><path d="M9 22h6"></path><path d="M12 2v8"></path><path d="M12 10a5 5 0 0 0-5 5v3a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-3a5 5 0 0 0-5-5z"></path></svg>);
const ListIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>);

// --- INTERACTIVE CONFETTI COMPONENT ---
const ConfettiBackground = () => {
    return (
        <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none', zIndex: 1}}>
            {[...Array(20)].map((_, i) => (
                <div key={i} className="confetti" style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    backgroundColor: ['#e1306c', '#833ab4', '#fd1d1d', '#fcb045', '#00b894'][Math.floor(Math.random() * 5)],
                    width: `${Math.random() * 10 + 5}px`,
                    height: `${Math.random() * 10 + 5}px`
                }}></div>
            ))}
        </div>
    )
}

interface Entrepreneur {
  id: string;
  name: string;
  ownerName: string;
  prize: string;
  value: string;
  prizeImage: string;
  logoImage: string;
  date: Date;
  instagram: string;
  facebook?: string;
  tiktok?: string;
  website?: string;
  phone: string;
  description: string;
  category: string;
  isFeatured?: boolean;
}

interface Member {
    id: number;
    phone: string;
    name: string;
    business_name: string;
}

interface Client {
    id: number;
    created_at: string;
    name: string;
    phone: string;
    ticket_code: string;
}

const PREDEFINED_CATEGORIES = ["Moda", "Gastronomía", "Tecnología", "Salud y Belleza", "Hogar", "Servicios", "Artesanía", "Otro"];
const ADMIN_PASSWORD = "ADMIN123";

const uploadToStorage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;
    const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
    return data.publicUrl;
};

// --- PUBLIC LEDGER MODAL ---
function PublicLedgerModal({ onClose }: { onClose: () => void }) {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchClients = async () => {
            const { data } = await supabase.from('clients').select('name, ticket_code, created_at').order('created_at', { ascending: false });
            if (data) {
                const mappedClients = data.map((c: any, index: number) => ({
                    id: index, name: c.name, ticket_code: c.ticket_code, created_at: c.created_at, phone: ''
                }));
                setClients(mappedClients);
            }
            setLoading(false);
        };
        fetchClients();
    }, []);
    return (
        <div className="modal-overlay">
            <div className="modal-content-modern" style={{ maxWidth: '600px', height: '80vh', display: 'flex', flexDirection: 'column' }}>
                <button className="close-btn-modern" onClick={onClose}><XIcon /></button>
                <div className="modal-header-mission" style={{flexShrink: 0}}><h2 className="text-gradient">📜 Lista Oficial de Inscritos</h2><p className="text-gray-sm">Transparencia total. Aquí están todos los participantes.</p></div>
                <div style={{flex: 1, overflowY: 'auto', padding: '20px'}}>
                    {loading ? (<div className="text-center p-40"><LoaderIcon /> Cargando lista...</div>) : clients.length > 0 ? (
                        <table className="data-table" style={{width: '100%'}}>
                            <thead><tr><th>Fecha</th><th>Participante</th><th>Ticket</th></tr></thead>
                            <tbody>{clients.map((client, idx) => (
                                <tr key={idx}>
                                    <td style={{fontSize: '0.85rem', color: '#64748b'}}>{new Date(client.created_at).toLocaleDateString()}</td>
                                    <td style={{fontWeight: 600}}>{client.name.split(' ')[0]} {client.name.split(' ')[1] ? client.name.split(' ')[1].charAt(0) + '.' : ''}</td>
                                    <td><span className="badge-cat" style={{background: '#d1fae5', color: '#065f46'}}>{client.ticket_code}</span></td>
                                </tr>
                            ))}</tbody>
                        </table>
                    ) : (<div className="text-center p-40 text-gray">Aún no hay inscritos. ¡Sé el primero!</div>)}
                </div>
                <div style={{padding: '20px', borderTop: '1px solid #eee', textAlign: 'center', fontSize: '0.8rem', color: '#999'}}>* Por privacidad, solo mostramos el primer nombre e inicial.</div>
            </div>
        </div>
    );
}

// --- DIGITAL CARD VIEW ---
function DigitalCardView({ entrepreneurId, onBack }: { entrepreneurId: string, onBack: () => void }) {
    const [data, setData] = useState<Entrepreneur | null>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchCard = async () => {
            const { data: entData } = await supabase.from('entrepreneurs').select('*').eq('id', entrepreneurId).single();
            if (entData) {
                setData({
                    id: entData.id, name: entData.business_name, ownerName: entData.owner_name, phone: entData.phone,
                    prize: entData.prize, value: entData.prize_value, prizeImage: entData.prize_image_url || 'https://via.placeholder.com/600',
                    logoImage: entData.logo_image_url || 'https://via.placeholder.com/150', date: new Date(entData.created_at),
                    instagram: entData.instagram, facebook: entData.facebook, tiktok: entData.tiktok, website: entData.website,
                    description: entData.description, category: entData.category, isFeatured: entData.is_featured
                });
            }
            setLoading(false);
        };
        fetchCard();
    }, [entrepreneurId]);
    if (loading) return <div className="container p-40 text-center"><LoaderIcon /> Cargando tarjeta...</div>;
    if (!data) return <div className="container p-40 text-center">Empresa no encontrada</div>;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${window.location.origin}/?card=${data.id}&color=e1306c`;
    return (
        <div className="digital-card-container">
            <div className="digital-card">
                <div className="dc-header"><img src={data.logoImage} alt="Logo" className="dc-logo" /><h1 className="dc-name">{data.name}</h1><p className="dc-category">{data.category}</p><div className="dc-verified-badge"><StarFilledIcon size={14} /> MIEMBRO VERIFICADO TRIBU EMPRENDEDORES</div></div>
                <div className="dc-body"><p className="dc-description">{data.description}</p><p className="dc-owner">Gerente: {data.ownerName}</p>
                    <div className="dc-links">
                        <a href={getWhatsAppLink(data.phone)} target="_blank" className="dc-btn whatsapp"><WhatsAppIcon /> Contactar por WhatsApp</a>
                        {data.instagram && (<a href={`https://instagram.com/${data.instagram.replace('@','')}`} target="_blank" className="dc-btn instagram"><InstagramIcon /> Ver Instagram</a>)}
                        {data.facebook && (<a href={data.facebook} target="_blank" className="dc-btn facebook"><FacebookIcon /> Ver Facebook</a>)}
                        {data.website && (<a href={data.website} target="_blank" className="dc-btn website"><GlobeIcon /> Visitar Sitio Web</a>)}
                    </div>
                    <div className="dc-qr-section"><p>Escanea para guardar contacto</p><img src={qrUrl} alt="QR Code" className="dc-qr-img" /></div>
                </div>
                <div className="dc-footer"><p>Miembro de <strong>La Tribu</strong></p><button onClick={onBack} className="btn-link-simple">Ir al Sorteo</button></div>
            </div>
        </div>
    );
}

// --- ADMIN DASHBOARD ---
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
    const [entries, setEntries] = useState<Entrepreneur[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [viewEntry, setViewEntry] = useState<Entrepreneur | null>(null);
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [editingEnrolled, setEditingEnrolled] = useState<Entrepreneur | null>(null);
    const [activeTab, setActiveTab] = useState<'enrolled' | 'pending' | 'clients'>('enrolled');
    useEffect(() => { if (isAuthenticated) fetchData(); }, [isAuthenticated]);
    const handleLogin = (e: React.FormEvent) => { e.preventDefault(); if (password === ADMIN_PASSWORD) setIsAuthenticated(true); else alert('Contraseña incorrecta'); };
    const fetchData = async () => {
        setLoading(true);
        const { data: entData } = await supabase.from('entrepreneurs').select('*').order('is_featured', { ascending: false }).order('created_at', { ascending: false });
        if (entData) {
             const mappedEntries: Entrepreneur[] = entData.map(item => ({
                  id: item.id, name: item.business_name, ownerName: item.owner_name, phone: item.phone, prize: item.prize,
                  value: item.prize_value, prizeImage: item.prize_image_url, logoImage: item.logo_image_url, date: new Date(item.created_at),
                  instagram: item.instagram, facebook: item.facebook, tiktok: item.tiktok, website: item.website,
                  description: item.description, category: item.category, isFeatured: item.is_featured
              }));
            setEntries(mappedEntries);
        }
        const { data: memData } = await supabase.from('members').select('*').order('id', { ascending: false });
        if (memData) setMembers(memData);
        const { data: clientData } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
        if (clientData) setClients(clientData);
        setLoading(false);
    };
    const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase.from('entrepreneurs').update({ is_featured: !currentStatus }).eq('id', id);
            if (error) throw error;
            setEntries(entries.map(e => e.id === id ? { ...e, isFeatured: !currentStatus } : e).sort((a, b) => { if (a.isFeatured === b.isFeatured) return 0; return a.isFeatured ? -1 : 1; }));
        } catch (err) { alert('Error al actualizar'); }
    }
    const handleDelete = async (id: string) => { if (!confirm('¿Seguro que quieres eliminar este registro?')) return; const { error } = await supabase.from('entrepreneurs').delete().eq('id', id); if (!error) { setEntries(entries.filter(e => e.id !== id)); setViewEntry(null); } };
    const handleDeleteMember = async (id: number) => { if (!confirm('¿Seguro que quieres eliminar este pre-registro?')) return; const { error } = await supabase.from('members').delete().eq('id', id); if (!error) { setMembers(members.filter(m => m.id !== id)); } };
    const handleDeleteClient = async (id: number) => { if (!confirm('¿Seguro que quieres eliminar este cliente?')) return; const { error } = await supabase.from('clients').delete().eq('id', id); if (!error) { setClients(clients.filter(c => c.id !== id)); } };
    const totalValue = entries.reduce((acc, curr) => acc + (parseFloat(curr.value.replace(/[^0-9.]/g, '')) || 0), 0);
    const enrolledPhones = new Set(entries.map(e => e.phone.replace(/\D/g, '')));
    const pendingMembers = members.filter(m => !enrolledPhones.has(m.phone.replace(/\D/g, '')));
    if (!isAuthenticated) return (<div className="container" style={{paddingTop: '120px', minHeight: '80vh', display: 'flex', justifyContent: 'center'}}><div className="card p-40" style={{maxWidth: '400px', width: '100%', textAlign: 'center'}}><div style={{color: '#2d3436', marginBottom: '20px'}}><LockIcon /></div><h2>Admin Dashboard</h2><form onSubmit={handleLogin}><input type="password" className="lock-input" placeholder="Contraseña Maestra" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus /><button className="btn btn-dark btn-block mt-small">Ingresar</button></form><button onClick={onLogout} className="btn-link mt-medium">Volver</button></div></div>);
    return (<div className="admin-container"><div className="admin-sidebar"><div className="admin-brand">Tribu Admin</div><div className="admin-menu"><button className="menu-item active">Dashboard</button><button onClick={onLogout} className="menu-item">Salir</button></div></div><div className="admin-content"><div className="admin-header"><h2>Panel de Control</h2><div className="admin-actions"><button onClick={() => {}} className="btn btn-primary btn-with-icon" disabled><PlusIcon /> Generar Datos</button><button onClick={() => {}} className="btn btn-outline btn-with-icon"><DownloadIcon /> Exportar CSV</button></div></div><div className="stats-grid"><div className="kpi-card"><h3>Total Inscritos</h3><div className="kpi-value">{entries.length}</div></div><div className="kpi-card"><h3>Valor Acumulado</h3><div className="kpi-value text-success">S/ {totalValue.toFixed(2)}</div></div><div className="kpi-card"><h3>Participantes</h3><div className="kpi-value text-blue">{clients.length}</div></div><div className="kpi-card"><h3>Pendientes</h3><div className="kpi-value" style={{color: '#ff9f43'}}>{pendingMembers.length}</div></div></div><div className="admin-tabs"><button className={`tab-btn ${activeTab === 'enrolled' ? 'active' : ''}`} onClick={() => setActiveTab('enrolled')}>Inscritos ({entries.length})</button><button className={`tab-btn ${activeTab === 'clients' ? 'active' : ''}`} onClick={() => setActiveTab('clients')}>Clientes ({clients.length})</button><button className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>Pendientes ({pendingMembers.length})</button></div><div className="table-container">
        {activeTab === 'enrolled' && (<table className="data-table"><thead><tr><th>Negocio</th><th>Dueño</th><th>Contacto</th><th>Premio</th><th>Valor (S/)</th><th>Rubro</th><th>Acciones</th></tr></thead><tbody>{entries.map(entry => (<tr key={entry.id} className={entry.isFeatured ? 'featured-row' : ''}><td><div className="cell-flex"><img src={entry.logoImage} className="table-img" alt=""/><strong>{entry.name}</strong>{entry.isFeatured && <StarFilledIcon size={14} />}</div></td><td>{entry.ownerName}</td><td><a href={getWhatsAppLink(entry.phone)} target="_blank" className="table-link">{entry.phone}</a></td><td>{entry.prize}</td><td>{entry.value}</td><td><span className="badge-cat">{entry.category}</span></td><td><div className="action-buttons-row"><button onClick={() => handleToggleFeatured(entry.id, !!entry.isFeatured)} className="btn-icon-action" style={{color: entry.isFeatured ? '#f1c40f' : '#b2bec3'}}>{entry.isFeatured ? <StarFilledIcon /> : <StarOutlineIcon />}</button><button onClick={() => window.open(`/?card=${entry.id}`, '_blank')} className="btn-icon-action text-blue"><QrIcon /></button><button onClick={() => setViewEntry(entry)} className="btn-icon-action text-blue"><EyeIcon /></button><button onClick={() => handleDelete(entry.id)} className="btn-icon-action text-red"><TrashIcon /></button></div></td></tr>))}</tbody></table>)}
        {activeTab === 'clients' && (<table className="data-table"><thead><tr><th>Fecha</th><th>Nombre</th><th>Celular</th><th>Ticket</th><th>Acciones</th></tr></thead><tbody>{clients.map(client => (<tr key={client.id}><td>{new Date(client.created_at).toLocaleDateString()}</td><td><strong>{client.name}</strong></td><td>{client.phone}</td><td><span className="badge-cat" style={{background: '#d1fae5', color: '#065f46'}}>{client.ticket_code}</span></td><td><div className="action-buttons-row"><a href={getWhatsAppLink(client.phone)} target="_blank" className="btn-icon-action" style={{color: '#25D366'}} title="WhatsApp"><WhatsAppIcon /></a><button onClick={() => handleDeleteClient(client.id)} className="btn-icon-action text-red"><TrashIcon /></button></div></td></tr>))}</tbody></table>)}
        {activeTab === 'pending' && (<table className="data-table"><thead><tr><th>Nombre</th><th>Negocio</th><th>Celular</th><th>Estado</th><th>Acción</th></tr></thead><tbody>{pendingMembers.map(member => (<tr key={member.id}><td>{member.name}</td><td>{member.business_name}</td><td>{member.phone}</td><td><span className="badge-cat" style={{background: '#ffeaa7', color: '#d35400'}}>Pendiente</span></td><td><div className="action-buttons-row"><button onClick={() => handleDeleteMember(member.id)} className="btn-icon-action text-red"><TrashIcon /></button><a href={getWhatsAppLink(member.phone)} target="_blank" className="btn-icon-action" style={{color: '#25D366'}}><WhatsAppIcon /></a></div></td></tr>))}</tbody></table>)}
    </div></div></div>);
}

// --- PRE-REGISTER FORM ---
function PreRegisterForm({ onBack }: { onBack: () => void }) {
    const [wizardStep, setWizardStep] = useState<'member' | 'business' | 'success'>('member');
    const [memberName, setMemberName] = useState('');
    const [memberBusiness, setMemberBusiness] = useState('');
    const [memberPhone, setMemberPhone] = useState('');
    const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [category, setCategory] = useState(PREDEFINED_CATEGORIES[0]);
    const [customCategory, setCustomCategory] = useState('');
    const [instagram, setInstagram] = useState('');
    const [facebook, setFacebook] = useState('');
    const [tiktok, setTiktok] = useState('');
    const [website, setWebsite] = useState('');
    const [description, setDescription] = useState('');
    const [prize, setPrize] = useState('');
    const [value, setValue] = useState('');
    const [prizeFile, setPrizeFile] = useState<File | null>(null);
    const [prizePreview, setPrizePreview] = useState<string | null>(null);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
    const handleMemberSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setStatus('loading');
        try {
            const cleanPhone = memberPhone.replace(/\D/g, '');
            if (cleanPhone.length < selectedCountry.min || cleanPhone.length > selectedCountry.max) throw new Error(`Teléfono inválido.`);
            const fullPhone = `${selectedCountry.code.replace('+','')}${cleanPhone}`;
            await supabase.from('members').upsert([{ phone: fullPhone, name: memberName, business_name: memberBusiness }], { onConflict: 'phone' });
            setWizardStep('business'); setStatus('idle');
        } catch (err: any) { setStatus('error'); }
    };
    const handleBusinessSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); if (!acceptedTerms || !prizeFile) return; setStatus('loading');
        try {
            const logoUrl = logoFile ? await uploadToStorage(logoFile) : 'https://via.placeholder.com/150';
            const prizeUrl = await uploadToStorage(prizeFile);
            const finalCategory = category === 'Otro' ? customCategory : category;
            const fullPhone = `${selectedCountry.code.replace('+','')}${memberPhone.replace(/\D/g, '')}`;
            await supabase.from('entrepreneurs').insert([{ business_name: memberBusiness, owner_name: memberName, phone: fullPhone, prize, prize_value: value, prize_image_url: prizeUrl, logo_image_url: logoUrl, instagram, facebook, tiktok, website, description: description || 'Emprendedor de la tribu', category: finalCategory }]);
            setWizardStep('success'); setStatus('idle');
        } catch (err: any) { setStatus('error'); }
    };
    if (wizardStep === 'success') return (<div className="container" style={{paddingTop: '120px', minHeight: '80vh'}}><div className="success-message card p-40"><CheckCircleIcon /><h2 className="mt-medium">¡Inscripción Completa!</h2><button onClick={() => window.location.href = window.location.origin} className="btn btn-primary btn-large mt-medium">Ver mi Publicación</button></div></div>);
    return (<div style={{background: '#f8fafc', minHeight: '100vh', paddingTop: '100px'}}><div className="container" style={{maxWidth: '800px'}}><div className="card p-40 shadow-xl border-t-brand">
        {wizardStep === 'member' && (<form onSubmit={handleMemberSubmit} className="clean-form"><h2>Tus Datos</h2><div className="form-group-large"><label>Tu Nombre</label><input type="text" value={memberName} onChange={e => setMemberName(e.target.value)} required /></div><div className="form-group-large"><label>Nombre del Negocio</label><input type="text" value={memberBusiness} onChange={e => setMemberBusiness(e.target.value)} required /></div><div className="form-group-large"><label>WhatsApp</label><input type="tel" value={memberPhone} onChange={e => setMemberPhone(e.target.value)} required /></div><button className="btn btn-primary btn-block btn-giant-form" disabled={status === 'loading'}>Siguiente</button></form>)}
        {wizardStep === 'business' && (<form onSubmit={handleBusinessSubmit} className="clean-form"><h2>Tu Negocio</h2><div className="form-group-large"><label>Descripción</label><textarea value={description} onChange={e => setDescription(e.target.value)} required className="form-textarea-large" /></div><div className="form-group-large"><label>Premio a sortear</label><input type="text" value={prize} onChange={e => setPrize(e.target.value)} required /></div><div className="form-group-large"><label>Valor (S/)</label><input type="text" value={value} onChange={e => setValue(e.target.value)} required /></div><div className="terms-checkbox-styled"><label><input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} /> Acepto términos</label></div><button className="btn btn-primary btn-block btn-giant-form" disabled={status === 'loading'}>Finalizar</button></form>)}
    </div></div></div>);
}

// --- CLIENT REGISTRATION MODAL ---
function ClientRegistrationModal({ onClose, onGoToDirectory }: { onClose: () => void, onGoToDirectory: () => void }) {
    const [step, setStep] = useState<'form' | 'mission' | 'ticket'>('form');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [ticketCode, setTicketCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [randomBrands, setRandomBrands] = useState<Entrepreneur[]>([]);
    const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
    const [clickedBrands, setClickedBrands] = useState<Set<string>>(new Set());
    const fetchRandomBrands = async () => {
        const { data } = await supabase.from('entrepreneurs').select('*').limit(50);
        if (data && data.length > 0) {
             const shuffled = [...data].sort(() => 0.5 - Math.random());
             const selected = shuffled.slice(0, 3);
             setRandomBrands(selected.map(item => ({ id: item.id, name: item.business_name, ownerName: item.owner_name, phone: item.phone, prize: item.prize, value: item.prize_value, prizeImage: item.prize_image_url || 'https://via.placeholder.com/600', logoImage: item.logo_image_url || 'https://via.placeholder.com/150', date: new Date(item.created_at), instagram: item.instagram, description: item.description, category: item.category, isFeatured: item.is_featured })));
        }
    };
    const handleFormSubmit = async (e: React.FormEvent) => { e.preventDefault(); setIsLoading(true); fetchRandomBrands(); setStep('mission'); setIsLoading(false); };
    const handleGenerateTicket = async () => {
        setIsLoading(true);
        try {
            const code = `#TRIBU-${Math.floor(1000 + Math.random() * 9000)}`;
            const fullPhone = `${selectedCountry.code.replace('+','')}${phone.replace(/\D/g, '')}`;
            await supabase.from('clients').insert([{ name, phone: fullPhone, ticket_code: code }]);
            setTicketCode(code); setStep('ticket');
        } catch (err) { alert('Error.'); } finally { setIsLoading(false); }
    };
    const allBrandsClicked = randomBrands.length > 0 && clickedBrands.size >= randomBrands.length;
    return (
        <div className="modal-overlay">
            <div className={`modal-content-modern ${step === 'ticket' ? 'wide-modal' : ''}`}>
                <button className="close-btn-modern" onClick={onClose}><XIcon /></button>
                {step === 'form' && (<div className="text-center"><div className="modal-body-p40"><h2>Reclama tu Ticket</h2><form onSubmit={handleFormSubmit} className="clean-form mt-medium"><div className="form-group-modern"><label>Tu Nombre</label><input type="text" value={name} onChange={e => setName(e.target.value)} required /></div><div className="form-group-modern"><label>WhatsApp</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required /></div><button className="btn btn-primary btn-block btn-glowing mt-medium">¡QUIERO MI TICKET!</button></form></div></div>)}
                {step === 'mission' && (<div className="text-center"><div className="modal-header-mission"><h2>🎯 Misión Requerida</h2><p>Sigue a estas marcas para desbloquear tu ticket.</p></div><div className="mission-list-container">{randomBrands.map((brand) => (<div key={brand.id} className="mission-brand-card"><div>{brand.name}</div><button onClick={() => { window.open(`https://instagram.com/${brand.instagram.replace('@','')}`, '_blank'); setClickedBrands(prev => new Set(prev).add(brand.id)); }}>Seguir</button></div>))}</div><button onClick={handleGenerateTicket} className={`btn-giant-action ${allBrandsClicked ? 'unlocked' : 'locked'}`} disabled={!allBrandsClicked}>GENERAR MI TICKET</button></div>)}
                {step === 'ticket' && (<div className="ticket-view-container"><ConfettiBackground /><h2 className="text-gradient">¡ESTÁS DENTRO!</h2><div className="ticket-code-glitch">{ticketCode}</div><button onClick={onGoToDirectory} className="btn btn-ghost-action btn-block mt-small">Explorar Directorio</button></div>)}
            </div>
        </div>
    );
}

// --- ENTREPRENEUR PORTAL ---
function EntrepreneurPortal({ onBack }: { onBack: () => void }) {
    const [step, setStep] = useState<'login' | 'dashboard'>('login');
    const [loginPhone, setLoginPhone] = useState('');
    const [data, setData] = useState<Entrepreneur | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true);
        const cleanPhone = loginPhone.replace(/\D/g, '');
        const { data: entData } = await supabase.from('entrepreneurs').select('*').like('phone', `%${cleanPhone}`).limit(1).single();
        if (entData) { setData({ id: entData.id, name: entData.business_name, ownerName: entData.owner_name, phone: entData.phone, prize: entData.prize, value: entData.prize_value, prizeImage: entData.prize_image_url || '', logoImage: entData.logo_image_url || '', date: new Date(entData.created_at), instagram: entData.instagram, facebook: entData.facebook, tiktok: entData.tiktok, website: entData.website, description: entData.description, category: entData.category, isFeatured: entData.is_featured }); setStep('dashboard'); }
        else alert('No encontrado.'); setLoading(false);
    };
    if (step === 'login') return (<div className="container" style={{paddingTop: '120px'}}><div className="card p-40 text-center"><h2>Portal Emprendedor</h2><form onSubmit={handleLogin}><input type="tel" value={loginPhone} onChange={e => setLoginPhone(e.target.value)} required placeholder="WhatsApp" /><button className="btn btn-primary btn-block mt-medium">Ingresar</button></form><button onClick={onBack} className="btn-link">Volver</button></div></div>);
    return (<div className="container p-40"><h2>Hola, {data?.ownerName}</h2><button onClick={onBack}>Salir</button></div>);
}

function App() {
  const [viewMode, setViewMode] = useState<'landing' | 'preregister' | 'admin' | 'card' | 'portal'>('landing');
  const [entries, setEntries] = useState<Entrepreneur[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Todas');
  const [secretClicks, setSecretClicks] = useState(0);

  useEffect(() => {
    fetchEntries();
    const params = new URLSearchParams(window.location.search);
    if (params.get('card')) { setViewMode('card'); }
    else if (params.get('ver') === 'directorio') setIsDirectoryOpen(true);
    if (IS_RAFFLE_OPEN) setTimeout(() => setIsPromoOpen(true), 2000);
  }, []);

  const fetchEntries = async () => {
      const { data } = await supabase.from('entrepreneurs').select('*').order('is_featured', { ascending: false }).order('created_at', { ascending: false });
      if (data) setEntries(data.map(item => ({ id: item.id, name: item.business_name, ownerName: item.owner_name, phone: item.phone, prize: item.prize, value: item.prize_value, prizeImage: item.prize_image_url || '', logoImage: item.logo_image_url || '', date: new Date(item.created_at), instagram: item.instagram, facebook: item.facebook, tiktok: item.tiktok, website: item.website, description: item.description, category: item.category, isFeatured: item.is_featured })));
      setIsLoading(false);
  };

  const filteredEntries = entries.filter(e => (selectedCategoryFilter === 'Todas' || e.category === selectedCategoryFilter) && e.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (viewMode === 'preregister') return <PreRegisterForm onBack={() => setViewMode('landing')} />;
  if (viewMode === 'admin') return <AdminDashboard onLogout={() => setViewMode('landing')} />;
  if (viewMode === 'portal') return <EntrepreneurPortal onBack={() => setViewMode('landing')} />;
  if (viewMode === 'card') return <DigitalCardView entrepreneurId={new URLSearchParams(window.location.search).get('card') || ''} onBack={() => setViewMode('landing')} />;

  return (
    <div className="app-container">
      <nav className="navbar"><div className="nav-inner"><div className="brand" onClick={() => setSecretClicks(s => s+1)}>SorteoTribu</div><div className="nav-actions">
          <button onClick={() => setIsLedgerOpen(true)} className="nav-link"><ListIcon /> Lista Oficial</button>
          <button onClick={() => setIsDirectoryOpen(true)} className="nav-link">Directorio</button>
          {IS_RAFFLE_OPEN && <button onClick={() => setIsClientModalOpen(true)} className="btn btn-primary">Participar Gratis</button>}
          {!IS_RAFFLE_OPEN && <span className="badge-cat" style={{background: '#f1f5f9', color: '#64748b'}}>Sorteo Finalizado</span>}
      </div><button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}><MenuIcon /></button></div></nav>
      
      {mobileMenuOpen && (<div className="mobile-menu-overlay open"><div className="mobile-menu-content"><button onClick={() => setIsLedgerOpen(true)}><ListIcon /> Lista Oficial</button><button onClick={() => setIsDirectoryOpen(true)}><BookIcon /> Directorio</button>{IS_RAFFLE_OPEN && <button className="btn btn-primary" onClick={() => setIsClientModalOpen(true)}>Participar</button>}</div></div>)}

      <section className="hero-section"><ConfettiBackground /><div className="container"><div className="hero-grid">
        <div className="hero-text"><h1 className="hero-title">¡GANA PREMIOS <span className="text-gradient">PARA TU NEGOCIO!</span></h1><p className="hero-lead">Un evento único donde la comunidad premia a la comunidad.</p>
            {IS_RAFFLE_OPEN ? (<button onClick={() => setIsClientModalOpen(true)} className="btn btn-giant">QUIERO MI PREMIO</button>) : (<div className="p-20" style={{background: 'rgba(255,255,255,0.5)', borderRadius: '12px', border: '1px solid #ddd'}}><strong>Inscripciones Finalizadas</strong><p>El sorteo ha cerrado su periodo de ingreso.</p></div>)}
        </div>
        <div className="hero-visual"><div className="stat-card"><h3>{entries.length} Premios</h3></div></div>
      </div></div></section>

      <section id="gallery" className="prize-marquee-section"><div className="container"><h2 className="text-center">🎁 Premios Confirmados</h2><div className="prize-static-grid">{entries.slice(0, 9).map(e => (<div key={e.id} className="artwork-card"><img src={e.prizeImage} /><div className="artwork-info"><h4>{e.name}</h4><p>{e.prize}</p><span className="price-sticker">{e.value}</span></div></div>))}</div></div></section>

      <footer className="footer-bar-gradient"><div className="footer-bar-content"><div className="footer-im-logo">iM</div><div className="footer-text-main" onClick={() => secretClicks >= 5 && setViewMode('admin')}>Iniciativa de INFOMERCADO TRIBU</div><button onClick={() => window.open('https://gaorsystem.vercel.app/')} style={{color:'white'}}>Mago26</button></div></footer>

      {isPromoOpen && IS_RAFFLE_OPEN && (<div className="promo-overlay"><div className="promo-card-story"><button className="promo-close-btn-floating" onClick={() => setIsPromoOpen(false)}><XIcon /></button><h2>¡RECLAMA TU REGALO!</h2><p>Hay {entries.length} premios disponibles.</p><button className="btn-promo-action" onClick={() => { setIsPromoOpen(false); setIsClientModalOpen(true); }}>QUIERO MI TICKET</button></div></div>)}
      {isLedgerOpen && <PublicLedgerModal onClose={() => setIsLedgerOpen(false)} />}
      {isClientModalOpen && IS_RAFFLE_OPEN && <ClientRegistrationModal onClose={() => setIsClientModalOpen(false)} onGoToDirectory={() => { setIsClientModalOpen(false); setIsDirectoryOpen(true); }} />}
      {isDirectoryOpen && (<div className="directory-full-overlay"><button className="close-directory-absolute" onClick={() => setIsDirectoryOpen(false)}><XIcon /></button><div className="directory-main-content"><div className="bio-grid">{filteredEntries.map(e => (<div key={e.id} className="bio-card"><h3>{e.name}</h3><p>{e.description}</p><button onClick={() => window.open(getWhatsAppLink(e.phone))}>Contactar</button></div>))}</div></div></div>)}
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) createRoot(rootElement).render(<ErrorBoundary><App /></ErrorBoundary>);