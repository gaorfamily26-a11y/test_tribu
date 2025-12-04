import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';

// --- SUPABASE CONFIGURATION ---
const SUPABASE_URL = 'https://epyqaqxlgqcxbenaydct.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVweXFhcXhsZ3FjeGJlbmF5ZGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NzAyOTIsImV4cCI6MjA4MDM0NjI5Mn0.4FKPSM-UfQlfrKQoXRnBps9RLCX2MT8HkqcQlEHgc5Q';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

const ImageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
);

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);

const TikTokIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
);

const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path></svg>
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
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8-11-8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
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

const SECRET_ACCESS_CODE = "TRIBU2024";
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

    const handleShareCard = async () => {
        if (!data) return;
        const url = window.location.href;
        
        const shareData = {
            title: `Tarjeta Digital - ${data.name}`,
            text: `¡Hola! Te comparto mi tarjeta digital de La Tribu Emprendedores.\nNegocio: ${data.name}\nRubro: ${data.category}`,
            url: url
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(url);
            alert('¡Enlace de tarjeta copiado al portapapeles!');
        }
    };

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
                        <button onClick={handleShareCard} className="dc-btn share-card-btn" style={{background: '#6c5ce7', color: 'white'}}>
                            <ShareIcon /> Compartir Tarjeta
                        </button>

                        <a href={`https://wa.me/51${data.phone}`} target="_blank" className="dc-btn whatsapp">
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
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [viewEntry, setViewEntry] = useState<Entrepreneur | null>(null);
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [editingEnrolled, setEditingEnrolled] = useState<Entrepreneur | null>(null);
    const [activeTab, setActiveTab] = useState<'enrolled' | 'pending'>('enrolled');

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

    const handleUpdateMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMember) return;
        try {
            const { error } = await supabase.from('members').update({
                    name: editingMember.name, business_name: editingMember.business_name, phone: editingMember.phone.replace(/\D/g, '')
                }).eq('id', editingMember.id);
            if (error) throw error;
            setMembers(members.map(m => m.id === editingMember.id ? editingMember : m));
            setEditingMember(null);
        } catch (err: any) { alert('Error al actualizar'); }
    };

    const handleUpdateEnrolled = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingEnrolled) return;
        try {
             const { error } = await supabase.from('entrepreneurs').update({
                    business_name: editingEnrolled.name, owner_name: editingEnrolled.ownerName,
                    phone: editingEnrolled.phone, prize: editingEnrolled.prize, prize_value: editingEnrolled.value,
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
                    <div className="kpi-card"><h3>Pendientes</h3><div className="kpi-value" style={{color: '#ff9f43'}}>{pendingMembers.length}</div></div>
                </div>
                <div className="admin-tabs">
                    <button className={`tab-btn ${activeTab === 'enrolled' ? 'active' : ''}`} onClick={() => setActiveTab('enrolled')}>Inscritos ({entries.length})</button>
                    <button className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>Pendientes ({pendingMembers.length})</button>
                </div>
                <div className="table-container">
                    {activeTab === 'enrolled' ? (
                        <table className="data-table">
                            <thead><tr><th>Negocio</th><th>Dueño</th><th>Contacto</th><th>Premio</th><th>Valor (S/)</th><th>Rubro</th><th>Acciones</th></tr></thead>
                            <tbody>{entries.map(entry => (
                                <tr key={entry.id} className={entry.isFeatured ? 'featured-row' : ''}>
                                    <td><div className="cell-flex"><img src={entry.logoImage} className="table-img" alt=""/><strong>{entry.name}</strong>{entry.isFeatured && <StarFilledIcon size={14} />}</div></td>
                                    <td>{entry.ownerName}</td>
                                    <td><a href={`https://wa.me/51${entry.phone}`} target="_blank" className="table-link">{entry.phone}</a></td>
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
                    ) : (
                        <table className="data-table">
                            <thead><tr><th>Nombre</th><th>Negocio</th><th>Celular</th><th>Estado</th><th>Acción</th></tr></thead>
                            <tbody>{pendingMembers.map(member => (
                                <tr key={member.id}><td>{member.name}</td><td>{member.business_name}</td><td>{member.phone}</td>
                                    <td><span className="badge-cat" style={{background: '#ffeaa7', color: '#d35400'}}>Pendiente</span></td>
                                    <td><div className="action-buttons-row">
                                        <button onClick={() => setEditingMember(member)} className="btn-icon-action text-blue"><EditIcon /></button>
                                        <button onClick={() => handleDeleteMember(member.id)} className="btn-icon-action text-red"><TrashIcon /></button>
                                        <a href={`https://wa.me/51${member.phone}`} target="_blank" className="btn-whatsapp-small"><WhatsAppIcon /></a>
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
                            <div className="form-group"><label>Celular</label><input type="tel" value={editingMember.phone} onChange={(e) => setEditingMember({...editingMember, phone: e.target.value})} required /></div>
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

// ... [PreRegisterForm kept same]
function PreRegisterForm({ onBack }: { onBack: () => void }) {
    const [wizardStep, setWizardStep] = useState<'lock' | 'member' | 'business' | 'success'>('lock');
    const [accessCode, setAccessCode] = useState('');
    
    // Member Data (Step 1)
    const [memberName, setMemberName] = useState('');
    const [memberBusiness, setMemberBusiness] = useState('');
    const [memberPhone, setMemberPhone] = useState('');

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

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        if (accessCode.trim().toUpperCase() === SECRET_ACCESS_CODE) {
            setWizardStep('member');
        } else {
            alert('Código incorrecto.');
        }
    };

    const handleMemberSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMsg('');
        
        try {
            const cleanPhone = memberPhone.replace(/\D/g, '');
            if (cleanPhone.length < 9) throw new Error("El teléfono debe tener al menos 9 dígitos");
            
            // Upsert member
            const { error } = await supabase.from('members').upsert([{ 
                phone: cleanPhone, name: memberName, business_name: memberBusiness 
            }], { onConflict: 'phone' });
            
            if (error) throw error;
            
            setMemberPhone(cleanPhone);
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

            const { error } = await supabase.from('entrepreneurs').insert([{
                business_name: memberBusiness, owner_name: memberName, phone: memberPhone,
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

    // LOCK SCREEN
    if (wizardStep === 'lock') {
        return (
            <div className="container" style={{paddingTop: '120px', minHeight: '80vh', display: 'flex', justifyContent: 'center'}}>
                <div className="card p-40" style={{maxWidth: '400px', width: '100%', textAlign: 'center'}}>
                    <div style={{color: '#e1306c', marginBottom: '20px'}}><LockIcon /></div>
                    <h2 style={{marginBottom: '10px'}}>Acceso Restringido</h2>
                    <p className="text-gray mb-medium">Esta zona es exclusiva para miembros del grupo.</p>
                    <form onSubmit={handleUnlock}>
                        <input type="password" className="lock-input" placeholder="Clave del grupo" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} autoFocus />
                        <button className="btn btn-dark btn-block mt-small">Desbloquear</button>
                    </form>
                    <button onClick={onBack} className="btn-link mt-medium">Volver al Inicio</button>
                </div>
            </div>
        );
    }

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
        <div className="container" style={{paddingTop: '100px', minHeight: '100vh', paddingBottom: '50px', maxWidth: '800px'}}>
             <div className="card p-40">
                 <div className="text-center mb-medium">
                    <div className="badge-secure"><LockIcon /> Zona Tribu</div>
                    <h2>Alta de Emprendedor</h2>
                    <p className="text-gray">Completa los pasos para unirte al sorteo.</p>
                 </div>
                 
                 {/* WIZARD STEPS INDICATOR */}
                 <div className="steps-visual" style={{marginBottom: '40px'}}>
                    <div className="step-item">
                        <div className="step-num" style={{background: wizardStep === 'member' ? '#2d3436' : '#00b894'}}>1</div>
                        <p>Datos Básicos</p>
                    </div>
                    <div className="step-line" style={{background: wizardStep === 'business' ? '#00b894' : '#dfe6e9'}}></div>
                    <div className="step-item">
                         <div className="step-num" style={{background: wizardStep === 'business' ? '#2d3436' : '#dfe6e9'}}>2</div>
                        <p>Ficha de Negocio</p>
                    </div>
                </div>

                 {wizardStep === 'member' && (
                     <form onSubmit={handleMemberSubmit} className="clean-form">
                         <div className="form-group"><label>Tu Nombre Completo</label><input type="text" value={memberName} onChange={e => setMemberName(e.target.value)} required placeholder="Ej. Juan Pérez" /></div>
                         <div className="form-group"><label>Nombre de tu Negocio</label><input type="text" value={memberBusiness} onChange={e => setMemberBusiness(e.target.value)} required placeholder="Ej. Mi Tienda SAC" /></div>
                         <div className="form-group"><label>Número de Celular</label>
                             <div className="input-with-icon"><span className="input-icon"><PhoneIcon /></span><input type="tel" value={memberPhone} onChange={e => setMemberPhone(e.target.value)} required placeholder="Ej. 999123456" /></div>
                         </div>
                         {status === 'error' && <p className="error-text mb-medium">{errorMsg}</p>}
                         <button className="btn btn-primary btn-block btn-large" disabled={status === 'loading'}>
                             {status === 'loading' ? 'Guardando...' : 'Continuar al Paso 2'}
                         </button>
                     </form>
                 )}

                 {wizardStep === 'business' && (
                     <form onSubmit={handleBusinessSubmit} className="clean-form">
                        <div className="form-row">
                            <div className="form-group" style={{flex: 1}}>
                                <label>Logo (1:1)</label>
                                <label className="mini-upload">
                                    {logoPreview ? <img src={logoPreview} className="mini-preview" /> : <div className="mini-placeholder"><ImageIcon /> Subir</div>}
                                    <input type="file" ref={logoInputRef} onChange={(e) => handleImageChange(e, 'logo')} className="hidden" accept="image/*"/>
                                </label>
                            </div>
                            <div style={{flex: 2}}>
                                <div className="form-group"><label>Rubro</label>
                                    <select value={category} onChange={(e) => { setCategory(e.target.value); if(e.target.value !== 'Otro') setCustomCategory(''); }} className="form-select">
                                        {PREDEFINED_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    {category === 'Otro' && <input type="text" className="input-custom-category" placeholder="Especifica..." value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} required />}
                                </div>
                            </div>
                        </div>

                        <div className="form-group"><label>Redes Sociales</label>
                            <div className="social-grid">
                                <input type="text" placeholder="Instagram (Ej. @mi_marca)" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
                                <input type="text" placeholder="Facebook Link" value={facebook} onChange={(e) => setFacebook(e.target.value)} />
                                <input type="text" placeholder="TikTok Link" value={tiktok} onChange={(e) => setTiktok(e.target.value)} />
                                <input type="text" placeholder="Web" value={website} onChange={(e) => setWebsite(e.target.value)} />
                            </div>
                        </div>
                        <div className="form-group"><label>Reseña Corta</label><textarea rows={2} placeholder="¿Qué hace tu negocio?" value={description} onChange={(e) => setDescription(e.target.value)} className="form-textarea" required /></div>

                        <div className="form-section-label mt-medium"><span className="section-num">2</span><h3>El Premio</h3></div>
                        <div className="form-row">
                            <div className="form-group" style={{flex: 2}}><label>Premio a aportar</label><input type="text" value={prize} onChange={(e) => setPrize(e.target.value)} required placeholder="Ej. Pack de productos" /></div>
                            <div className="form-group" style={{flex: 1}}><label>Valor (S/)</label><input type="text" value={value} onChange={(e) => setValue(e.target.value)} required placeholder="Ej. 50.00" /></div>
                        </div>
                        <div className="form-group">
                            <label>Foto del Premio</label>
                            <label className="upload-area">
                                {prizePreview ? <div className="preview-container"><img src={prizePreview} /></div> : <div className="upload-placeholder"><ImageIcon /><span>Subir Foto del Premio</span></div>}
                                <input type="file" accept="image/*" ref={prizeInputRef} onChange={(e) => handleImageChange(e, 'prize')} className="hidden" />
                            </label>
                        </div>
                        <div className="terms-checkbox">
                            <label><input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} /><span>Me comprometo a entregar el premio.</span></label>
                        </div>
                        {status === 'error' && <p className="error-text mb-medium">{errorMsg}</p>}
                        <button type="submit" className="btn btn-primary btn-block btn-large" disabled={status === 'loading'}>
                             {status === 'loading' ? <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}><LoaderIcon /> Publicando...</span> : 'Finalizar Inscripción'}
                        </button>
                     </form>
                 )}
             </div>
        </div>
    );
}

// ... [ClientRegistrationModal kept same]
function ClientRegistrationModal({ onClose }: { onClose: () => void }) {
    const [step, setStep] = useState<'form' | 'mission' | 'ticket'>('form');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [ticketCode, setTicketCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [randomBrands, setRandomBrands] = useState<Entrepreneur[]>([]);

    const fetchRandomBrands = async () => {
        // Fetch 3 random brands to follow
        const { data } = await supabase.from('entrepreneurs').select('*').limit(3);
        if (data) {
            // Need to map structure
             const mapped: Entrepreneur[] = data.map(item => ({
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
                  description: item.description,
                  category: item.category
              }));
             setRandomBrands(mapped);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate check
        setTimeout(() => {
            setIsLoading(false);
            fetchRandomBrands();
            setStep('mission');
        }, 800);
    };

    const handleGenerateTicket = async () => {
        setIsLoading(true);
        try {
            const code = `#TRIBU-${Math.floor(1000 + Math.random() * 9000)}`;
            
            const { error } = await supabase.from('clients').insert([{
                name: name,
                phone: phone,
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

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{maxWidth: '450px'}}>
                <button className="close-btn" onClick={onClose}><XIcon /></button>
                
                {step === 'form' && (
                    <div className="text-center">
                        <div className="modal-header">
                            <h2>¡Participa Gratis!</h2>
                            <p>Llena tus datos para generar tu ticket del sorteo.</p>
                        </div>
                        <form onSubmit={handleFormSubmit} className="clean-form">
                            <div className="form-group">
                                <label>Tu Nombre</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Ej. María García" />
                            </div>
                            <div className="form-group">
                                <label>Tu WhatsApp</label>
                                <div className="input-with-icon">
                                    <span className="input-icon"><WhatsAppIcon /></span>
                                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="999 123 456" />
                                </div>
                            </div>
                            <button className="btn btn-primary btn-block btn-large" disabled={isLoading}>
                                {isLoading ? 'Procesando...' : 'Continuar'}
                            </button>
                        </form>
                    </div>
                )}

                {step === 'mission' && (
                    <div className="text-center">
                        <div className="modal-header">
                            <h2>🎯 Misión Requerida</h2>
                            <p>Para activar tu ticket, sigue a estas marcas de la tribu.</p>
                        </div>
                        
                        <div className="mission-list">
                            {randomBrands.map((brand) => (
                                <div key={brand.id} className="mission-item">
                                    <img src={brand.logoImage} alt="logo" className="mission-img" />
                                    <div className="mission-info">
                                        <strong>{brand.name}</strong>
                                        <span>{brand.instagram}</span>
                                    </div>
                                    <button 
                                        className="btn-follow-small"
                                        onClick={() => window.open(`https://instagram.com/${brand.instagram.replace('@','')}`, '_blank')}
                                    >
                                        Seguir
                                    </button>
                                </div>
                            ))}
                            {randomBrands.length === 0 && <p>Cargando marcas...</p>}
                        </div>

                        <div className="terms-checkbox">
                            <label>
                                <input type="checkbox" required />
                                <span>Confirmo que he seguido a las cuentas para participar.</span>
                            </label>
                        </div>

                        <button onClick={handleGenerateTicket} className="btn btn-primary btn-block" disabled={isLoading}>
                            {isLoading ? 'Generando...' : '¡Listo! Generar Ticket'}
                        </button>
                    </div>
                )}

                {step === 'ticket' && (
                    <div className="text-center">
                        <div className="modal-header">
                            <h2>🎟️ ¡Ticket Generado!</h2>
                            <p>Ya estás participando en el sorteo.</p>
                        </div>
                        
                        <div className="virtual-ticket">
                            <div className="ticket-header">LA TRIBU SORTEO</div>
                            <div className="ticket-body">
                                <span className="ticket-label">Participante</span>
                                <span className="ticket-name">{name}</span>
                                <div className="ticket-divider"></div>
                                <span className="ticket-label">Código de Sorteo</span>
                                <span className="ticket-code">{ticketCode}</span>
                            </div>
                            <div className="ticket-footer">Guarda una captura de este ticket</div>
                        </div>

                        <button onClick={onClose} className="btn btn-outline btn-block mt-medium">
                            Volver a la Web
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function App() {
  // Navigation State
  const [viewMode, setViewMode] = useState<'landing' | 'preregister' | 'admin' | 'card'>('landing');
  const [cardId, setCardId] = useState<string>('');

  // App Data
  const [entries, setEntries] = useState<Entrepreneur[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [isClientModalOpen, setIsClientModalOpen] = useState(false); // Client Modal
  
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

  // Admin Backdoor
  const [secretClicks, setSecretClicks] = useState(0);

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

  const handleSecretClick = () => {
      setSecretClicks(prev => {
          const newCount = prev + 1;
          if (newCount >= 5) {
              setViewMode('preregister');
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
      document.body.style.overflow = 'hidden';
  }

  const closeClientModal = () => {
      setIsClientModalOpen(false);
      document.body.style.overflow = 'auto';
  }

  const openDirectory = () => {
      setIsDirectoryOpen(true);
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

  const closePromo = () => {
      setIsPromoOpen(false);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
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

  if (viewMode === 'card') {
      return <DigitalCardView entrepreneurId={cardId} onBack={() => { setViewMode('landing'); window.history.replaceState(null, '', '/'); }} />;
  }

  // RENDER MAIN LANDING PAGE
  return (
    <div className="app-container">
      {/* Navbar */}
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="nav-inner">
            <div className="brand" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                <div className="brand-icon"><GiftIcon /></div>
                <span>SorteoTribu</span>
            </div>
            <div className="nav-actions">
                <button onClick={() => scrollToSection('gallery')} className="nav-link">Premios</button>
                <button onClick={openDirectory} className="nav-link">Directorio</button>
                <button onClick={openClientModal} className="btn btn-primary">
                  Participar Gratis
                </button>
            </div>
        </div>
      </nav>

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

                {/* NEW: InfoMercado Badge in Hero */}
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

      {/* Prize Grid Section (Static) */}
      <section id="gallery" className="prize-marquee-section">
        <div className="container">
            <div className="section-head">
                <h2 className="section-title">Premios Confirmados</h2>
                <p className="section-desc">Todo esto te puedes llevar solo por registrarte.</p>
            </div>
        
            {isLoading ? (
                <div className="empty-box text-center">
                    <div className="spinner-large" style={{margin: '0 auto 20px'}}><LoaderIcon /></div>
                    <p>Cargando premios...</p>
                </div>
            ) : entries.length > 0 ? (
                <div className="prize-static-grid">
                    {entries.slice(0, showAllGallery ? undefined : 6).map((entry) => (
                         <div key={entry.id} className="prize-grid-item">
                            <div className="artwork-card">
                                <div className="image-wrapper">
                                    <img src={entry.prizeImage} alt={entry.prize} />
                                    <span className="category-badge-overlay">{entry.category}</span>
                                    {entry.isFeatured && <div className="featured-badge"><StarFilledIcon size={12} /> Destacado</div>}
                                </div>
                                <div className="artwork-info">
                                    <div className="artwork-header">
                                      <h4>{entry.name}</h4>
                                      <span className="price-badge">{entry.value}</span>
                                    </div>
                                    <p className="artwork-prize">{entry.prize}</p>
                                </div>
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

      {/* Slim InfoMercado Strip (Kept as well for reinforcement) */}
      <section className="infomercado-strip">
        <div className="container">
            <div className="im-strip-content">
                <div className="im-logo-white">iM</div>
                <div className="im-text-white">
                    <span>Iniciativa de la comunidad de <strong>InfoMercado Tribu</strong></span>
                    <a href="https://infomercado.pe/tribu/" target="_blank" className="im-link-white">
                        Conocer más <ArrowRightIcon/>
                    </a>
                </div>
            </div>
        </div>
      </section>

      {/* Directory Teaser Section (UPDATED to ANIMATED MARQUEE with NEW EFFECTS) */}
      <section id="directory" className="directory-section-animated" ref={directoryRef}>
        <div className="container">
             <div className="directory-teaser-modern">
                 <div className={`dt-content sticky-col ${isDirVisible ? 'is-visible' : ''} animate-on-scroll`}>
                    <div className="badge-pulse">
                        <span className="pulse-dot"></span>
                        <span>Comunidad Verificada</span>
                    </div>
                    <h2 className="section-title text-gradient">Nuestros Aliados</h2>
                    <p className="section-desc" style={{marginBottom: '30px', textAlign: 'left'}}>
                        Conoce a los emprendedores que hacen posible este evento. 
                        <strong> Compra local</strong>, apoya a la tribu.
                    </p>
                    <button onClick={openDirectory} className="btn btn-primary btn-large btn-with-icon">
                        <BookIcon /> Ver Directorio Completo
                    </button>
                 </div>
                 
                 <div className="dt-visual-marquee">
                    <div className="marquee-track">
                        {/* Row 1 */}
                        {entries.length > 0 ? (
                            [...entries, ...entries].map((entry, index) => (
                                <div key={`r1-${entry.id}-${index}`} className="marquee-item" title={entry.name}>
                                    <img src={entry.logoImage || entry.prizeImage} alt={entry.name} />
                                </div>
                            ))
                        ) : (
                            [...Array(10)].map((_, i) => (
                                <div key={i} className="marquee-item"><img src={`https://via.placeholder.com/100?text=${i+1}`} alt="placeholder" /></div>
                            ))
                        )}
                    </div>
                    {/* Add extra rows for "Wall" feel to allow sticky scroll effect */}
                    <div className="marquee-track" style={{animationDirection: 'reverse', animationDuration: '45s'}}>
                         {entries.length > 0 ? (
                            [...entries, ...entries].map((entry, index) => (
                                <div key={`r2-${entry.id}-${index}`} className="marquee-item" title={entry.name}>
                                    <img src={entry.logoImage || entry.prizeImage} alt={entry.name} />
                                </div>
                            ))
                        ) : (
                            [...Array(10)].map((_, i) => (
                                <div key={i} className="marquee-item"><img src={`https://via.placeholder.com/100?text=${i+1}`} alt="placeholder" /></div>
                            ))
                        )}
                    </div>
                    <div className="marquee-track" style={{animationDuration: '50s'}}>
                         {entries.length > 0 ? (
                            [...entries, ...entries].map((entry, index) => (
                                <div key={`r3-${entry.id}-${index}`} className="marquee-item" title={entry.name}>
                                    <img src={entry.logoImage || entry.prizeImage} alt={entry.name} />
                                </div>
                            ))
                        ) : (
                            [...Array(10)].map((_, i) => (
                                <div key={i} className="marquee-item"><img src={`https://via.placeholder.com/100?text=${i+1}`} alt="placeholder" /></div>
                            ))
                        )}
                    </div>
                 </div>
             </div>
        </div>
      </section>

      <footer className="footer-minimal">
        <div className="container">
            <div className="footer-row">
                <div className="brand">
                    <span>SorteoTribu</span>
                </div>
                <div className="organizer-info">
                    <span>Iniciativa de la comunidad de</span>
                    <a href="https://infomercado.pe/tribu/" target="_blank" rel="noopener noreferrer">
                        InfoMercado Tribu
                    </a>
                </div>
            </div>
            <div className="footer-copyright" onDoubleClick={handleSecretClick} onClick={handleSecretClick} style={{userSelect: 'none', cursor: 'pointer'}}>
                <p>© {new Date().getFullYear()} Juntos somos más fuertes.</p>
            </div>
        </div>
      </footer>

      {/* PROMO POPUP FLYER */}
      {isPromoOpen && (
          <div className="promo-overlay">
              <div className="promo-card">
                  <button className="promo-close" onClick={closePromo}><XIcon /></button>
                  <div className="promo-header-curve"></div>
                  <div className="promo-content">
                      <div className="promo-icon-floating promo-icon-animate">
                          <StarFilledIcon size={40} color="#ff9f43" />
                      </div>
                      <h2>¡Gana Premios Gratis!</h2>
                      <div className="promo-stats">
                          <div className="promo-stat-item">
                              <span className="val">{entries.length > 0 ? entries.length : '10+'}</span>
                              <span className="lbl">Premios</span>
                          </div>
                          <div className="promo-separator"></div>
                          <div className="promo-stat-item">
                              <span className="val">Gratis</span>
                              <span className="lbl">Sorteo</span>
                          </div>
                      </div>
                      <p className="promo-text">Regístrate ahora y participa por los premios de nuestros emprendedores aliados.</p>
                      <div className="promo-actions">
                          <button onClick={() => { closePromo(); openClientModal(); }} className="btn btn-large btn-block btn-sunset">
                              ¡Quiero mi Ticket!
                          </button>
                          <button onClick={() => { closePromo(); scrollToSection('gallery'); }} className="btn btn-link btn-block mt-small">
                              Ver los Premios
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* CLIENT REGISTRATION MODAL */}
      {isClientModalOpen && <ClientRegistrationModal onClose={closeClientModal} />}

      {/* FULL SCREEN DIRECTORY OVERLAY - SPLIT LAYOUT (IMPROVED) */}
      {isDirectoryOpen && (
          <div className="directory-full-overlay">
              <button className="close-directory-absolute" onClick={closeDirectory}>
                 <XIcon />
              </button>
              
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
                                        <button className="btn-block action-btn whatsapp" onClick={() => window.open(`https://wa.me/51${entry.phone}`, '_blank')}>
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
  createRoot(rootElement).render(<App />);
}