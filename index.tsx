import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from "@google/genai";
import html2canvas from 'html2canvas';

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
    // If it's a legacy Peru number (9 digits starting with 9), add 51. Otherwise assume full international code is stored.
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

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'center' }}>
          <h1 style={{ color: '#e1306c' }}>Algo salió mal :(</h1>
          <p>Hubo un error al cargar la aplicación.</p>
          <pre style={{ background: '#f1f5f9', padding: '20px', borderRadius: '8px', overflow: 'auto', textAlign: 'left', fontSize: '0.8rem' }}>
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '20px', padding: '10px 20px', background: '#e1306c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Recargar Página
          </button>
        </div>
      );
    }
    return (this as any).props.children;
  }
}

// --- SUPABASE CONFIGURATION ---
const SUPABASE_URL = 'https://epyqaqxlgqcxbenaydct.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVweXFhcXhsZ3FjeGJlbmF5ZGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NzAyOTIsImV4cCI6MjA4MDM0NjI5Mn0.4FKPSM-UfQlfrKQoXRnBps9RLCX2MT8HkqcQlEHgc5Q';

// Initialize Supabase safely
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- GEMINI AI HELPER (SAFE) ---
const getAiModel = () => {
    let apiKey = '';
    try {
        if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
            apiKey = process.env.API_KEY;
        }
    } catch (e) {
        console.warn("Environment variable access failed", e);
    }
    
    if (!apiKey) {
        console.warn("API Key missing. AI features will be disabled.");
        return null;
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    return ai;
};

// Icons
const GiftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#2ecc71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);

const TrendingUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
);

const MegaphoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"></path></svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
);

const ImageIcon = ({ size=32 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
);

const InstagramIcon = ({ size=20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

const FacebookIcon = ({ size=20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);

const TikTokIcon = ({ size=20 }: { size?: number }) => (
   <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
);

const GlobeIcon = ({ size=20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path></svg>
);

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

const BookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
);

const TagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#ffd700" stroke="#b39200" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
);

const StarFilledIcon = ({ size = 20, color = "#f1c40f" }: { size?: number, color?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
);

const StarOutlineIcon = ({ size = 20 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);

const LoaderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spinner"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
);

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);

const EditIcon = ({ size=20 }: { size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);

const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
);

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
);

const QrIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
);

const TicketIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18v12H3z"></path><path d="M21 6v12"></path><path d="M3 6v12"></path><path d="M3 12h18"></path><circle cx="6.5" cy="12" r="1.5" fill="currentColor"></circle><circle cx="17.5" cy="12" r="1.5" fill="currentColor"></circle></svg>
);

const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
);

const SparkleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
);

const BriefcaseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
);

const RocketIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path><path d="M18 9a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"></path><path d="M9 22h6"></path><path d="M12 2v8"></path><path d="M12 10a5 5 0 0 0-5 5v3a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-3a5 5 0 0 0-5-5z"></path></svg>
);

const CameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
);

const ListIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
);

const HelpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
);

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
  name: string; // Business Name
  ownerName: string; // Person Name
  prize: string;
  value: string;
  prizeImage: string; // The specific gift image
  logoImage: string; // The business logo
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

const PREDEFINED_CATEGORIES = [
  "Moda",
  "Gastronomía",
  "Tecnología",
  "Salud y Belleza",
  "Hogar",
  "Servicios",
  "Artesanía",
  "Otro"
];

const ADMIN_PASSWORD = "ADMIN123";

// Helper for uploading
const uploadToStorage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;
    
    const { error: uploadError } = await supabase.storage
    .from('images')
    .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
    return data.publicUrl;
};

// --- PUBLIC LEDGER MODAL COMPONENT (TRANSPARENCY) ---
function PublicLedgerModal({ onClose }: { onClose: () => void }) {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClients = async () => {
            const { data } = await supabase
                .from('clients')
                .select('name, ticket_code, created_at')
                .order('created_at', { ascending: false });
            
            if (data) {
                // Map to client interface (phone is optional/hidden in this view)
                const mappedClients = data.map((c: any, index: number) => ({
                    id: index,
                    name: c.name,
                    ticket_code: c.ticket_code,
                    created_at: c.created_at,
                    phone: '' // Privacy: Don't show phone publicly
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
                <div className="modal-header-mission" style={{flexShrink: 0}}>
                    <h2 className="text-gradient">📜 Lista Oficial de Inscritos</h2>
                    <p className="text-gray-sm">Transparencia total. Aquí están todos los participantes.</p>
                </div>
                
                <div style={{flex: 1, overflowY: 'auto', padding: '20px'}}>
                    {loading ? (
                        <div className="text-center p-40"><LoaderIcon /> Cargando lista...</div>
                    ) : clients.length > 0 ? (
                        <table className="data-table" style={{width: '100%'}}>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Participante</th>
                                    <th>Ticket</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map((client, idx) => (
                                    <tr key={idx}>
                                        <td style={{fontSize: '0.85rem', color: '#64748b'}}>
                                            {new Date(client.created_at).toLocaleDateString()}
                                        </td>
                                        <td style={{fontWeight: 600}}>
                                            {client.name.split(' ')[0]} {client.name.split(' ')[1] ? client.name.split(' ')[1].charAt(0) + '.' : ''}
                                        </td>
                                        <td>
                                            <span className="badge-cat" style={{background: '#d1fae5', color: '#065f46'}}>
                                                {client.ticket_code}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center p-40 text-gray">Aún no hay inscritos. ¡Sé el primero!</div>
                    )}
                </div>
                
                <div style={{padding: '20px', borderTop: '1px solid #eee', textAlign: 'center', fontSize: '0.8rem', color: '#999'}}>
                    * Por privacidad, solo mostramos el primer nombre e inicial.
                </div>
            </div>
        </div>
    );
}

// --- DIGITAL CARD COMPONENT ---
function DigitalCardView({ entrepreneurId, onBack }: { entrepreneurId: string, onBack: () => void }) {
    const [data, setData] = useState<Entrepreneur | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCard = async () => {
            const { data: entData, error } = await supabase
                .from('entrepreneurs')
                .select('*')
                .eq('id', entrepreneurId)
                .single();

            if (entData) {
                setData({
                    id: entData.id,
                    name: entData.business_name,
                    ownerName: entData.owner_name,
                    phone: entData.phone,
                    prize: entData.prize,
                    value: entData.prize_value,
                    prizeImage: entData.prize_image_url || 'https://via.placeholder.com/600',
                    logoImage: entData.logo_image_url || 'https://via.placeholder.com/150',
                    date: new Date(entData.created_at),
                    instagram: entData.instagram,
                    facebook: entData.facebook,
                    tiktok: entData.tiktok,
                    website: entData.website,
                    description: entData.description,
                    category: entData.category,
                    isFeatured: entData.is_featured
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
                <div className="dc-header">
                    <img src={data.logoImage} alt="Logo" className="dc-logo" />
                    <h1 className="dc-name">{data.name}</h1>
                    <p className="dc-category">{data.category}</p>
                    <div className="dc-verified-badge">
                        <StarFilledIcon size={14} /> MIEMBRO VERIFICADO TRIBU EMPRENDEDORES
                    </div>
                </div>

                <div className="dc-body">
                    <p className="dc-description">{data.description}</p>
                    <p className="dc-owner">Gerente: {data.ownerName}</p>
                    
                    <div className="dc-links">
                        <a href={getWhatsAppLink(data.phone)} target="_blank" className="dc-btn whatsapp">
                            <WhatsAppIcon /> Contactar por WhatsApp
                        </a>
                        {data.instagram && (
                            <a href={`https://instagram.com/${data.instagram.replace('@','')}`} target="_blank" className="dc-btn instagram">
                                <InstagramIcon /> Ver Instagram
                            </a>
                        )}
                        {data.facebook && (
                            <a href={data.facebook} target="_blank" className="dc-btn facebook">
                                <FacebookIcon /> Ver Facebook
                            </a>
                        )}
                        {data.website && (
                             <a href={data.website} target="_blank" className="dc-btn website">
                                <GlobeIcon /> Visitar Sitio Web
                            </a>
                        )}
                    </div>
                    
                    <div className="dc-qr-section">
                        <p>Escanea para guardar contacto</p>
                        <img src={qrUrl} alt="QR Code" className="dc-qr-img" />
                    </div>
                </div>

                <div className="dc-footer">
                    <p>Miembro de <strong>La Tribu</strong></p>
                    <button onClick={onBack} className="btn-link-simple">Ir al Sorteo</button>
                </div>
            </div>
        </div>
    );
}


// --- ADMIN DASHBOARD COMPONENT ---
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

    useEffect(() => {
        if (isAuthenticated) {
            fetchData();
        }
    }, [isAuthenticated]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
        } else {
            alert('Contraseña incorrecta');
        }
    };

    const fetchData = async () => {
        setLoading(true);
        const { data: entData } = await supabase
            .from('entrepreneurs')
            .select('*')
            .order('is_featured', { ascending: false })
            .order('created_at', { ascending: false });

        if (entData) {
             const mappedEntries: Entrepreneur[] = entData.map(item => ({
                  id: item.id,
                  name: item.business_name,
                  ownerName: item.owner_name,
                  phone: item.phone,
                  prize: item.prize,
                  value: item.prize_value,
                  prizeImage: item.prize_image_url,
                  logoImage: item.logo_image_url,
                  date: new Date(item.created_at),
                  instagram: item.instagram,
                  facebook: item.facebook,
                  tiktok: item.tiktok,
                  website: item.website,
                  description: item.description,
                  category: item.category,
                  isFeatured: item.is_featured
              }));
            setEntries(mappedEntries);
        }

        const { data: memData } = await supabase
            .from('members')
            .select('*')
            .order('id', { ascending: false });
        
        if (memData) {
            setMembers(memData);
        }

        const { data: clientData } = await supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (clientData) {
            setClients(clientData);
        }

        setLoading(false);
    };

    const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase.from('entrepreneurs').update({ is_featured: !currentStatus }).eq('id', id);
            if (error) throw error;
            setEntries(entries.map(e => e.id === id ? { ...e, isFeatured: !currentStatus } : e).sort((a, b) => {
                 if (a.isFeatured === b.isFeatured) return 0;
                 return a.isFeatured ? -1 : 1;
            }));
        } catch (err) { console.error(err); alert('Error al actualizar'); }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Seguro que quieres eliminar este registro?')) return;
        const { error } = await supabase.from('entrepreneurs').delete().eq('id', id);
        if (!error) { setEntries(entries.filter(e => e.id !== id)); setViewEntry(null); }
    };

    const handleDeleteMember = async (id: number) => {
        if (!confirm('¿Seguro que quieres eliminar este pre-registro?')) return;
        const { error } = await supabase.from('members').delete().eq('id', id);
        if (!error) { setMembers(members.filter(m => m.id !== id)); }
    };

    const handleDeleteClient = async (id: number) => {
        if (!confirm('¿Seguro que quieres eliminar este cliente?')) return;
        const { error } = await supabase.from('clients').delete().eq('id', id);
        if (!error) { setClients(clients.filter(c => c.id !== id)); }
    };

    const handleUpdateMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMember) return;
        
        const cleanPhone = editingMember.phone.replace(/\D/g, '');
        // Relaxed validation for admin editing
        if (cleanPhone.length < 8) {
            alert('El número parece muy corto. Verifícalo.');
            return;
        }

        try {
            const { error } = await supabase.from('members').update({
                    name: editingMember.name, business_name: editingMember.business_name, phone: cleanPhone
                }).eq('id', editingMember.id);
            if (error) throw error;
            setMembers(members.map(m => m.id === editingMember.id ? editingMember : m));
            setEditingMember(null);
        } catch (err: any) { alert('Error al actualizar'); }
    };

    const handleUpdateEnrolled = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingEnrolled) return;
        
        const cleanPhone = editingEnrolled.phone.replace(/\D/g, '');
        if (cleanPhone.length < 8) {
            alert('El número parece muy corto.');
            return;
        }

        try {
             const { error } = await supabase.from('entrepreneurs').update({
                    business_name: editingEnrolled.name, owner_name: editingEnrolled.ownerName,
                    phone: cleanPhone, prize: editingEnrolled.prize, prize_value: editingEnrolled.value,
                    category: editingEnrolled.category, instagram: editingEnrolled.instagram,
                    facebook: editingEnrolled.facebook, tiktok: editingEnrolled.tiktok, website: editingEnrolled.website,
                    description: editingEnrolled.description
                }).eq('id', editingEnrolled.id);
            if (error) throw error;
            setEntries(entries.map(e => e.id === editingEnrolled.id ? editingEnrolled : e));
            setEditingEnrolled(null);
            alert('Ficha actualizada correctamente');
        } catch (err: any) { alert('Error: ' + err.message); }
    };

    const generateSeedData = async () => {
        setIsGenerating(true);
        setIsGenerating(false);
    };

    const downloadCSV = () => {
        const headers = ["ID", "Negocio", "Dueño", "Celular", "Premio", "Valor", "Instagram", "Facebook", "TikTok", "Categoría"];
        const csvContent = [headers.join(","), ...entries.map(e => [e.id, e.name, e.ownerName, e.phone, e.prize, e.value, e.instagram, e.facebook || '', e.tiktok || '', e.category].join(","))].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'tribu_data.csv'; a.click();
    };

    const totalValue = entries.reduce((acc, curr) => {
        const val = parseFloat(curr.value.replace(/[^0-9.]/g, '')) || 0;
        return acc + val;
    }, 0);

    const enrolledPhones = new Set(entries.map(e => e.phone.replace(/\D/g, '')));
    const pendingMembers = members.filter(m => !enrolledPhones.has(m.phone.replace(/\D/g, '')));

    if (!isAuthenticated) {
        return (
            <div className="container" style={{paddingTop: '120px', minHeight: '80vh', display: 'flex', justifyContent: 'center'}}>
                <div className="card p-40" style={{maxWidth: '400px', width: '100%', textAlign: 'center'}}>
                    <div style={{color: '#2d3436', marginBottom: '20px'}}><LockIcon /></div>
                    <h2 style={{marginBottom: '10px'}}>Admin Dashboard</h2>
                    <form onSubmit={handleLogin}>
                        <input type="password" className="lock-input" placeholder="Contraseña Maestra" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
                        <button className="btn btn-dark btn-block mt-small">Ingresar</button>
                    </form>
                    <button onClick={onLogout} className="btn-link mt-medium">Volver</button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <div className="admin-sidebar">
                <div className="admin-brand">Tribu Admin</div>
                <div className="admin-menu">
                    <button className="menu-item active">Dashboard</button>
                    <button onClick={onLogout} className="menu-item">Salir</button>
                </div>
            </div>
            <div className="admin-content">
                <div className="admin-header">
                    <h2>Panel de Control</h2>
                    <div className="admin-actions">
                         <button onClick={generateSeedData} className="btn btn-primary btn-with-icon" disabled={isGenerating}>
                            {isGenerating ? <LoaderIcon /> : <PlusIcon />} Generar Datos
                        </button>
                        <button onClick={downloadCSV} className="btn btn-outline btn-with-icon">
                            <DownloadIcon /> Exportar CSV
                        </button>
                    </div>
                </div>
                <div className="stats-grid">
                    <div className="kpi-card"><h3>Total Inscritos</h3><div className="kpi-value">{entries.length}</div></div>
                    <div className="kpi-card"><h3>Valor Acumulado</h3><div className="kpi-value text-success">S/ {totalValue.toFixed(2)}</div></div>
                    <div className="kpi-card"><h3>Participantes</h3><div className="kpi-value text-blue">{clients.length}</div></div>
                    <div className="kpi-card"><h3>Pendientes</h3><div className="kpi-value" style={{color: '#ff9f43'}}>{pendingMembers.length}</div></div>
                </div>
                <div className="admin-tabs">
                    <button className={`tab-btn ${activeTab === 'enrolled' ? 'active' : ''}`} onClick={() => setActiveTab('enrolled')}>Inscritos ({entries.length})</button>
                    <button className={`tab-btn ${activeTab === 'clients' ? 'active' : ''}`} onClick={() => setActiveTab('clients')}>Clientes ({clients.length})</button>
                    <button className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>Pendientes ({pendingMembers.length})</button>
                </div>
                <div className="table-container">
                    {activeTab === 'enrolled' && (
                        <table className="data-table">
                            <thead><tr><th>Negocio</th><th>Dueño</th><th>Contacto</th><th>Premio</th><th>Valor (S/)</th><th>Rubro</th><th>Acciones</th></tr></thead>
                            <tbody>{entries.map(entry => (
                                <tr key={entry.id} className={entry.isFeatured ? 'featured-row' : ''}>
                                    <td><div className="cell-flex"><img src={entry.logoImage} className="table-img" alt=""/><strong>{entry.name}</strong>{entry.isFeatured && <StarFilledIcon size={14} />}</div></td>
                                    <td>{entry.ownerName}</td>
                                    <td><a href={getWhatsAppLink(entry.phone)} target="_blank" className="table-link">{entry.phone}</a></td>
                                    <td>{entry.prize}</td>
                                    <td>{entry.value}</td>
                                    <td><span className="badge-cat">{entry.category}</span></td>
                                    <td><div className="action-buttons-row">
                                        <button onClick={() => handleToggleFeatured(entry.id, !!entry.isFeatured)} className="btn-icon-action" style={{color: entry.isFeatured ? '#f1c40f' : '#b2bec3'}}>{entry.isFeatured ? <StarFilledIcon /> : <StarOutlineIcon />}</button>
                                        <button onClick={() => window.open(`/?card=${entry.id}`, '_blank')} className="btn-icon-action text-blue"><QrIcon /></button>
                                        <button onClick={() => setEditingEnrolled(entry)} className="btn-icon-action text-blue"><EditIcon /></button>
                                        <button onClick={() => setViewEntry(entry)} className="btn-icon-action text-blue" style={{marginRight: '8px'}}><EyeIcon /></button>
                                        <button onClick={() => handleDelete(entry.id)} className="btn-icon-action text-red"><TrashIcon /></button>
                                    </div></td>
                                </tr>
                            ))}</tbody>
                        </table>
                    )}
                    
                    {activeTab === 'clients' && (
                        <table className="data-table">
                            <thead><tr><th>Fecha</th><th>Nombre</th><th>Celular</th><th>Ticket</th><th>Acciones</th></tr></thead>
                            <tbody>{clients.map(client => (
                                <tr key={client.id}>
                                    <td>{new Date(client.created_at).toLocaleDateString()}</td>
                                    <td><strong>{client.name}</strong></td>
                                    <td>{client.phone}</td>
                                    <td><span className="badge-cat" style={{background: '#d1fae5', color: '#065f46'}}>{client.ticket_code}</span></td>
                                    <td>
                                        <div className="action-buttons-row">
                                             <a href={getWhatsAppLink(client.phone)} target="_blank" className="btn-icon-action" style={{color: '#25D366', borderColor: '#25D366'}} title="Contactar por WhatsApp">
                                                <WhatsAppIcon />
                                            </a>
                                            <button onClick={() => handleDeleteClient(client.id)} className="btn-icon-action text-red"><TrashIcon /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}</tbody>
                        </table>
                    )}

                    {activeTab === 'pending' && (
                        <table className="data-table">
                            <thead><tr><th>Nombre</th><th>Negocio</th><th>Celular</th><th>Estado</th><th>Acción</th></tr></thead>
                            <tbody>{pendingMembers.map(member => (
                                <tr key={member.id}><td>{member.name}</td><td>{member.business_name}</td><td>{member.phone}</td>
                                    <td><span className="badge-cat" style={{background: '#ffeaa7', color: '#d35400'}}>Pendiente</span></td>
                                    <td><div className="action-buttons-row">
                                        <button onClick={() => setEditingMember(member)} className="btn-icon-action text-blue"><EditIcon /></button>
                                        <button onClick={() => handleDeleteMember(member.id)} className="btn-icon-action text-red"><TrashIcon /></button>
                                        <a href={getWhatsAppLink(member.phone)} target="_blank" className="btn-icon-action" style={{color: '#25D366'}}><WhatsAppIcon /></a>
                                    </div></td>
                                </tr>
                            ))}</tbody>
                        </table>
                    )}
                </div>
            </div>
            {editingMember && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{maxWidth: '450px'}}>
                        <button className="close-btn" onClick={() => setEditingMember(null)}><XIcon /></button>
                        <div className="modal-header"><h2>Editar Pendiente</h2></div>
                        <form onSubmit={handleUpdateMember} className="clean-form">
                            <div className="form-group"><label>Nombre</label><input type="text" value={editingMember.name} onChange={(e) => setEditingMember({...editingMember, name: e.target.value})} required /></div>
                            <div className="form-group"><label>Negocio</label><input type="text" value={editingMember.business_name} onChange={(e) => setEditingMember({...editingMember, business_name: e.target.value})} required /></div>
                            <div className="form-group"><label>Celular</label>
                                <input 
                                    type="tel" 
                                    value={editingMember.phone} 
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 15);
                                        setEditingMember({...editingMember, phone: val});
                                    }} 
                                    placeholder="Número internacional..."
                                    required 
                                />
                            </div>
                            <div className="form-footer"><button type="submit" className="btn btn-primary btn-block">Guardar</button></div>
                        </form>
                    </div>
                </div>
            )}
            {editingEnrolled && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{maxWidth: '500px'}}>
                        <button className="close-btn" onClick={() => setEditingEnrolled(null)}><XIcon /></button>
                        <div className="modal-header"><h2>Editar Ficha</h2></div>
                        <form onSubmit={handleUpdateEnrolled} className="clean-form">
                             <div className="form-row">
                                <div className="form-group" style={{flex: 1}}><label>Negocio</label><input type="text" value={editingEnrolled.name} onChange={(e) => setEditingEnrolled({...editingEnrolled, name: e.target.value})} required /></div>
                                 <div className="form-group" style={{flex: 1}}><label>Dueño</label><input type="text" value={editingEnrolled.ownerName} onChange={(e) => setEditingEnrolled({...editingEnrolled, ownerName: e.target.value})} required /></div>
                            </div>
                            <div className="form-group"><label>Rubro</label><select value={PREDEFINED_CATEGORIES.includes(editingEnrolled.category) ? editingEnrolled.category : 'Otro'} onChange={(e) => { if (e.target.value !== 'Otro') setEditingEnrolled({...editingEnrolled, category: e.target.value}); }} className="form-select">{PREDEFINED_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                            <div className="form-row">
                                <div className="form-group" style={{flex: 2}}><label>Premio</label><input type="text" value={editingEnrolled.prize} onChange={(e) => setEditingEnrolled({...editingEnrolled, prize: e.target.value})} required /></div>
                                 <div className="form-group" style={{flex: 1}}><label>Valor</label><input type="text" value={editingEnrolled.value} onChange={(e) => setEditingEnrolled({...editingEnrolled, value: e.target.value})} required /></div>
                            </div>
                             <div className="form-group"><label>Celular</label>
                                <input 
                                    type="tel" 
                                    value={editingEnrolled.phone} 
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 15);
                                        setEditingEnrolled({...editingEnrolled, phone: val});
                                    }} 
                                    placeholder="Número..."
                                    required 
                                />
                             </div>
                             <div className="form-group"><label>Redes</label><div className="social-grid">
                                <input type="text" placeholder="IG" value={editingEnrolled.instagram} onChange={(e) => setEditingEnrolled({...editingEnrolled, instagram: e.target.value})} />
                                <input type="text" placeholder="FB" value={editingEnrolled.facebook || ''} onChange={(e) => setEditingEnrolled({...editingEnrolled, facebook: e.target.value})} />
                             </div></div>
                            <div className="form-footer"><button type="submit" className="btn btn-primary btn-block">Guardar Ficha</button></div>
                        </form>
                    </div>
                </div>
            )}
            {viewEntry && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setViewEntry(null)}>
                    <div className="modal-content" style={{maxWidth: '600px'}}>
                        <button className="close-btn" onClick={() => setViewEntry(null)}><XIcon /></button>
                        <div className="detail-grid" style={{display: 'flex', gap: '20px'}}>
                            <div className="detail-left" style={{flex: 1}}>
                                <h3>{viewEntry.name}</h3>
                                <p>{viewEntry.description}</p>
                                <p><strong>Dueño:</strong> {viewEntry.ownerName}</p>
                                <p><strong>Contacto:</strong> {viewEntry.phone}</p>
                            </div>
                            <div className="detail-right" style={{flex: 1}}>
                                <img src={viewEntry.prizeImage} style={{width: '100%', borderRadius: '8px'}} />
                                <p><strong>Premio:</strong> {viewEntry.prize}</p>
                                <p><strong>Valor:</strong> {viewEntry.value}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ... [PreRegisterForm]
function PreRegisterForm({ onBack }: { onBack: () => void }) {
    const [wizardStep, setWizardStep] = useState<'member' | 'business' | 'success'>('member');
    
    // Member Data (Step 1)
    const [memberName, setMemberName] = useState('');
    const [memberBusiness, setMemberBusiness] = useState('');
    const [memberPhone, setMemberPhone] = useState('');
    const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]); // Default Peru

    // Business Data (Step 2)
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [category, setCategory] = useState(PREDEFINED_CATEGORIES[0]);
    const [customCategory, setCustomCategory] = useState('');
    const [instagram, setInstagram] = useState('');
    const [facebook, setFacebook] = useState('');
    const [tiktok, setTiktok] = useState('');
    const [website, setWebsite] = useState('');
    const [description, setDescription] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);

    // Prize Data (Step 2)
    const [prize, setPrize] = useState('');
    const [value, setValue] = useState('');
    const [prizeFile, setPrizeFile] = useState<File | null>(null);
    const [prizePreview, setPrizePreview] = useState<string | null>(null);
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const logoInputRef = useRef<HTMLInputElement>(null);
    const prizeInputRef = useRef<HTMLInputElement>(null);

    const handleMemberSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMsg('');
        
        try {
            // Validate Phone dynamic length
            const cleanPhone = memberPhone.replace(/\D/g, '');
            if (cleanPhone.length < selectedCountry.min || cleanPhone.length > selectedCountry.max) {
                throw new Error(`El teléfono para ${selectedCountry.label} debe tener entre ${selectedCountry.min} y ${selectedCountry.max} dígitos.`);
            }
            
            // Format phone including country code for storage
            const fullPhone = `${selectedCountry.code.replace('+','')}${cleanPhone}`;

            // Upsert member
            const { error } = await supabase.from('members').upsert([{ 
                phone: fullPhone, name: memberName, business_name: memberBusiness 
            }], { onConflict: 'phone' });
            
            if (error) throw error;
            
            setStatus('idle');
            setWizardStep('business');
        } catch (err: any) {
            console.error(err);
            setStatus('error');
            setErrorMsg(err.message || "Error al registrar.");
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'prize') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);
            if (type === 'logo') { setLogoFile(file); setLogoPreview(url); }
            else { setPrizeFile(file); setPrizePreview(url); }
        }
    };

    const improveDescriptionWithAI = async () => {
        if (!description || description.length < 5) {
            alert('Escribe al menos una idea básica de tu negocio primero.');
            return;
        }
        setIsAiLoading(true);
        try {
            const ai = getAiModel();
            if (!ai) {
                alert("La IA no está disponible en este momento (Falta API Key).");
                return;
            }
            
            const model = ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `Actúa como un experto en copywriting y marketing para emprendedores.
            Reescribe la siguiente descripción de un negocio para que sea más atractiva, persuasiva, corta (máximo 2 frases) y profesional. 
            Descripción original: "${description}"` });
            
            const response = await model;
            const text = response.text;
            
            if (text) {
                setDescription(text.trim());
            }
        } catch (error) {
            console.error("Error AI:", error);
            alert("Hubo un error al conectar con la IA. Inténtalo de nuevo.");
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleBusinessSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!acceptedTerms) { alert("Debes aceptar los términos."); return; }
        if (category === 'Otro' && !customCategory) { alert("Especifíca el rubro."); return; }
        if (!prizeFile) { alert("Falta la foto del premio."); return; }

        setStatus('loading');
        
        try {
            let logoUrl = 'https://via.placeholder.com/150';
            let prizeUrl = '';
            if (logoFile) logoUrl = await uploadToStorage(logoFile);
            prizeUrl = await uploadToStorage(prizeFile);

            const finalCategory = category === 'Otro' ? customCategory : category;
            let formattedValue = value;
            if (!formattedValue.toUpperCase().includes('S/')) formattedValue = `S/ ${formattedValue.replace('$', '')}`;
            const formattedInsta = instagram.startsWith('@') ? instagram : (instagram ? `@${instagram}` : '');

            // Construct full phone again just to be safe or reuse state if not changed
            const cleanPhone = memberPhone.replace(/\D/g, '');
            const fullPhone = `${selectedCountry.code.replace('+','')}${cleanPhone}`;

            const { error } = await supabase.from('entrepreneurs').insert([{
                business_name: memberBusiness, owner_name: memberName, phone: fullPhone,
                prize: prize, prize_value: formattedValue, prize_image_url: prizeUrl,
                logo_image_url: logoUrl, instagram: formattedInsta, facebook, tiktok, website,
                description: description || 'Emprendedor de la tribu', category: finalCategory
            }]);

            if (error) throw error;
            setWizardStep('success');
            setStatus('idle');
        } catch (err: any) {
            console.error(err);
            setStatus('error');
            setErrorMsg(err.message || "Error al guardar ficha.");
        }
    };

    // SUCCESS SCREEN
    if (wizardStep === 'success') {
        return (
            <div className="container" style={{paddingTop: '120px', minHeight: '80vh'}}>
                <div className="success-message card p-40">
                    <CheckCircleIcon />
                    <h2 className="mt-medium">¡Inscripción Completa!</h2>
                    <p>Tu negocio y tu premio ya están publicados en el sorteo.</p>
                    <button onClick={() => window.location.href = window.location.origin} className="btn btn-primary btn-large mt-medium">
                        Ir a ver mi Publicación
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{background: '#f8fafc', minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px'}}>
             <div className="container" style={{maxWidth: '800px'}}>
                 
                 {/* PORTAL HEADER */}
                 <div className="portal-header text-center mb-medium">
                     <button onClick={onBack} className="btn-link-back">← Volver al inicio</button>
                     <div className="portal-icon-float"><RocketIcon /></div>
                     <h1 className="portal-title">Portal de Emprendedores</h1>
                     <p className="portal-subtitle">Únete a la comunidad, destaca tu marca y participa en la gran dinámica de premios.</p>
                 </div>

                 <div className="card p-40 shadow-xl border-t-brand">
                     {/* WIZARD STEPS INDICATOR */}
                     <div className="steps-visual" style={{marginBottom: '40px'}}>
                        <div className={`step-item ${wizardStep === 'member' ? 'active' : 'completed'}`}>
                            <div className="step-num">1</div>
                            <p>Tus Datos</p>
                        </div>
                        <div className="step-line"></div>
                        <div className={`step-item ${wizardStep === 'business' ? 'active' : ''}`}>
                             <div className="step-num">2</div>
                            <p>Tu Negocio</p>
                        </div>
                    </div>

                     {wizardStep === 'member' && (
                         <form onSubmit={handleMemberSubmit} className="clean-form">
                             <div className="form-group-large">
                                 <label>Tu Nombre Completo</label>
                                 <input type="text" value={memberName} onChange={e => setMemberName(e.target.value)} required placeholder="Ej. Juan Pérez" autoFocus />
                             </div>
                             
                             <div className="form-group-large">
                                 <label>Nombre de tu Negocio</label>
                                 <div className="input-with-icon">
                                     <span className="input-icon"><BriefcaseIcon /></span>
                                     <input type="text" value={memberBusiness} onChange={e => setMemberBusiness(e.target.value)} required placeholder="Ej. Mi Tienda SAC" />
                                 </div>
                             </div>

                             <div className="form-group-large">
                                 <label>WhatsApp (Contacto)</label>
                                 <div className="input-modern-wrapper" style={{padding: '4px 8px'}}>
                                     <div style={{marginRight: '8px', borderRight: '1px solid #ddd'}}>
                                         <select 
                                            value={selectedCountry.code} 
                                            onChange={(e) => {
                                                const country = COUNTRY_CODES.find(c => c.code === e.target.value);
                                                if(country) setSelectedCountry(country);
                                            }}
                                            style={{border: 'none', background: 'transparent', fontWeight: 'bold', outline: 'none', maxWidth: '80px', cursor: 'pointer'}}
                                         >
                                             {COUNTRY_CODES.map(c => (
                                                 <option key={c.country} value={c.code}>{c.label} {c.code}</option>
                                             ))}
                                         </select>
                                     </div>
                                     <input 
                                        type="tel" 
                                        value={memberPhone} 
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            setMemberPhone(val);
                                        }}
                                        required 
                                        placeholder={`Ej. ${'9'.repeat(selectedCountry.min)}`} 
                                     />
                                 </div>
                                 <p className="input-hint">Te contactaremos por aquí si ganas.</p>
                             </div>

                             {status === 'error' && <p className="error-text mb-medium">{errorMsg}</p>}
                             
                             <button className="btn btn-primary btn-block btn-giant-form" disabled={status === 'loading'}>
                                 {status === 'loading' ? 'Guardando...' : 'Comenzar Registro →'}
                             </button>
                         </form>
                     )}

                     {wizardStep === 'business' && (
                         <form onSubmit={handleBusinessSubmit} className="clean-form">
                            <div className="grid-2-col">
                                <div className="form-group">
                                    <label>Logo de tu Marca</label>
                                    <label className="upload-box-modern">
                                        {logoPreview ? <img src={logoPreview} className="upload-preview-img" /> : <div className="upload-placeholder-content"><ImageIcon /><span className="upload-text">Subir Logo</span></div>}
                                        <input type="file" ref={logoInputRef} onChange={(e) => handleImageChange(e, 'logo')} className="hidden" accept="image/*"/>
                                    </label>
                                </div>
                                <div className="form-group">
                                    <label>Rubro / Categoría</label>
                                    <select value={category} onChange={(e) => { setCategory(e.target.value); if(e.target.value !== 'Otro') setCustomCategory(''); }} className="form-select-large">
                                        {PREDEFINED_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    {category === 'Otro' && <input type="text" className="input-custom-category mt-2" placeholder="Especifica tu rubro..." value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} required />}
                                </div>
                            </div>

                            <div className="form-group mt-medium"><label>Redes Sociales (Opcional)</label>
                                <div className="social-inputs-grid">
                                    <div className="input-with-icon social"><span className="input-icon instagram"><InstagramIcon /></span><input type="text" placeholder="@usuario" value={instagram} onChange={(e) => setInstagram(e.target.value)} /></div>
                                    <div className="input-with-icon social"><span className="input-icon facebook"><FacebookIcon /></span><input type="text" placeholder="Facebook URL" value={facebook} onChange={(e) => setFacebook(e.target.value)} /></div>
                                    <div className="input-with-icon social"><span className="input-icon tiktok"><TikTokIcon /></span><input type="text" placeholder="TikTok URL" value={tiktok} onChange={(e) => setTiktok(e.target.value)} /></div>
                                    <div className="input-with-icon social"><span className="input-icon website"><GlobeIcon /></span><input type="text" placeholder="www.tuweb.com" value={website} onChange={(e) => setWebsite(e.target.value)} /></div>
                                </div>
                            </div>
                            
                            <div className="form-group ai-section">
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                                    <label style={{marginBottom: 0}}>Descripción del Negocio</label>
                                    <button type="button" onClick={improveDescriptionWithAI} disabled={isAiLoading} className="btn-ai-magic-glow">
                                        {isAiLoading ? <LoaderIcon /> : <SparkleIcon />} {isAiLoading ? 'Redactando...' : 'Mejorar con IA'}
                                    </button>
                                </div>
                                <textarea rows={3} placeholder="Cuéntanos brevemente qué vendes o qué servicio ofreces..." value={description} onChange={(e) => setDescription(e.target.value)} className="form-textarea-large" required />
                            </div>

                            <div className="separator-line"></div>
                            <div className="form-section-label"><span className="section-icon"><GiftIcon /></span><h3>Tu Aporte (Premio)</h3></div>
                            
                            <div className="grid-2-col">
                                <div className="form-group"><label>¿Qué vas a sortear?</label><input type="text" value={prize} onChange={(e) => setPrize(e.target.value)} required placeholder="Ej. Vale de consumo, Producto X..." className="input-large" /></div>
                                <div className="form-group"><label>Valor Aprox. (S/)</label><input type="text" value={value} onChange={(e) => setValue(e.target.value)} required placeholder="Ej. 50.00" className="input-large" /></div>
                            </div>

                            <div className="form-group">
                                <label>Foto del Premio (Importante)</label>
                                <label className="upload-box-wide">
                                    {prizePreview ? <div className="preview-wide"><img src={prizePreview} /></div> : <div className="upload-placeholder-content"><ImageIcon /><span className="upload-text">Subir Foto Atractiva del Premio</span></div>}
                                    <input type="file" accept="image/*" ref={prizeInputRef} onChange={(e) => handleImageChange(e, 'prize')} className="hidden" />
                                </label>
                            </div>

                            <div className="terms-checkbox-styled">
                                <label>
                                    <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} />
                                    <span className="checkbox-custom"></span>
                                    <span className="label-text">Me comprometo a entregar este premio al ganador del sorteo.</span>
                                </label>
                            </div>
                            
                            {status === 'error' && <p className="error-text mb-medium">{errorMsg}</p>}
                            <button type="submit" className="btn btn-primary btn-block btn-giant-form" disabled={status === 'loading'}>
                                 {status === 'loading' ? <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}><LoaderIcon /> Publicando...</span> : 'Finalizar y Publicar'}
                            </button>
                         </form>
                     )}
                 </div>
             </div>
        </div>
    );
}

// ... [ClientRegistrationModal UPDATED]
function ClientRegistrationModal({ onClose, onGoToDirectory }: { onClose: () => void, onGoToDirectory: () => void }) {
    const [step, setStep] = useState<'form' | 'mission' | 'ticket'>('form');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [ticketCode, setTicketCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [randomBrands, setRandomBrands] = useState<Entrepreneur[]>([]);
    const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]); // Default Peru
    const ticketRef = useRef<HTMLDivElement>(null);
    const [clickedBrands, setClickedBrands] = useState<Set<string>>(new Set());

    const fetchRandomBrands = async () => {
        // Fetch up to 50 active entrepreneurs to ensure we have a pool to shuffle
        const { data } = await supabase.from('entrepreneurs').select('*').limit(50);
        
        if (data && data.length > 0) {
             // Fisher-Yates shuffle algorithm for better randomness than sort()
             const shuffled = [...data];
             for (let i = shuffled.length - 1; i > 0; i--) {
                 const j = Math.floor(Math.random() * (i + 1));
                 [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
             }
             
             // Select top 3
             const selected = shuffled.slice(0, 3);

             const mapped: Entrepreneur[] = selected.map(item => ({
                  id: item.id,
                  name: item.business_name,
                  ownerName: item.owner_name,
                  phone: item.phone,
                  prize: item.prize,
                  value: item.prize_value,
                  prizeImage: item.prize_image_url || 'https://via.placeholder.com/600',
                  logoImage: item.logo_image_url || 'https://via.placeholder.com/150',
                  date: new Date(item.created_at),
                  instagram: item.instagram,
                  facebook: item.facebook,
                  tiktok: item.tiktok,
                  website: item.website,
                  description: item.description,
                  category: item.category,
                  isFeatured: item.is_featured
              }));
             setRandomBrands(mapped);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Flexible validation based on country
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length < selectedCountry.min || cleanPhone.length > selectedCountry.max) {
            alert(`Para ${selectedCountry.label}, el número debe tener entre ${selectedCountry.min} y ${selectedCountry.max} dígitos.`);
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            fetchRandomBrands();
            setStep('mission');
        }, 800);
    };

    const handleBrandClick = (brandId: string, instagramHandle: string) => {
        const url = `https://instagram.com/${instagramHandle.replace('@','')}`;
        window.open(url, '_blank');
        
        setClickedBrands(prev => {
            const newSet = new Set(prev);
            newSet.add(brandId);
            return newSet;
        });
    };

    const handleGenerateTicket = async () => {
        setIsLoading(true);
        try {
            const code = `#TRIBU-${Math.floor(1000 + Math.random() * 9000)}`;
            
            const cleanPhone = phone.replace(/\D/g, '');
            // Create full international format
            const fullPhone = `${selectedCountry.code.replace('+','')}${cleanPhone}`;

            const { error } = await supabase.from('clients').insert([{
                name: name,
                phone: fullPhone,
                ticket_code: code
            }]);

            if (error) throw error;

            setTicketCode(code);
            setStep('ticket');
        } catch (err) {
            console.error(err);
            alert('Error al generar ticket. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    const allBrandsClicked = randomBrands.length > 0 && clickedBrands.size >= randomBrands.length;
    const progressPercentage = randomBrands.length > 0 ? (clickedBrands.size / randomBrands.length) * 100 : 0;

    return (
        <div className="modal-overlay">
            <div className={`modal-content-modern ${step === 'ticket' ? 'wide-modal' : ''}`}>
                <button className="close-btn-modern" onClick={onClose}><XIcon /></button>
                
                {step === 'form' && (
                    <div className="text-center">
                        <div className="modal-decorative-header">
                            <div className="floating-icon-top"><GiftIcon /></div>
                        </div>
                        <div className="modal-body-p40">
                            <h3 className="modal-modern-subtitle">¡YA ESTÁS CERCA!</h3>
                            <h2 className="modal-modern-title">¡Reclama tu Ticket Gratis!</h2>
                            <p className="modal-modern-desc">Solo faltan tus datos para imprimir tu ticket y entrar al sorteo.</p>
                            
                            <form onSubmit={handleFormSubmit} className="clean-form mt-medium">
                                <div className="form-group-modern">
                                    <label>Tu Nombre Completo</label>
                                    <div className="input-modern-wrapper">
                                        <UserIcon />
                                        <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Ej. María García" />
                                    </div>
                                </div>
                                <div className="form-group-modern">
                                    <label>Tu WhatsApp (Para avisarte si ganas)</label>
                                    <div className="input-modern-wrapper" style={{paddingLeft: '10px'}}>
                                        <div style={{borderRight: '1px solid #ddd', marginRight: '10px', display: 'flex', alignItems: 'center'}}>
                                            <select 
                                                value={selectedCountry.code} 
                                                onChange={(e) => {
                                                    const country = COUNTRY_CODES.find(c => c.code === e.target.value);
                                                    if(country) setSelectedCountry(country);
                                                }}
                                                style={{border: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '0.9rem', outline: 'none', maxWidth: '85px', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none'}}
                                            >
                                                {COUNTRY_CODES.map(c => (
                                                    <option key={c.country} value={c.code}>{c.label} ({c.code})</option>
                                                ))}
                                            </select>
                                            <span style={{fontSize: '0.8rem', marginLeft: '2px'}}>▼</span>
                                        </div>
                                        <input 
                                            type="tel" 
                                            value={phone} 
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                setPhone(val);
                                            }}
                                            required 
                                            placeholder={`Número (${selectedCountry.min} dígitos)`} 
                                        />
                                    </div>
                                </div>
                                <button className="btn btn-primary btn-block btn-glowing mt-medium" disabled={isLoading}>
                                    {isLoading ? 'Procesando...' : '¡QUIERO MI TICKET!'}
                                </button>
                                <p className="privacy-note mt-small"><LockIcon /> Tus datos están 100% seguros. No spam.</p>
                            </form>
                        </div>
                    </div>
                )}

                {step === 'mission' && (
                    <div className="text-center">
                        <div className="modal-header-mission">
                            <h2 className="text-gradient">🎯 Misión Requerida</h2>
                            <p className="text-gray-sm">Sigue a estas marcas para desbloquear tu ticket.</p>
                            
                            <div className="mission-progress-track">
                                <div className="mission-progress-fill" style={{width: `${progressPercentage}%`}}></div>
                            </div>
                            <div className="mission-progress-label">
                                {clickedBrands.size} de {randomBrands.length} completadas
                            </div>
                        </div>
                        
                        <div className="mission-list-container">
                            {randomBrands.map((brand) => {
                                const isClicked = clickedBrands.has(brand.id);
                                return (
                                    <div key={brand.id} className={`mission-brand-card ${isClicked ? 'completed' : ''}`}>
                                        <div className="mission-card-left">
                                            <img src={brand.logoImage} alt="logo" className="mission-brand-logo" />
                                            <div className="mission-brand-details">
                                                <div className="mission-brand-name">{brand.name}</div>
                                                <div className="mission-brand-handle">{brand.instagram}</div>
                                            </div>
                                        </div>
                                        <div className="mission-card-right">
                                            <button 
                                                className={`btn-mission-follow ${isClicked ? 'done' : ''}`}
                                                onClick={() => handleBrandClick(brand.id, brand.instagram)}
                                            >
                                                {isClicked ? '¡Listo!' : 'Seguir'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                            {randomBrands.length === 0 && <div className="p-20 text-gray"><LoaderIcon /> Cargando marcas...</div>}
                        </div>

                        <div className="mission-footer-action">
                            <div className="warning-box-clean">
                                ⚠️ Verificaremos que sigas a las cuentas si ganas.
                            </div>

                            <button 
                                onClick={handleGenerateTicket} 
                                className={`btn-giant-action ${allBrandsClicked ? 'unlocked' : 'locked'}`}
                                disabled={isLoading || !allBrandsClicked}
                            >
                                {isLoading ? <LoaderIcon /> : (allBrandsClicked ? '✨ ¡GENERAR MI TICKET! ✨' : 'Completa las misiones arriba...')}
                            </button>
                        </div>
                    </div>
                )}

                {step === 'ticket' && (
                    <div className="ticket-view-container">
                        <ConfettiBackground />
                        
                        <h2 className="text-center mb-small text-gradient">🎉 ¡ESTÁS DENTRO! 🎉</h2>
                        <p className="text-center mb-medium text-gray">Este es tu pase oficial para el sorteo.</p>
                        
                        <div className="ticket-wrapper-centered">
                            <div className="golden-ticket-visual" ref={ticketRef}>
                                <div className="ticket-stub-left">
                                    <div className="ticket-brand-header">LA TRIBU</div>
                                    <div className="ticket-event-name">GRAN SORTEO</div>
                                    <div className="ticket-user-info">
                                        <div className="ticket-label">PARTICIPANTE</div>
                                        <div className="ticket-value-lg">{name}</div>
                                    </div>
                                    <div className="ticket-validity">
                                        <CheckCircleIcon />
                                        <span>VERIFICADO</span>
                                    </div>
                                </div>
                                <div className="ticket-rip-line">
                                    <div className="rip-circle-top"></div>
                                    <div className="rip-dash"></div>
                                    <div className="rip-circle-bottom"></div>
                                </div>
                                <div className="ticket-stub-right">
                                    <div className="ticket-number-label">N° BOLETO</div>
                                    <div className="ticket-code-glitch">{ticketCode}</div>
                                    <div className="ticket-qr-fake">
                                        <QrIcon />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="ticket-actions mt-medium">
                            <p className="text-center text-sm text-gray">Haz una captura de pantalla para guardar tu ticket.</p>
                            <button onClick={onGoToDirectory} className="btn btn-ghost-action btn-block mt-small">
                                Explorar Directorio <ArrowRightIcon />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- NEW ENTREPRENEUR PORTAL COMPONENT (SUPER AMIGABLE & EDUCATIVO) ---
function EntrepreneurPortal({ onBack }: { onBack: () => void }) {
    const [step, setStep] = useState<'login' | 'dashboard'>('login');
    const [activeTab, setActiveTab] = useState<'business' | 'prize'>('business');
    const [loginPhone, setLoginPhone] = useState('');
    const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
    const [data, setData] = useState<Entrepreneur | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // Edit Form State
    const [editForm, setEditForm] = useState<Partial<Entrepreneur>>({});
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [prizeFile, setPrizeFile] = useState<File | null>(null);
    const [prizePreview, setPrizePreview] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const cleanPhone = loginPhone.replace(/\D/g, '');
            const fullPhone = `${selectedCountry.code.replace('+','')}${cleanPhone}`;
            
            // Flexible Search
            let { data: entData, error } = await supabase
                .from('entrepreneurs')
                .select('*')
                .eq('phone', fullPhone)
                .single();

            if (!entData) {
                const { data: legacyData } = await supabase
                    .from('entrepreneurs')
                    .select('*')
                    .like('phone', `%${cleanPhone}`)
                    .limit(1)
                    .single();
                entData = legacyData;
            }

            if (entData) {
                const mappedData: Entrepreneur = {
                    id: entData.id,
                    name: entData.business_name,
                    ownerName: entData.owner_name,
                    phone: entData.phone,
                    prize: entData.prize,
                    value: entData.prize_value,
                    prizeImage: entData.prize_image_url || '',
                    logoImage: entData.logo_image_url || '',
                    date: new Date(entData.created_at),
                    instagram: entData.instagram,
                    facebook: entData.facebook,
                    tiktok: entData.tiktok,
                    website: entData.website,
                    description: entData.description,
                    category: entData.category,
                    isFeatured: entData.is_featured
                };

                setData(mappedData);
                setEditForm({
                    name: mappedData.name,
                    ownerName: mappedData.ownerName,
                    category: mappedData.category,
                    description: mappedData.description,
                    instagram: mappedData.instagram,
                    facebook: mappedData.facebook,
                    tiktok: mappedData.tiktok,
                    website: mappedData.website,
                    prize: mappedData.prize,
                    value: mappedData.value
                });
                setLogoPreview(mappedData.logoImage);
                setPrizePreview(mappedData.prizeImage);
                setStep('dashboard');
            } else {
                alert('No encontramos un registro con este número. Asegúrate de haberte inscrito primero.');
            }
        } catch (err) {
            console.error(err);
            alert('Error al buscar. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!data) return;
        setSaving(true);
        try {
            let logoUrl = data.logoImage;
            let prizeUrl = data.prizeImage;

            if (logoFile) logoUrl = await uploadToStorage(logoFile);
            if (prizeFile) prizeUrl = await uploadToStorage(prizeFile);

            const { error } = await supabase
                .from('entrepreneurs')
                .update({
                    business_name: editForm.name,
                    owner_name: editForm.ownerName,
                    category: editForm.category,
                    description: editForm.description,
                    instagram: editForm.instagram,
                    facebook: editForm.facebook,
                    tiktok: editForm.tiktok,
                    website: editForm.website,
                    prize: editForm.prize,
                    prize_value: editForm.value,
                    logo_image_url: logoUrl,
                    prize_image_url: prizeUrl
                })
                .eq('id', data.id);

            if (error) throw error;
            
            // Update local state to reflect changes immediately
            setData({ ...data, logoImage: logoUrl, prizeImage: prizeUrl, ...editForm } as Entrepreneur);
            alert('¡Genial! Tus datos han sido actualizados. 🎉');
        } catch (err) {
            console.error(err);
            alert('Hubo un problema al guardar. Intenta de nuevo.');
        } finally {
            setSaving(false);
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'prize') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);
            if (type === 'logo') { setLogoFile(file); setLogoPreview(url); }
            else { setPrizeFile(file); setPrizePreview(url); }
        }
    };

    if (step === 'login') {
        return (
            <div className="container" style={{paddingTop: '120px', minHeight: '80vh', display: 'flex', justifyContent: 'center'}}>
                <div className="card p-40" style={{maxWidth: '450px', width: '100%', textAlign: 'center'}}>
                    <div style={{color: '#e1306c', marginBottom: '20px'}}><BriefcaseIcon /></div>
                    <h2 style={{marginBottom: '10px'}}>Portal del Emprendedor</h2>
                    <p style={{marginBottom: '20px', color: '#64748b'}}>Ingresa tu WhatsApp registrado para editar tu perfil.</p>
                    
                    <form onSubmit={handleLogin} className="clean-form">
                        <div className="form-group-modern">
                            <label>Tu WhatsApp</label>
                            <div className="input-modern-wrapper" style={{paddingLeft: '10px'}}>
                                <div style={{borderRight: '1px solid #ddd', marginRight: '10px', display: 'flex', alignItems: 'center'}}>
                                    <select 
                                        value={selectedCountry.code} 
                                        onChange={(e) => {
                                            const country = COUNTRY_CODES.find(c => c.code === e.target.value);
                                            if(country) setSelectedCountry(country);
                                        }}
                                        style={{border: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '0.9rem', outline: 'none', maxWidth: '85px', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none'}}
                                    >
                                        {COUNTRY_CODES.map(c => (
                                            <option key={c.country} value={c.code}>{c.label} ({c.code})</option>
                                        ))}
                                    </select>
                                    <span style={{fontSize: '0.8rem', marginLeft: '2px'}}>▼</span>
                                </div>
                                <input 
                                    type="tel" 
                                    value={loginPhone} 
                                    onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, ''))}
                                    required 
                                    placeholder="Número de celular" 
                                />
                            </div>
                        </div>
                        <button className="btn btn-primary btn-block mt-medium" disabled={loading}>
                            {loading ? <LoaderIcon /> : 'Ingresar al Portal'}
                        </button>
                    </form>
                    <button onClick={onBack} className="btn-link mt-medium">Volver</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{background: '#f8fafc', minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px'}}>
            <div className="container" style={{maxWidth: '800px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                    <button onClick={onBack} className="btn-link-back">← Cerrar Sesión</button>
                    <div style={{background: '#d1fae5', color: '#065f46', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.8rem'}}>
                        Modo Editor
                    </div>
                </div>

                <div className="card p-40" style={{borderTop: '5px solid #e1306c'}}>
                    <h2 style={{textAlign: 'center', marginBottom: '10px'}}>Hola, {editForm.ownerName?.split(' ')[0]} 👋</h2>
                    <p style={{textAlign: 'center', color: '#64748b', marginBottom: '30px'}}>Vamos a poner tu negocio guapo. Elige qué quieres editar:</p>

                    {/* BIG TABS */}
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px'}}>
                        <button 
                            onClick={() => setActiveTab('business')}
                            style={{
                                padding: '20px', 
                                background: activeTab === 'business' ? '#fff0f5' : 'white', 
                                border: `2px solid ${activeTab === 'business' ? '#e1306c' : '#e2e8f0'}`,
                                borderRadius: '12px',
                                cursor: 'pointer',
                                transition: '0.2s'
                            }}
                        >
                            <div style={{fontSize: '2rem', marginBottom: '5px'}}>🏢</div>
                            <div style={{fontWeight: 800, color: '#333'}}>Mi Empresa</div>
                            <div style={{fontSize: '0.8rem', color: '#666'}}>Logo, Redes, Datos</div>
                        </button>

                        <button 
                            onClick={() => setActiveTab('prize')}
                            style={{
                                padding: '20px', 
                                background: activeTab === 'prize' ? '#fff0f5' : 'white', 
                                border: `2px solid ${activeTab === 'prize' ? '#e1306c' : '#e2e8f0'}`,
                                borderRadius: '12px',
                                cursor: 'pointer',
                                transition: '0.2s'
                            }}
                        >
                            <div style={{fontSize: '2rem', marginBottom: '5px'}}>🎁</div>
                            <div style={{fontWeight: 800, color: '#333'}}>Mi Premio</div>
                            <div style={{fontSize: '0.8rem', color: '#666'}}>Foto, Título, Reglas</div>
                        </button>
                    </div>
                    
                    {/* TAB CONTENT: BUSINESS */}
                    {activeTab === 'business' && (
                        <div className="animate-fade-up">
                            <div className="form-section-label"><span className="section-icon"><BriefcaseIcon /></span><h3>Datos de la Marca</h3></div>
                            
                            {/* LOGO UPLOAD REDESIGNED */}
                            <div className="form-group mb-medium" style={{textAlign: 'center', position: 'relative'}}>
                                <label style={{marginBottom: '10px', display: 'block', fontWeight: 'bold', color: '#333'}}>Tu Logo</label>
                                
                                <div style={{position: 'relative', width: '160px', height: '160px', margin: '0 auto'}}>
                                    <label className="upload-box-modern" style={{
                                        width: '100%', height: '100%', 
                                        borderRadius: '50%', 
                                        border: '4px solid white',
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                        overflow: 'hidden',
                                        background: '#f8fafc',
                                        position: 'relative',
                                        cursor: 'pointer'
                                    }}>
                                        {logoPreview ? (
                                            <img src={logoPreview} className="upload-preview-img" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                        ) : (
                                            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#cbd5e1'}}>
                                                <ImageIcon size={40} />
                                                <span style={{fontSize: '0.7rem', marginTop: '4px'}}>Subir</span>
                                            </div>
                                        )}
                                        <input type="file" onChange={(e) => handleImageSelect(e, 'logo')} className="hidden" accept="image/*"/>
                                        
                                        {/* Overlay for edit hint */}
                                        <div style={{
                                            position: 'absolute', bottom: '0', left: '0', right: '0', 
                                            background: 'rgba(0,0,0,0.5)', color: 'white', 
                                            fontSize: '0.7rem', padding: '4px', textAlign: 'center'
                                        }}>
                                            CAMBIAR
                                        </div>
                                    </label>
                                    
                                    {/* Floating Edit Icon */}
                                    <div style={{
                                        position: 'absolute', bottom: '10px', right: '10px', 
                                        background: '#e1306c', color: 'white', 
                                        width: '32px', height: '32px', borderRadius: '50%', 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                                        pointerEvents: 'none'
                                    }}>
                                        <EditIcon size={16} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid-2-col">
                                <div className="form-group-large">
                                    <label>Nombre Comercial</label>
                                    <input type="text" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} className="input-large" />
                                </div>
                                <div className="form-group-large">
                                    <label>Rubro</label>
                                    <select value={PREDEFINED_CATEGORIES.includes(editForm.category || '') ? editForm.category : 'Otro'} onChange={e => setEditForm({...editForm, category: e.target.value})} className="form-select-large">
                                        {PREDEFINED_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* MOVED: Business Description */}
                            <div className="form-group-large" style={{marginTop: '20px'}}>
                                <label>Historia / Reseña de tu Empresa</label>
                                <p className="input-hint" style={{marginBottom: '8px'}}>Cuéntanos de qué trata tu negocio para que los clientes te conozcan mejor.</p>
                                <textarea 
                                    rows={4} 
                                    value={editForm.description || ''} 
                                    onChange={e => setEditForm({...editForm, description: e.target.value})} 
                                    className="form-textarea-large"
                                    placeholder="Somos expertos en..."
                                    style={{border: '2px solid #e2e8f0', background: 'white', width: '100%'}} 
                                />
                            </div>

                            {/* SOCIALS CARDS DESIGN - HIGHLY VISUAL */}
                            <div className="separator-line"></div>
                            <div className="form-section-label"><span className="section-icon"><InstagramIcon /></span><h3>Tus Redes Sociales</h3></div>
                            <p style={{fontSize: '0.9rem', color: '#64748b', marginBottom: '20px'}}>
                                Asegúrate de que los enlaces funcionen para que los clientes te encuentren.
                            </p>

                            {/* INSTAGRAM CARD */}
                            <div style={{background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)'}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px'}}>
                                    <div style={{background: '#fce7f3', padding: '8px', borderRadius: '10px', color: '#e1306c'}}>
                                        <InstagramIcon size={24} />
                                    </div>
                                    <label style={{fontSize: '1rem', fontWeight: '800', color: '#333'}}>Instagram</label>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Ej: @mi_tienda_peru" 
                                    value={editForm.instagram || ''} 
                                    onChange={(e) => setEditForm({...editForm, instagram: e.target.value})} 
                                    style={{width: '100%', padding: '12px 16px', borderRadius: '10px', border: '2px solid #fbcfe8', fontSize: '1rem', outline: 'none', transition: '0.2s'}}
                                    onFocus={(e) => e.target.style.borderColor = '#e1306c'}
                                    onBlur={(e) => e.target.style.borderColor = '#fbcfe8'}
                                />
                                <p style={{fontSize: '0.8rem', color: '#831843', marginTop: '6px', marginLeft: '4px'}}>* Solo coloca tu usuario o el enlace completo.</p>
                            </div>

                            {/* FACEBOOK CARD */}
                            <div style={{background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)'}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px'}}>
                                    <div style={{background: '#e0e7ff', padding: '8px', borderRadius: '10px', color: '#1877f2'}}>
                                        <FacebookIcon size={24} />
                                    </div>
                                    <label style={{fontSize: '1rem', fontWeight: '800', color: '#333'}}>Facebook</label>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Pega el enlace de tu página aquí" 
                                    value={editForm.facebook || ''} 
                                    onChange={(e) => setEditForm({...editForm, facebook: e.target.value})} 
                                    style={{width: '100%', padding: '12px 16px', borderRadius: '10px', border: '2px solid #bfdbfe', fontSize: '1rem', outline: 'none', transition: '0.2s'}}
                                    onFocus={(e) => e.target.style.borderColor = '#1877f2'}
                                    onBlur={(e) => e.target.style.borderColor = '#bfdbfe'}
                                />
                            </div>

                            {/* TIKTOK CARD */}
                            <div style={{background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)'}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px'}}>
                                    <div style={{background: '#f1f5f9', padding: '8px', borderRadius: '10px', color: '#000'}}>
                                        <TikTokIcon size={24} />
                                    </div>
                                    <label style={{fontSize: '1rem', fontWeight: '800', color: '#333'}}>TikTok</label>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Usuario o enlace de TikTok" 
                                    value={editForm.tiktok || ''} 
                                    onChange={(e) => setEditForm({...editForm, tiktok: e.target.value})} 
                                    style={{width: '100%', padding: '12px 16px', borderRadius: '10px', border: '2px solid #cbd5e1', fontSize: '1rem', outline: 'none', transition: '0.2s'}}
                                    onFocus={(e) => e.target.style.borderColor = '#000'}
                                    onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                                />
                            </div>

                            {/* WEBSITE CARD */}
                            <div style={{background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)'}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px'}}>
                                    <div style={{background: '#d1fae5', padding: '8px', borderRadius: '10px', color: '#059669'}}>
                                        <GlobeIcon size={24} />
                                    </div>
                                    <label style={{fontSize: '1rem', fontWeight: '800', color: '#333'}}>Sitio Web (Opcional)</label>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="www.tu-negocio.com" 
                                    value={editForm.website || ''} 
                                    onChange={(e) => setEditForm({...editForm, website: e.target.value})} 
                                    style={{width: '100%', padding: '12px 16px', borderRadius: '10px', border: '2px solid #a7f3d0', fontSize: '1rem', outline: 'none', transition: '0.2s'}}
                                    onFocus={(e) => e.target.style.borderColor = '#059669'}
                                    onBlur={(e) => e.target.style.borderColor = '#a7f3d0'}
                                />
                            </div>

                        </div>
                    )}

                    {/* TAB CONTENT: PRIZE */}
                    {activeTab === 'prize' && (
                        <div className="animate-fade-up">
                            <div className="form-section-label"><span className="section-icon"><GiftIcon /></span><h3>¿Qué vas a regalar?</h3></div>
                            
                            {/* PRIZE PHOTO */}
                            <div className="form-group mb-medium">
                                <label>Foto del Premio (Muy Importante)</label>
                                <p className="input-hint">Una buena foto atrae más clientes.</p>
                                <label className="upload-box-wide" style={{height: '220px'}}>
                                    {prizePreview ? <img src={prizePreview} style={{height: '100%', objectFit: 'contain'}} /> : <span>Toca para subir foto</span>}
                                    <input type="file" onChange={(e) => handleImageSelect(e, 'prize')} className="hidden" accept="image/*"/>
                                </label>
                            </div>

                            {/* PRIZE DESCRIPTION BOX - UPDATED TO BE PROMINENT AND LARGE */}
                            <div className="form-group-large">
                                <label>Descripción del Regalo a Sortear</label>
                                <div style={{background: '#fffbeb', padding: '10px', borderRadius: '8px', marginBottom: '10px', fontSize: '0.85rem', color: '#92400e'}}>
                                    🎁 Escribe aquí qué vas a regalar. Hazlo sonar increíble.
                                </div>
                                <textarea 
                                    rows={4} 
                                    value={editForm.prize || ''} 
                                    onChange={e => setEditForm({...editForm, prize: e.target.value})} 
                                    className="form-textarea-large"
                                    placeholder="Ej. Vale de consumo por S/ 50.00..."
                                    style={{border: '2px solid #e1306c', background: '#fff0f5', fontSize: '1.1rem', fontWeight: '600', width: '100%'}} 
                                />
                            </div>

                            <div className="form-group-large">
                                <label>Valor Referencial (S/)</label>
                                <input type="text" placeholder="50.00" value={editForm.value || ''} onChange={e => setEditForm({...editForm, value: e.target.value})} className="input-large" />
                            </div>
                        </div>
                    )}

                    {/* SAVE BUTTON (FLOATING OR BOTTOM) */}
                    <div style={{marginTop: '30px', position: 'sticky', bottom: '20px', zIndex: 10}}>
                        <button onClick={handleSave} className="btn btn-primary btn-block btn-giant-form" disabled={saving}>
                            {saving ? <LoaderIcon /> : 'GUARDAR CAMBIOS'}
                        </button>
                    </div>

                    <div style={{textAlign: 'center', marginTop: '40px', paddingBottom: '20px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: '500'}}>
                        ✨ Hecho con mucho corazón de <a href="https://gaorsystem.vercel.app/" target="_blank" rel="noopener noreferrer" style={{color: '#e1306c', textDecoration: 'none'}}><strong>Mago26</strong></a> ✨
                    </div>

                </div>
            </div>
        </div>
    );
}

function App() {
  // Navigation State
  const [viewMode, setViewMode] = useState<'landing' | 'preregister' | 'admin' | 'card' | 'portal'>('landing');
  const [cardId, setCardId] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // App Data
  const [entries, setEntries] = useState<Entrepreneur[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [isClientModalOpen, setIsClientModalOpen] = useState(false); // Client Modal
  const [isLedgerOpen, setIsLedgerOpen] = useState(false); // Public Ledger Modal
  
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Todas');
  
  // Prize Gallery State
  const [showAllGallery, setShowAllGallery] = useState(false);
  
  // Animation Refs
  const directoryRef = useRef<HTMLDivElement>(null);
  const [isDirVisible, setIsDirVisible] = useState(false);
  
  // Flyer Ref - Removed isCapturing state as sharing feature is removed
  const flyerRef = useRef<HTMLDivElement>(null);

  // Secret Clicks Logic
  const [secretClicks, setSecretClicks] = useState(0);
  const [logoClicks, setLogoClicks] = useState(0); // New state for logo clicks

  // --- MISSING FUNCTIONS DEFINED HERE ---
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false); // Close menu on click
  };

  const closePromo = () => {
    setIsPromoOpen(false);
  };
  // --------------------------------------

  useEffect(() => {
    fetchEntries();
    
    // Check for secret URL parameter
    const params = new URLSearchParams(window.location.search);
    const cardParam = params.get('card');
    
    if (cardParam) {
        setCardId(cardParam);
        setViewMode('card');
    } else if (params.get('zona') === 'tribu') {
        setViewMode('preregister');
    } else if (params.get('zona') === 'admin') {
        setViewMode('admin');
    } else if (params.get('ver') === 'directorio') {
        setIsDirectoryOpen(true);
    }
    
    const handleScroll = () => {
        setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Intersection Observer for Animation
    const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) setIsDirVisible(true);
    }, { threshold: 0.2 });
    
    if (directoryRef.current) {
        observer.observe(directoryRef.current);
    }
    
    const timer = setTimeout(() => {
        if (viewMode === 'landing') setIsPromoOpen(true);
    }, 1500);

    return () => {
        window.removeEventListener('scroll', handleScroll);
        clearTimeout(timer);
        if (directoryRef.current) observer.unobserve(directoryRef.current);
    }
  }, [viewMode]);

  // Handle Logo Clicks for Portal Access
  const handleLogoClick = () => {
      window.scrollTo({top: 0, behavior: 'smooth'});
      setMobileMenuOpen(false);
      
      setLogoClicks(prev => {
          const newCount = prev + 1;
          if (newCount >= 3) {
              setViewMode('portal');
              return 0;
          }
          // Reset clicks if user stops clicking for 2 seconds
          setTimeout(() => setLogoClicks(0), 2000);
          return newCount;
      });
  };

  const handleSecretClick = () => {
      setSecretClicks(prev => {
          const newCount = prev + 1;
          if (newCount >= 5) {
              setViewMode('admin');
              return 0;
          }
          return newCount;
      });
  };

  const fetchEntries = async () => {
      try {
          const { data, error } = await supabase
              .from('entrepreneurs')
              .select('*')
              .order('is_featured', { ascending: false })
              .order('created_at', { ascending: false });
          
          if (error) throw error;
          
          if (data) {
              const mappedEntries: Entrepreneur[] = data.map(item => ({
                  id: item.id,
                  name: item.business_name,
                  ownerName: item.owner_name,
                  phone: item.phone,
                  prize: item.prize,
                  value: item.prize_value,
                  prizeImage: item.prize_image_url || 'https://via.placeholder.com/600x600?text=Sin+Imagen',
                  logoImage: item.logo_image_url || 'https://via.placeholder.com/150x150?text=Logo',
                  date: new Date(item.created_at),
                  instagram: item.instagram,
                  facebook: item.facebook,
                  tiktok: item.tiktok,
                  website: item.website,
                  description: item.description,
                  category: item.category,
                  isFeatured: item.is_featured
              }));
              setEntries(mappedEntries);
          }
      } catch (err) {
          console.error("Error fetching data:", err);
      } finally {
          setIsLoading(false);
      }
  };

  const openClientModal = () => {
      setIsClientModalOpen(true);
      setMobileMenuOpen(false);
      document.body.style.overflow = 'hidden';
  }

  const closeClientModal = () => {
      setIsClientModalOpen(false);
      document.body.style.overflow = 'auto';
  }

  const openDirectory = () => {
      setIsDirectoryOpen(true);
      setMobileMenuOpen(false);
      document.body.style.overflow = 'hidden';
  };

  const closeDirectory = () => {
      setIsDirectoryOpen(false);
      document.body.style.overflow = 'auto';
  };
  
  const handleCopyLink = () => {
    const link = `${window.location.origin}/?ver=directorio`;
    navigator.clipboard.writeText(link);
    alert('Enlace del directorio copiado. ¡Compártelo!');
  };

  const handleShareWhatsAppList = () => {
      const topEntries = entries.slice(0, 5);
      const listText = topEntries.map(e => `👉 *${e.name}* - ${e.category}`).join('\n');
      
      const shareText = `🚀 *Directorio Oficial La Tribu* 🚀\nApoya a nuestros emprendedores:\n\n${listText}\n\n...y ${entries.length > 5 ? `más de ${entries.length - 5} marcas más` : 'muchos más'}.\n\n👇 Encuéntralos a todos aquí:\n${window.location.origin}/?ver=directorio`;
      
      navigator.clipboard.writeText(shareText);
      alert('¡Lista copiada! Lista para pegar en WhatsApp.');
  };

  const filteredEntries = entries.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.instagram.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'Todas' || e.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filterCategories = React.useMemo(() => {
      const base = PREDEFINED_CATEGORIES.filter(c => c !== 'Otro');
      const fromEntries = entries.map(e => e.category);
      return ["Todas", ...Array.from(new Set([...base, ...fromEntries]))];
  }, [entries]);

  // RENDER SEPARATE VIEWS
  if (viewMode === 'preregister') {
      return <PreRegisterForm onBack={() => setViewMode('landing')} />;
  }
  
  if (viewMode === 'admin') {
      return <AdminDashboard onLogout={() => setViewMode('landing')} />;
  }

  if (viewMode === 'portal') {
      return <EntrepreneurPortal onBack={() => setViewMode('landing')} />;
  }

  if (viewMode === 'card') {
      return <DigitalCardView entrepreneurId={cardId} onBack={() => { setViewMode('landing'); window.history.replaceState(null, '', '/'); }} />;
  }

  // RENDER MAIN LANDING PAGE
  return (
    <div className="app-container">
      {/* Navbar */}
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="nav-inner">
            <div className="brand" onClick={handleLogoClick} style={{cursor: 'pointer', userSelect: 'none'}}>
                <div className="brand-icon"><GiftIcon /></div>
                <span>SorteoTribu</span>
            </div>
            
            {/* Desktop Actions */}
            <div className="nav-actions">
                <button onClick={() => setIsLedgerOpen(true)} className="nav-link" style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                    <ListIcon /> Lista Oficial
                </button>
                <button onClick={() => scrollToSection('gallery')} className="nav-link">Premios</button>
                <button onClick={openDirectory} className="nav-link">Directorio</button>
                <button onClick={openClientModal} className="btn btn-primary">
                  Participar Gratis
                </button>
            </div>

            {/* Mobile Toggle Button */}
            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <XIcon /> : <MenuIcon />}
            </button>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      {mobileMenuOpen && (
          <div className="mobile-menu-overlay open">
              <div className="mobile-menu-content">
                  <button onClick={() => { setIsLedgerOpen(true); setMobileMenuOpen(false); }} className="mobile-menu-link">
                      <ListIcon /> Lista Oficial de Inscritos
                  </button>
                  <button onClick={() => scrollToSection('gallery')} className="mobile-menu-link">
                      <GiftIcon /> Ver Premios
                  </button>
                  <button onClick={openDirectory} className="mobile-menu-link">
                      <BookIcon /> Directorio Completo
                  </button>
                  <div style={{height: '20px'}}></div>
                  <button onClick={openClientModal} className="btn btn-giant" style={{width: '100%', fontSize: '1.2rem', padding: '16px'}}>
                      ¡Participar Gratis!
                  </button>
              </div>
          </div>
      )}

      {/* Hero */}
      <section className="hero-section">
        <ConfettiBackground />
        <div className="container">
          <div className="hero-grid">
            <div className="hero-text">
                <div style={{display: 'inline-block', marginBottom: '24px'}}>
                    <span className="power-statement">
                        <StarFilledIcon size={14} /> ¡La Fiesta del Emprendimiento!
                    </span>
                </div>
                <h1 className="hero-title">
                  ¡GANA PREMIOS <span className="word-highlight-animated">GRATIS</span> <br/> <span className="text-gradient">PARA TU NEGOCIO!</span>
                </h1>
                
                <div className="hero-subtitle-container">
                    <span className="hero-lead highlight">Un evento único donde la comunidad premia a la comunidad.</span>
                    <span className="hero-lead text-dark">
                        Únete GRATIS y gana premios de nuestros emprendedores.
                    </span>
                </div>

                <div className="hero-buttons">
                    <button onClick={openClientModal} className="btn btn-giant">
                        <GiftIcon /> QUIERO MI PREMIO
                    </button>
                </div>

                <div className="hero-im-badge mt-medium floating delay-1">
                    <span className="im-logo-small">iM</span>
                    <span>Iniciativa de <strong>InfoMercado Tribu</strong></span>
                </div>
            </div>
            
            <div className="hero-visual">
               <div className="stat-card floating">
                  <span className="stat-value">{entries.length}</span>
                  <span className="stat-label">Premios Disponibles</span>
               </div>
               <div className="stat-card floating delay-1">
                  <span className="stat-value">S/ {entries.reduce((acc, curr) => acc + (parseFloat(curr.value.replace(/[^0-9.]/g, '')) || 0), 0).toFixed(0)}</span>
                  <span className="stat-label">En Premios</span>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prize Grid Section */}
      <section id="gallery" className="prize-marquee-section">
        <div className="container">
            <div className="section-head text-center mb-medium">
                <h2 className="section-title">🎁 Premios Confirmados</h2>
                <p className="section-desc">Regalos increíbles de la comunidad para la comunidad.</p>
            </div>
        
            {isLoading ? (
                <div className="empty-box text-center">
                    <div className="spinner-large" style={{margin: '0 auto 20px'}}><LoaderIcon /></div>
                    <p>Cargando premios...</p>
                </div>
            ) : entries.length > 0 ? (
                <div className="prize-static-grid">
                    {entries.slice(0, showAllGallery ? undefined : 6).map((entry) => (
                         <div key={entry.id} className="artwork-card">
                            <div className="image-wrapper">
                                <img src={entry.prizeImage} alt={entry.prize} />
                                <span className="category-badge-overlay">{entry.category}</span>
                                {entry.isFeatured && <div className="featured-badge"><StarFilledIcon size={12} /> Destacado</div>}
                            </div>
                            <div className="artwork-info">
                                <div className="artwork-header">
                                  <h4>{entry.name}</h4>
                                </div>
                                <p className="artwork-prize">{entry.prize}</p>
                                <span className="price-sticker">{entry.value}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-box text-center">
                    <div className="icon-placeholder"><ImageIcon /></div>
                    <h3>Aún no hay premios cargados</h3>
                    <p>¡Avísale a tu emprendedor favorito para que se sume!</p>
                </div>
            )}
            
            {entries.length > 6 && (
                <div className="w-full text-center mt-medium">
                    <button 
                        onClick={() => setShowAllGallery(!showAllGallery)} 
                        className="btn btn-outline"
                        style={{ borderRadius: 'var(--radius-full)', padding: '12px 32px' }}
                    >
                        {showAllGallery ? (
                            <>Ver menos premios <span style={{marginLeft: '8px', display: 'inline-block', transform: 'rotate(180deg)'}}>▼</span></>
                        ) : (
                            <>Ver más premios <span style={{marginLeft: '8px'}}>▼</span></>
                        )}
                    </button>
                </div>
            )}
        </div>
    </section>

      {/* Directory Teaser Section - UPDATED CLOUD LAYOUT (ALL LOGOS) */}
      <section id="directory" className="aliados-section" ref={directoryRef}>
        <div className="container">
             <div className="aliados-container">
                 {/* Left Text */}
                 <div className="aliados-text animate-on-scroll">
                    <div className="badge-pink">
                        ● COMUNIDAD VERIFICADA
                    </div>
                    <h2 className="aliados-title">
                        <span style={{color: '#8e44ad'}}>NUESTROS</span> <span style={{color: '#f39c12'}}>ALIADOS</span>
                    </h2>
                    <p className="aliados-desc">
                        Conoce a los emprendedores que hacen posible este evento. 
                        <strong> Compra local</strong>, apoya a la tribu.
                    </p>
                    <button onClick={openDirectory} className="btn-aliados-cta">
                        <BookIcon /> Ver Directorio Completo
                    </button>
                 </div>
                 
                 {/* Right Grid (Cloud Layout) */}
                 <div className="aliados-grid-wrapper animate-on-scroll">
                     <div className="aliados-grid">
                        {entries.length > 0 ? (
                             entries.map((entry, index) => (
                                <div 
                                    key={entry.id} 
                                    className="aliado-logo-card floating" 
                                    style={{
                                        animationDelay: `${(index % 5) * 0.5}s`, // Improved random feel
                                        animationDuration: `${4 + (index % 4)}s` // Varied speed
                                    }}
                                    title={entry.name}
                                >
                                    <img src={entry.logoImage || entry.prizeImage} alt={entry.name} />
                                </div>
                             ))
                        ) : (
                            [...Array(6)].map((_, i) => (
                                <div key={i} className="aliado-logo-card floating"><img src={`https://via.placeholder.com/100?text=${i+1}`} alt="placeholder" /></div>
                            ))
                        )}
                     </div>
                 </div>
             </div>
        </div>
      </section>

      {/* NEW GRADIENT FOOTER WITH TRANSPARENCY LIST BUTTON */}
      <footer className="footer-bar-gradient" style={{display: 'flex', flexDirection: 'column'}}>
        <div className="footer-bar-content">
            <div className="footer-im-logo">iM</div>
            <div className="footer-text-main" onDoubleClick={handleSecretClick} onClick={handleSecretClick} style={{cursor: 'pointer'}}>
                Iniciativa de la comunidad de <strong>INFOMERCADO TRIBU</strong>
            </div>
            
            <div style={{display: 'flex', gap: '12px'}}>
                <button onClick={() => setIsLedgerOpen(true)} className="footer-btn-know-more" style={{background: 'rgba(0,0,0,0.2)'}}>
                    <ListIcon /> Lista Oficial
                </button>
                <a href="https://infomercado.pe/tribu/" target="_blank" rel="noopener noreferrer" className="footer-btn-know-more">
                    Conocer más <ArrowRightIcon />
                </a>
            </div>
        </div>
        <div style={{textAlign: 'center', padding: '10px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)'}}>
             ✨ Hecho con mucho corazón de <a href="https://gaorsystem.vercel.app/" target="_blank" rel="noopener noreferrer" style={{color: 'white', fontWeight: 'bold'}}>Mago26</a> ✨
        </div>
      </footer>

      {/* PROMO POPUP FLYER - DOWNLOADABLE & REDESIGNED FOR HIGH CONVERSION */}
      {isPromoOpen && (
          <div className="promo-overlay">
              <div className="promo-card-wrapper" style={{maxWidth: '450px', width: '100%', position: 'relative'}}>
                  
                  {/* CLOSE BUTTON */}
                  <button className="promo-close-btn-floating" onClick={closePromo}><XIcon /></button>

                  {/* CAPTURABLE AREA */}
                  <div 
                    ref={flyerRef} 
                    className="promo-card-story"
                  >
                      {/* Decorative Circles */}
                      <div style={{position: 'absolute', top: '-10%', left: '-10%', width: '150px', height: '150px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%'}}></div>
                      <div style={{position: 'absolute', bottom: '10%', right: '-5%', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%'}}></div>
                      <ConfettiBackground />

                      <div style={{position: 'relative', zIndex: 10, width: '100%'}}>
                          {/* PILL HEADER */}
                          <div className="promo-header-pill">
                              🔥 TIEMPO LIMITADO
                          </div>

                          {/* MAIN TITLE */}
                          <div className="text-center">
                              <h2 className="promo-main-title" style={{color: 'white', opacity: 0.95}}>¡RECLAMA TU</h2>
                              <span className="promo-highlight-text">REGALO!</span>
                              <h3 className="promo-sub-title">PARA TU NEGOCIO</h3>
                          </div>

                          {/* PRIZE BOX - STICKER STYLE */}
                          <div className="promo-prize-container">
                              <div className="promo-badge-float">¡GRATIS!</div>
                              <div className="promo-stat-label">HAY MÁS DE</div>
                              <div className="promo-stat-big">{entries.length || '33'}</div>
                              <div className="promo-stat-label" style={{color: '#e1306c', fontWeight: 900, fontSize: '1rem'}}>PREMIOS DISPONIBLES</div>
                          </div>

                          {/* FOOTER BADGE */}
                          <div className="promo-footer-badge">
                              <div className="promo-badge-icon">iM</div>
                              <span>Avalado por <strong>InfoMercado Tribu</strong></span>
                          </div>
                      </div>
                  </div>

                  {/* ACTION BUTTONS (Outside capture area) */}
                  <div style={{marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '12px'}}>
                      <button 
                        onClick={() => { closePromo(); openClientModal(); }} 
                        className="btn-promo-action" 
                      >
                          ¡QUIERO MI TICKET YA! 🎟️
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* PUBLIC LEDGER MODAL */}
      {isLedgerOpen && <PublicLedgerModal onClose={() => setIsLedgerOpen(false)} />}

      {/* CLIENT REGISTRATION MODAL */}
      {isClientModalOpen && (
          <ClientRegistrationModal 
            onClose={closeClientModal} 
            onGoToDirectory={() => {
                closeClientModal();
                openDirectory();
            }}
          />
      )}

      {/* DIRECTORY OVERLAY */}
      {isDirectoryOpen && (
          <div className="directory-full-overlay">
              <button className="close-directory-absolute" onClick={closeDirectory}><XIcon /></button>
              
              <div className="directory-split-container">
                  {/* LEFT SIDEBAR (Sticky) */}
                  <div className="directory-sidebar animate-slide-in">
                      <div className="sidebar-header-group">
                          <div className="badge-pulse">
                              <span className="pulse-dot"></span>
                              <span>Directorio en Vivo</span>
                          </div>
                          <h2 className="text-gradient">Directorio de la Tribu</h2>
                          <p className="text-gray">{filteredEntries.length} Marcas aliadas</p>
                      </div>

                      <div className="search-bar-modern mt-medium">
                          <SearchIcon />
                          <input 
                              type="text" 
                              placeholder="Buscar marcas..." 
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              autoFocus
                          />
                      </div>

                      <div className="filters-vertical mt-medium">
                          <span className="filter-label">Categorías</span>
                          <div className="filter-chips-wrap">
                            {filterCategories.map(cat => (
                                <button 
                                    key={cat}
                                    className={`filter-chip ${selectedCategoryFilter === cat ? 'active' : ''}`}
                                    onClick={() => setSelectedCategoryFilter(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                          </div>
                      </div>

                      <div className="sidebar-footer mt-auto">
                          <div className="share-actions-column">
                              <button onClick={handleCopyLink} className="btn btn-outline btn-block btn-with-icon">
                                  <ShareIcon /> Copiar Enlace
                              </button>
                              <button onClick={handleShareWhatsAppList} className="btn btn-primary btn-block btn-with-icon">
                                  <WhatsAppIcon /> Compartir en WhatsApp
                              </button>
                          </div>
                      </div>
                  </div>

                  {/* RIGHT CONTENT (Scrollable Grid) */}
                  <div className="directory-main-content">
                    {isLoading ? (
                        <div className="text-center p-40">Cargando directorio...</div>
                    ) : (
                        <div className="bio-grid">
                            {filteredEntries.map((entry, index) => (
                                <div 
                                    key={entry.id} 
                                    className="bio-card animate-fade-up"
                                    style={{animationDelay: `${index * 0.05}s`}} 
                                >
                                    <div className="bio-header">
                                        <img src={entry.logoImage || entry.prizeImage} alt={entry.name} className="bio-avatar" />
                                        <div>
                                            <h3>{entry.name}</h3>
                                            <span className="category-tag"><TagIcon /> {entry.category}</span>
                                        </div>
                                    </div>
                                    <div className="bio-content">
                                        <p>{entry.description}</p>
                                    </div>
                                    
                                    <div className="bio-footer-socials">
                                         {entry.instagram && (
                                             <button className="social-icon-btn insta" onClick={() => window.open(`https://instagram.com/${entry.instagram.replace('@','')}`, '_blank')} title="Instagram">
                                                 <InstagramIcon />
                                             </button>
                                         )}
                                         {entry.facebook && (
                                             <button className="social-icon-btn fb" onClick={() => window.open(entry.facebook, '_blank')} title="Facebook">
                                                 <FacebookIcon />
                                             </button>
                                         )}
                                         {entry.tiktok && (
                                             <button className="social-icon-btn tiktok" onClick={() => window.open(entry.tiktok, '_blank')} title="TikTok">
                                                 <TikTokIcon />
                                             </button>
                                         )}
                                         {entry.website && (
                                             <button className="social-icon-btn web" onClick={() => window.open(entry.website, '_blank')} title="Sitio Web">
                                                 <GlobeIcon />
                                             </button>
                                         )}
                                    </div>
                                    
                                    <div className="action-buttons-row">
                                        <button className="btn-block action-btn whatsapp" onClick={() => window.open(getWhatsAppLink(entry.phone), '_blank')}>
                                            <WhatsAppIcon /> Contactar
                                        </button>
                                        <button 
                                            className="btn-icon-action" 
                                            onClick={() => window.open(`/?card=${entry.id}`, '_blank')}
                                            title="Ver Tarjeta Digital"
                                        >
                                            <QrIcon />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {filteredEntries.length === 0 && (
                                <div className="no-results">
                                    <p>No se encontraron resultados para "{searchTerm}"</p>
                                    <button className="btn btn-link" onClick={() => { setSearchTerm(''); setSelectedCategoryFilter('Todas'); }}>
                                        Ver todos
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  try {
      const root = createRoot(rootElement);
      root.render(
          <ErrorBoundary>
              <App />
          </ErrorBoundary>
      );
  } catch (err) {
      console.error("Critical Render Error:", err);
      // Fallback manual render if React fails hard
      rootElement.innerHTML = '<div style="padding:20px;text-align:center"><h1>Error Crítico</h1><p>La aplicación no pudo iniciar. Revisa la consola.</p></div>';
  }
}