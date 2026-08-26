import { useNavigate } from 'react-router-dom'
import { useRef, useState, useEffect } from 'react'
import Navbar from '../../components/Navbar';
import Chatbot from '../../components/Chatbot';
import { useLang } from '../../context/LangContext';
// import HidayaVideo from "../../assets/hidayavideo.mp4";
import HidayaLogo from "../../assets/HidayaLogo.png";
import Students from "../../assets/study.png";
import {
  FaMapMarker,
  FaPhone,FaEnvelope ,
   FaPuzzlePiece, 
   FaStar,
   FaCloud, 
   FaCircle,
   FaSmile,
   FaSchool,
   FaChalkboardTeacher,
    FaUserGraduate,
   FaUserTie,
   FaUserFriends,
   FaCalendarAlt,
   FaChartLine,
   FaLaptop,
   FaGlobe,
   FaPencilAlt,
   FaFlask,
   FaCalculator,
   FaBook,
   FaTrophy,
   FaUsers,
   FaLock,
  }
from "react-icons/fa";
import './style.css'

const Manager  = '/Manager.JPG'
const Manager2 = '/manager 2.JPG'
const Owner    = '/Owner.JPG'

const roles = [
  { title: 'Teacher',   desc: 'Attendance, topics & results',          color: '#FF6B6B', bg: '#FFF0F0',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="16" r="10"/><path d="M12 56c0-11 9-20 20-20s20 9 20 20"/><path d="M44 28l8-4v10"/><path d="M44 38h8"/></svg>` },
  { title: 'Assistant', desc: 'Calendar & teacher monitoring',          color: '#6C63FF', bg: '#F0EEFF',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="10" y="14" width="44" height="40" rx="4"/><path d="M22 10v8M42 10v8M10 28h44"/><path d="M22 38h6M36 38h6M22 46h6"/></svg>` },
  { title: 'Manager',   desc: 'Students, staff & academic data',        color: '#00C48C', bg: '#E6FFF7',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="16" r="10"/><path d="M14 56c0-10 8-18 18-18s18 8 18 18"/><path d="M42 30l6 6-6 6M48 36H36"/></svg>` },
  { title: 'Owner',     desc: 'Full analytics & school overview',       color: '#FFB800', bg: '#FFFBE6',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="18" r="10"/><path d="M18 14h-4l-2 6h40l-2-6h-4"/><path d="M14 20l4 8h28l4-8"/><path d="M14 56c0-11 8-20 18-20s18 9 18 20"/></svg>` },
  { title: 'Parent',    desc: "View child's grades & performance",      color: '#FF6B9D', bg: '#FFF0F6',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="22" cy="16" r="8"/><circle cx="44" cy="20" r="6"/><path d="M6 52c0-9 7-16 16-16s16 7 16 16"/><path d="M44 30c6 0 12 5 12 12"/></svg>` },
]

const academics = [
  { color: '#FFB800', icon: <FaBook/>, title: 'አእምሮአዊ መዳበር',   desc: 'Quran, Hadith, Fiqh & Seerah', shape: 'circle' },
  { color: '#6C63FF', icon: <FaCalculator/>, title: 'አካላዊ መዳበር',       desc: 'Core numeracy & advanced maths', shape: 'triangle' },
  { color: '#00C48C', icon: <FaFlask/>, title: 'ማሂበራዊ መዳበር',          desc: 'Physics, Chemistry & Biology', shape: 'square' },
  { color: '#FF6B6B', icon: <FaPencilAlt/>, title: 'ስመታዊ መዳበር',   desc: 'Classical and modern Arabic', shape: 'circle' },
  { color: '#FF6B9D', icon: <FaGlobe/>, title: 'ሁለንተናዊ መዳበር',    desc: 'History, geography & civics', shape: 'triangle' },
  { color: '#0EA5E9', icon: <FaLaptop/>, title: 'አረበኛ ',  desc: 'Digital literacy & computing', shape: 'square' },
]

const services = [
  { color: '#FFB800', icon: <FaChalkboardTeacher/>, title: 'Teacher Management',   desc: 'Monitor attendance, topics & performance ratings in real time.' },
  { color: '#6C63FF', icon: <FaUserGraduate/>, title: 'Student Records',        desc: 'Manage profiles, grades, attendance & analytics per term.' },
  { color: '#00C48C', icon: <FaUserTie/>, title: 'Result Management',      desc: 'CA & final exam grading with automatic score calculation.' },
  { color: '#FF6B6B', icon: <FaUserFriends/>, title: 'Parent Portal',         desc: "Parents view child's grades, rank & attendance anytime." },
  { color: '#FF6B9D', icon: <FaCalendarAlt/>, title: 'Schedule & Calendar',    desc: 'Weekly timetable, teacher assignments & class scheduling.' },
  { color: '#0EA5E9', icon: <FaChartLine/>, title: 'Reports & Analytics',    desc: 'Comprehensive reports on school performance & rankings.' },
]

const announcements = [
  { date: 'Apr 14', title: 'Term 2 Examination Schedule Released',       tag: 'Academic',     color: '#6C63FF' },
  { date: 'Apr 10', title: 'Parent-Teacher Meeting — Friday April 20th', tag: 'Event',        color: '#FF6B6B' },
  { date: 'Apr 5',  title: 'New Attendance Policy Effective May 1st',    tag: 'Policy',       color: '#FFB800' },
  { date: 'Mar 28', title: 'Quran Recitation Competition — Results Out', tag: 'Achievement',  color: '#00C48C' },
]

const teamMembers = [
  { img: '/Owner.JPG',          name: 'Ustaz. Muhammed Jemil',  role: 'School Owner & Director', color: '#FFB800', quote: 'Building futures rooted in faith.' },
  { img: '/Manager.JPG',        name: 'Mr. Omer Shemelis',       role: 'Academic Manager',         color: '#6C63FF', quote: 'Excellence starts with strong leadership.' },
  { img: '/manager 2.JPG',      name: 'Ustazah Medina Sultan',   role: 'Operations Manager',       color: '#00C48C', quote: 'Every student deserves care.' },
  { img: '/nave smaller.png',   name: 'Mis. Eman Oumer',         role: 'Senior Teacher',           color: '#00C48C', quote: 'Operations create great learning.' },
  { img: '/Manager.JPG',        name: 'Mr. Abubeker Getachew',   role: 'Senior Assistant',         color: '#6C63FF', quote: 'Operations create great learning.' },
  { img: '/nave smaller.png',   name: 'Mis. Janu Hussie',        role: 'Senior Teacher',           color: '#FF6B6B', quote: 'Teaches to create great learning.' },
  { img: '/nave smaller.png',   name: 'Mis. meaza Yesuf',        role: 'Senior Teacher',           color: '#FF6B6B', quote: 'Teaches to create great learning.' },
  { img: '/nave smaller.png',   name: 'Mis. Nejat Muhammed',     role: 'Senior Teacher',           color: '#FF6B6B', quote: 'Teaches to create great learning.' },
  { img: '/nave smaller.png',   name: 'Mis. Neima Nuru',         role: 'Senior Teacher',           color: '#FF6B6B', quote: 'Teaches to create great learning.' },
  { img: '/nave smaller.png',   name: 'Mis. Firdos Seid',        role: 'Senior Teacher',           color: '#FF6B6B', quote: 'Teaches to create great learning.' },
  { img: '/nave smaller.png',   name: 'Mis. Elihima Indres',     role: 'Senior Teacher',           color: '#FF6B6B', quote: 'Teaches to create great learning.' },
  { img: '/nave smaller.png',   name: 'Mis. hayat Muhammed',     role: 'Senior Teacher',           color: '#FF6B6B', quote: 'Teaches to create great learning.' },
  { img: '/nave smaller.png',   name: 'Mis. Semira eindew',      role: 'Senior Teacher',           color: '#FF6B6B', quote: 'Teaches to create great learning.' },
  { img: '/nave smaller.png',   name: 'Mis. medina Ebrahim',     role: 'Senior Teacher',           color: '#FF6B6B', quote: 'Teaches to create great learning.' },
  { img: '/nave smaller.png',   name: 'Mis. Emebet',             role: 'Senior Teacher',           color: '#FF6B6B', quote: 'Teaches to create great learning.' },
  { img: '/nave smaller.png',   name: 'Mis. Fetiha Mussa',       role: 'Senior Teacher',           color: '#FF6B6B', quote: 'Teaches to create great learning.' },
  { img: '/nave smaller.png',   name: 'Mr. FikreMariyam tegne',  role: 'Senior Teacher',           color: '#FF6B6B', quote: 'Teaches to create great learning.' },
  { img: '/nave smaller.png',   name: 'Mis. Fetiha Seid',        role: 'Senior Teacher',           color: '#FF6B6B', quote: 'Teaches to create great learning.' },
  { img: '/nave smaller.png',   name: 'Mis. Nuru Muhammed',      role: 'Senior Teacher',           color: '#FF6B6B', quote: 'Teaches to create great learning.' },
  { img: '/nave smaller.png',   name: 'Mis. Solomon Tesema',     role: 'Senior Teacher',           color: '#FF6B6B', quote: 'Teaches to create great learning.' },
]

const TEAM_VISIBLE = 4 // one row on desktop

function TeamSection() {
  const [expanded, setExpanded] = useState(false)
  const visible = teamMembers.slice(0, TEAM_VISIBLE)
  const hidden  = teamMembers.slice(TEAM_VISIBLE)

  return (
    <section className="hx-team" id="team">
      <div className="hx-team-bg" />
      <div className="hx-container">
        <div className="hx-section-eyebrow center" style={{color:'#FFB800'}}>Meet The Team</div>
        <h2 className="hx-section-title center white">Our <span className="hx-title-accent-white">Leadership</span></h2>
        <div className="hx-team-grid">
          {visible.map((m, i) => (
            <div key={i} className="hx-team-card" style={{'--tc': m.color}}>
              <div className="hx-team-bar" style={{background: m.color}} />
              <div className="hx-team-avatar-ring" style={{background: `linear-gradient(135deg, ${m.color}, ${m.color}88)`}}>
                <img src={m.img} alt={m.name} className="hx-team-avatar" />
              </div>
              <div className="hx-team-name">{m.name}</div>
              <div className="hx-team-role" style={{color: m.color}}>{m.role}</div>
              <div className="hx-team-quote">"{m.quote}"</div>
              <div className="hx-team-social">
                {[<FaCloud />,'f','in'].map((icon, si) => (
                  <a key={si} href="#" className="hx-social-btn" style={{'--tc': m.color}}>{icon}</a>
                ))}
              </div>
            </div>
          ))}
          {expanded && hidden.map((m, i) => (
            <div key={i + TEAM_VISIBLE} className="hx-team-card hx-team-card-extra hx-team-card-visible" style={{'--tc': m.color, '--delay': `${(i % TEAM_VISIBLE) * 60}ms`}}>
              <div className="hx-team-bar" style={{background: m.color}} />
              <div className="hx-team-avatar-ring" style={{background: `linear-gradient(135deg, ${m.color}, ${m.color}88)`}}>
                <img src={m.img} alt={m.name} className="hx-team-avatar" />
              </div>
              <div className="hx-team-name">{m.name}</div>
              <div className="hx-team-role" style={{color: m.color}}>{m.role}</div>
              <div className="hx-team-quote">"{m.quote}"</div>
              <div className="hx-team-social">
                {[<FaCloud />,'f','in'].map((icon, si) => (
                  <a key={si} href="#" className="hx-social-btn" style={{'--tc': m.color}}>{icon}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="hx-team-toggle-wrap">
          <button className="hx-team-toggle-btn" onClick={() => setExpanded(p => !p)}>
            <span>{expanded ? 'Show Less' : `Show All ${teamMembers.length} Members`}</span>
            <span className={`hx-team-toggle-arrow${expanded ? ' hx-team-toggle-arrow-up' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><polyline points="6 9 12 15 18 9"/></svg>
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const { t, lang } = useLang()
  const videoFrameRef = useRef(null)
  const [showJoin,    setShowJoin]    = useState(false)
  const [showContact, setShowContact] = useState(false)
  const [joinForm,    setJoinForm]    = useState({ name:'', email:'', phone:'', role:'Student', message:'' })
  const [joinSent,    setJoinSent]    = useState(false)
  const [contactForm, setContactForm] = useState({ name:'', email:'', message:'' })
  const [contactSent, setContactSent] = useState(false)
  const [parentForm,  setParentForm]  = useState({ parentName:'', parentPhone:'', parentEmail:'', childName:'', childAge:'', childGrade:'', notes:'' })

  const handleJoinSubmit = (e) => {
    e.preventDefault()
    setJoinSent(true)
    setTimeout(() => { setShowJoin(false); setJoinSent(false); setJoinForm({ name:'', email:'', phone:'', role:'Student', message:'' }); setParentForm({ parentName:'', parentPhone:'', parentEmail:'', childName:'', childAge:'', childGrade:'', notes:'' }) }, 2000)
  }

  const handleContactSubmit = (e) => {
    e.preventDefault()
    window.location.href = `mailto:manager@hidaya.edu?subject=Message from ${contactForm.name}&body=${encodeURIComponent(contactForm.message)}%0A%0AFrom: ${contactForm.name}%0AEmail: ${contactForm.email}`
    setContactSent(true)
    setTimeout(() => { setShowContact(false); setContactSent(false); setContactForm({ name:'', email:'', message:'' }) }, 2000)
  }

  return (
    <div className="hpage">
      <Navbar />

      {/* ══ HERO ══ */}
      <section className="hx-hero">
        {/* Background shapes */}
        <div className="hx-blob hx-blob-1" />
        <div className="hx-blob hx-blob-2" />
        <div className="hx-blob hx-blob-3" />
        <div className="hx-shape hx-shape-plus hx-shape-1"><FaCloud/></div>
        <div className="hx-shape hx-shape-tri hx-shape-2"><FaPencilAlt/></div>
        {/* <div className="hx-shape hx-shape-circle hx-shape-3" /> */}
        <div className="hx-shape hx-shape-tri hx-shape-4"><FaGlobe/></div>
        {/* <div className="hx-shape hx-shape-x hx-shape-5">✕</div> */}
        {/* <div className="hx-shape hx-shape-hex hx-shape-6">⬡</div> */}

        <div className="hx-hero-inner">
          {/* Left content */}
          <div className="hx-hero-left">
            <div className="hx-badge">
              <span>☪</span> Chiled Academy — Est. 2010
            </div>
            <p className="hx-hero-tagline"> <span className='hi'>Play,</span> <span className='da'>learn</span> and <span className='ya'>grow</span></p>
            <h1 className="hx-hero-title">
              <span className="hx-hero-title-main"><span className='hi'>Hi</span><span>da</span><span className='ya'>ya</span></span>
              {/* <span className="hx-hero-title-sub">Islamic Academy</span> */}
            </h1>
            <blockquote className="hx-hero-hadith">
              "Seeking knowledge is an obligation upon every Student."
              <cite> — Abdulkadir</cite>
            </blockquote>
            <div className="hx-hero-actions">
              <button className="hx-btn-primary" onClick={() => navigate('/role-select')}>
                Find Out More →
              </button>
              <button className="hx-btn-outline" onClick={() => navigate('/parent-portal')}>
                Parent Portal
              </button>
            </div>
            <div className="hx-hero-stats">
              {[['500+','Students'],['40+','Teachers'],['15+','Years'],['5','Roles']].map(([v,l]) => (
                <div key={l} className="hx-stat">
                  <span className="hx-stat-val">{v}</span>
                  <span className="hx-stat-lbl">{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Video */}
          <div className="hx-hero-right">
            <div className="hx-video-wrap" ref={videoFrameRef}>
              <div className="hx-video-ring hx-video-ring-1" />
              <div className="hx-video-ring hx-video-ring-2" />
              <iframe
                className="hx-video"
                src="https://www.youtube.com/embed/BgrQope-eP4?autoplay=1&mute=1&loop=1&playlist=BgrQope-eP4&controls=1&rel=0&modestbranding=1"
                title="Hidaya School Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{border:'none'}}
              />
              {/* Floating decorative badges */}
              <div className="hx-float-badge hx-float-badge-1">🌟 Est. 2010</div>
            </div>
          </div>
        </div>

        {/* Ticker */}
        <div className="hx-ticker">
          <div className="hx-ticker-inner">
            {['Knowledge is light ✦', 'ዕውቀት ብርሃን ነው ✦', 'Seeking knowledge is obligatory ✦', 'ትምህርት ለሁሉም ✦'].map((t,i) => (
              <span key={i} className="hx-ticker-item">{t}</span>
            ))}
            {['Knowledge is light ✦', 'ዕውቀት ብርሃን ነው ✦', 'Seeking knowledge is obligatory ✦', 'ትምህርት ለሁሉም ✦'].map((t,i) => (
              <span key={i+'b'} className="hx-ticker-item">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ WHO WE ARE ══ */}
      {/* Wave: Hero → About (dark-to-white) */}
      <div className="sw sw-dark-to-light">
        <svg viewBox="0 0 1440 90" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,0 C480,90 960,0 1440,60 L1440,90 L0,90 Z" fill="#f8f6f0"/>
          <path d="M0,20 C360,80 900,10 1440,50 L1440,90 L0,90 Z" fill="#ffffff" opacity="0.7"/>
        </svg>
      </div>
      <section className="hx-about" id="about">
        <div className="hx-about-deco hx-about-deco-1">
        <FaCloud/>
      </div>

      <div className="hx-about-deco hx-about-deco-2">
        <FaStar />
      </div>
        <div className="hx-container">
          <div className="hx-about-grid">
            <div className="hx-about-img-col">
              <div className="hx-about-img-frame">
                <div className="hx-about-img-border" />
                <img src={Students} alt="Hidaya Islamic Academy" className="hx-about-img" />
                <div className="hx-about-badge">
                  <span className="hx-about-badge-num">500+</span>
                  <span className="hx-about-badge-lbl">Students Enrolled</span>
                </div>
                
                <div className="hx-about-badge-2"><FaBook/>  Est. 2010 </div>
              </div>
            </div>
            <div className="hx-about-text-col">
              <div className="hx-section-eyebrow">Who We Are</div>
              <h2 className="hx-section-title">Nurturing Minds,<br/><span className="hx-title-accent">Strengthening Faith</span></h2>
              <p className="hx-about-para">{t('aboutPara1')}</p>
              <p className="hx-about-para">{t('aboutPara2')}</p>
              <div className="hx-feature-list">
                {[
                  { icon: <FaBook />, text: 'Quran & Islamic Studies integrated into curriculum' },
                  { icon: <FaTrophy />, text: '98% pass rate with consistent academic excellence' },
                  { icon: <FaUsers />, text: 'Parent portal for real-time progress tracking' },
                  { icon: <FaLock />, text: 'Secure role-based management system' },
                ].map((f,i) => (
                  <div key={i} className="hx-feature-item">
                    <span className="hx-feature-icon">{f.icon}</span>
                    <span>{f.text}</span>
                  </div>
                ))}
              </div>
              <div className="hx-values">
                {['ስነመግባር','Excellence','Character','Community'].map(v => (
                  <span key={v} className="hx-value-chip"><FaStar /> {v}</span>
                ))}
              </div>
              <button className="hx-btn-primary" style={{marginTop: 8}}>{t('exploreMore')}</button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CURRICULUM ══ */}
      {/* Wave: About (white) → Curriculum (dark navy) */}
      <div className="sw sw-light-to-dark">
        <svg viewBox="0 0 1440 90" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,90 C360,0 1080,90 1440,30 L1440,0 L0,0 Z" fill="#f8f6f0"/>
          <path d="M0,70 C480,10 900,80 1440,20 L1440,0 L0,0 Z" fill="#0a1628" opacity="0.15"/>
        </svg>
      </div>
      <section className="hx-curriculum" id="academics">
        <div className="hx-curriculum-bg" />
        <div className="hx-container">
          <div className="hx-section-eyebrow center" style={{color:'#FFB800'}}>Our Curriculum</div>
          <h2 className="hx-section-title center white">Academic <span className="hx-title-accent-white">Programmes</span></h2>
          <div className="hx-curriculum-grid">
            {academics.map((a,i) => (
              <div key={i} className="hx-ac-card" style={{'--ac': a.color}}>
                <div className="hx-ac-card-top" style={{background: a.color + '22'}}>
                  <span className="hx-ac-icon">{a.icon}</span>
                  <div className="hx-ac-shape" style={{background: a.color + '33'}} />
                </div>
                <div className="hx-ac-body">
                  <div className="hx-ac-dot" style={{background: a.color}} />
                  <div className="hx-ac-title">{a.title}</div>
                  <div className="hx-ac-desc">{a.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SERVICES ══ */}
      {/* Wave: Curriculum (dark) → Services (white) — the KEY wave like in the image */}
      <div className="sw sw-navy-to-white">
        <svg viewBox="0 0 1440 110" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,0 C300,100 700,0 1000,70 C1200,110 1440,30 1440,30 L1440,110 L0,110 Z" fill="#2a2f6e" opacity="0.4"/>
          <path d="M0,0 C400,80 800,10 1100,60 C1280,90 1440,40 1440,40 L1440,110 L0,110 Z" fill="#3d3a8c" opacity="0.55"/>
          <path d="M0,10 C350,90 750,5 1050,65 C1250,95 1440,50 1440,50 L1440,110 L0,110 Z" fill="#ffffff"/>
        </svg>
      </div>
      <section className="hx-services" id="services">
        <div className="hx-services-deco-1"><FaCloud /></div>
        <div className="hx-services-deco-2"><FaSmile /></div>
        <div className="hx-container">
          <div className="hx-section-eyebrow center">What We Offer</div>
          <h2 className="hx-section-title center">Our <span className="hx-title-accent">Services</span></h2>
          <p className="hx-section-sub center">A complete school management platform designed for every stakeholder.</p>
          <div className="hx-services-grid">
            {services.map((s,i) => (
              <div key={i} className="hx-svc-card" style={{'--sc': s.color}}>
                <div className="hx-svc-icon-wrap" style={{background: s.color+'20', border: `2px solid ${s.color}40`}}>
                  <span className="hx-svc-icon">{s.icon}</span>
                </div>
                <div className="hx-svc-title">{s.title}</div>
                <div className="hx-svc-divider" style={{background: s.color}} />
                <div className="hx-svc-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ROLES ══ */}
      {/* Wave: Services (white) → Roles (dark) */}
      <div className="sw sw-white-to-dark">
        <svg viewBox="0 0 1440 90" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,90 C480,0 960,90 1440,20 L1440,0 L0,0 Z" fill="#fff"/>
          <path d="M0,70 C360,5 900,85 1440,15 L1440,0 L0,0 Z" fill="#0a1628" opacity="0.12"/>
        </svg>
      </div>
      <section className="hx-roles">
        <div className="hx-roles-bg" />
        <div className="hx-container">
          <div className="hx-section-eyebrow center" style={{color:'#FFB800'}}>Roles</div>
          <h2 className="hx-section-title center white">Who Uses <span className="hx-title-accent-white">Hidaya?</span></h2>
          <div className="hx-roles-grid">
            {roles.map((r,i) => (
              <div key={i} className="hx-role-card" style={{'--rc': r.color, '--rbg': r.bg}}>
                <div className="hx-role-icon-wrap" style={{background: r.color}}>
                  <span className="hx-role-svg" dangerouslySetInnerHTML={{__html: r.svg.replace('stroke="currentColor"', `stroke="#fff"`)}} />
                </div>
                <div className="hx-role-title">{r.title}</div>
                <div className="hx-role-desc">{r.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ANNOUNCEMENTS ══ */}
      {/* Wave: Roles (dark) → Announcements (white) */}
      <div className="sw sw-dark-to-light">
        <svg viewBox="0 0 1440 90" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,0 C480,90 960,0 1440,60 L1440,90 L0,90 Z" fill="#f8f6f0"/>
          <path d="M0,20 C360,80 900,10 1440,50 L1440,90 L0,90 Z" fill="#ffffff" opacity="0.7"/>
        </svg>
      </div>
      <section className="hx-ann" id="announcements">
        <div className="hx-ann-deco-1"><FaSmile/></div>
        <div className="hx-ann-deco-2"><FaCloud /></div>
        <div className="hx-container">
          <div className="hx-section-eyebrow center">Latest News</div>
          <h2 className="hx-section-title center">School <span className="hx-title-accent">Announcements</span></h2>
          <div className="hx-ann-list">
            {announcements.map((a,i) => (
              <div key={i} className="hx-ann-item" style={{'--ac': a.color}}>
                <div className="hx-ann-date" style={{background: a.color}}>
                  <span>{a.date.split(' ')[0]}</span>
                  <span>{a.date.split(' ')[1]}</span>
                </div>
                <div className="hx-ann-body">
                  <div className="hx-ann-title">{a.title}</div>
                  <span className="hx-ann-tag" style={{color: a.color, border: `1px solid ${a.color}50`, background: a.color+'15'}}>{a.tag}</span>
                </div>
                <div className="hx-ann-arrow" style={{color: a.color}}>→</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TEAM ══ */}
      {/* Wave: Announcements (white) → Team (dark) — layered navy like the image */}
      <div className="sw " style={{transform:'scaleY(-1)'}}>
        <svg viewBox="0 0 1440 110" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,0 C300,100 700,0 1000,70 C1200,110 1440,30 1440,30 L1440,110 L0,110 Z" fill="#1a1f5e" opacity="0.35"/>
          <path d="M0,0 C400,80 800,10 1100,60 C1280,90 1440,40 1440,40 L1440,110 L0,110 Z" fill="#2a2f7e" opacity="0.5"/>
          <path d="M0,10 C350,90 750,5 1050,65 C1250,95 1440,50 1440,50 L1440,110 L0,110 Z" fill="#0e1340"/>
        </svg>
      </div>
      <TeamSection />

      {/* ══ MAP ══ */}
      {/* Wave: Team (dark) → Map (white) */}
      <div className="sw sw-dark-to-light">
        <svg viewBox="0 0 1440 90" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,0 C480,90 960,0 1440,60 L1440,90 L0,90 Z" fill="#fff"/>
          <path d="M0,25 C300,85 800,5 1440,55 L1440,90 L0,90 Z" fill="#f4f6fb" opacity="0.6"/>
        </svg>
      </div>
      <section className="hx-map" id="contact">
        <div className="hx-map-inner">

          {/* Left: info + CTA */}
          <div className="hx-map-left">
            <div className="hx-map-eyebrow">
              <span className="hx-map-dot" />
              Find Us
            </div>
            <h2 className="hx-map-title">Visit <span className="hx-map-accent">Our School</span></h2>
            <p className="hx-map-sub">{t('visitDesc')}</p>

            {/* Info pills */}
            <div className="hx-map-info-list">
              <div className="hx-map-info-pill">
                <div className="hx-map-info-icon" style={{background:'linear-gradient(135deg,#6C63FF,#9B93FF)'}}>
                  <FaMapMarker />
                </div>
                <div>
                  <div className="hx-map-info-label">Address</div>
                  <div className="hx-map-info-val">Kombolcha, Kebele 8, Ethiopia</div>
                </div>
              </div>
              <div className="hx-map-info-pill">
                <div className="hx-map-info-icon" style={{background:'linear-gradient(135deg,#FFB800,#FFD84D)'}}>
                  <FaPhone />
                </div>
                <div>
                  <div className="hx-map-info-label">Phone</div>
                  <div className="hx-map-info-val">+251 961 622 222</div>
                </div>
              </div>
              <div className="hx-map-info-pill">
                <div className="hx-map-info-icon" style={{background:'linear-gradient(135deg,#00C48C,#00E5A8)'}}>
                  <FaEnvelope />
                </div>
                <div>
                  <div className="hx-map-info-label">Email</div>
                  <div className="hx-map-info-val">info@hidaya.edu</div>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="hx-map-cta-row">
              <button className="hx-map-cta-primary" onClick={() => setShowJoin(true)}>
                <FaUserGraduate />
                <span>Join Us</span>
              </button>
              <button className="hx-map-cta-outline" onClick={() => setShowContact(true)}>
                <FaPhone />
                <span>Contact Manager</span>
              </button>
            </div>
          </div>

          {/* Right: map */}
          <div className="hx-map-right">
            <div className="hx-map-frame">
              <iframe
                title="Hidaya Islamic Academy"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15722.4!2d39.7434!3d11.0816!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1644c6b0b0b0b0b1%3A0x0!2sKombolcha%2C+Kebele+8%2C+Ethiopia!5e0!3m2!1sen!2set!4v1700000000000!5m2!1sen!2set"
                width="100%" height="100%" style={{border:0}} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            {/* floating badge */}
            <div className="hx-map-badge">
              <FaSchool />
              <span>Hidaya Islamic Academy</span>
            </div>
          </div>

        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="hx-footer">
        <div className="hx-footer-top">
          <div className="hx-footer-brand">
            <img src={HidayaLogo} alt="Hidaya Logo" className="hx-footer-logo" />
            <div>
              <div className="hx-footer-name">Hidaya Islamic Academy</div>
              <div className="hx-footer-tagline">Nurturing Minds, Strengthening Faith</div>
            </div>
          </div>
          <div className="hx-footer-cols">
            <div className="hx-footer-col">
              <div className="hx-footer-col-title">Quick Links</div>
              <a href="#about">About Us</a>
              <a href="#academics">Academics</a>
              <a href="#announcements">News</a>
            </div>
            <div className="hx-footer-col">
              <div className="hx-footer-col-title">Portal</div>
              <span onClick={() => navigate('/role-select')} className="hx-footer-link">Staff Login</span>
              <span onClick={() => navigate('/parent-portal')} className="hx-footer-link">Parent Portal</span>
            </div>
            <div className="hx-footer-col">
              <div className="hx-footer-col-title">Contact</div>
              <span><FaMapMarker /> Kombolcha, Kebele 8</span>
              <span><FaPhone /> +251 961622222</span>
              <span><FaEnvelope /> info@hidaya.edu</span>
            </div>
          </div>
        </div>
        <div className="hx-footer-bottom">
          <span>© 2026 Hidaya Islamic Academy — All rights reserved</span>
          <span className="hx-footer-hadith">"Seek knowledge from the cradle to the grave"</span>
        </div>
      </footer>

      {/* ══ JOIN MODAL ══ */}
      {showJoin && (
        <div className="hm-overlay" onClick={() => setShowJoin(false)}>
          <div className="hm-modal" onClick={e => e.stopPropagation()}>
            <button className="hm-close" onClick={() => setShowJoin(false)}>✕</button>
            {joinSent ? (
              <div className="hm-success">
                <div className="hm-success-icon">✓</div>
                <h3>Application Submitted!</h3>
                <p>We will review your application and contact you soon.</p>
              </div>
            ) : (
              <>
                <div className="hm-head">
                  <div className="hm-head-icon" style={{background:'linear-gradient(135deg,#FFB800,#ffd452)'}}>🎓</div>
                  <div>
                    <h3 className="hm-title">Join Hidaya Academy</h3>
                    <p className="hm-sub">Select your role to get started</p>
                  </div>
                </div>
                <div className="hm-field">
                  <label>I am joining as</label>
                  <select value={joinForm.role} onChange={e => setJoinForm({...joinForm, role: e.target.value})}>
                    <option>Student</option><option>Teacher</option><option>Parent</option><option>Staff</option>
                  </select>
                </div>
                {joinForm.role === 'Parent' ? (
                  <form className="hm-form" onSubmit={handleJoinSubmit}>
                    <div className="hm-section-label">Parent Information</div>
                    <div className="hm-field"><label>Parent Full Name</label><input type="text" placeholder="Your full name" required value={parentForm.parentName} onChange={e => setParentForm({...parentForm, parentName: e.target.value})} /></div>
                    <div className="hm-row">
                      <div className="hm-field"><label>Phone</label><input type="tel" placeholder="+251 9XX XXX XXX" required value={parentForm.parentPhone} onChange={e => setParentForm({...parentForm, parentPhone: e.target.value})} /></div>
                      <div className="hm-field"><label>Email</label><input type="email" placeholder="your@email.com" value={parentForm.parentEmail} onChange={e => setParentForm({...parentForm, parentEmail: e.target.value})} /></div>
                    </div>
                    <div className="hm-section-label">Child Information</div>
                    <div className="hm-field"><label>Child Full Name</label><input type="text" placeholder="Child's full name" required value={parentForm.childName} onChange={e => setParentForm({...parentForm, childName: e.target.value})} /></div>
                    <div className="hm-row">
                      <div className="hm-field"><label>Age</label><input type="number" placeholder="e.g. 10" min="4" max="20" required value={parentForm.childAge} onChange={e => setParentForm({...parentForm, childAge: e.target.value})} /></div>
                      <div className="hm-field"><label>Grade</label><select value={parentForm.childGrade} onChange={e => setParentForm({...parentForm, childGrade: e.target.value})}><option value="">Select grade</option>{['Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'].map(g => <option key={g}>{g}</option>)}</select></div>
                    </div>
                    <div className="hm-field"><label>Notes (optional)</label><textarea placeholder="Any special requirements..." rows={2} value={parentForm.notes} onChange={e => setParentForm({...parentForm, notes: e.target.value})} /></div>
                    <button type="submit" className="hm-submit">Apply Now ✓</button>
                  </form>
                ) : (
                  <form className="hm-form" onSubmit={handleJoinSubmit}>
                    <div className="hm-field"><label>Full Name</label><input type="text" placeholder="Your full name" required value={joinForm.name} onChange={e => setJoinForm({...joinForm, name: e.target.value})} /></div>
                    <div className="hm-field"><label>Email Address</label><input type="email" placeholder="your@email.com" required value={joinForm.email} onChange={e => setJoinForm({...joinForm, email: e.target.value})} /></div>
                    <div className="hm-field"><label>Phone Number</label><input type="tel" placeholder="+251 9XX XXX XXX" value={joinForm.phone} onChange={e => setJoinForm({...joinForm, phone: e.target.value})} /></div>
                    <div className="hm-field"><label>Message (optional)</label><textarea placeholder="Tell us about yourself..." rows={3} value={joinForm.message} onChange={e => setJoinForm({...joinForm, message: e.target.value})} /></div>
                    <button type="submit" className="hm-submit">Apply Now </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ══ CONTACT MODAL ══ */}
      {showContact && (
        <div className="hm-overlay" onClick={() => setShowContact(false)}>
          <div className="hm-modal" onClick={e => e.stopPropagation()}>
            <button className="hm-close" onClick={() => setShowContact(false)}>✕</button>
            {contactSent ? (
              <div className="hm-success">
                <div className="hm-success-icon" style={{background:'linear-gradient(135deg,#0891b2,#06b6d4)'}}>✓</div>
                <h3>Message Sent!</h3>
                <p>Your email client will open to complete sending.</p>
              </div>
            ) : (
              <>
                <div className="hm-head">
                  <div className="hm-head-icon" style={{background:'linear-gradient(135deg,#6C63FF,#9B93FF)'}}><FaPhone /></div>
                  <div>
                    <h3 className="hm-title">Contact Manager</h3>
                    <p className="hm-sub">Reach out to the academy manager</p>
                  </div>
                </div>
                <div className="hm-contact-info">
                  <a href="tel:+251912345678" className="hm-contact-row"><span className="hm-ci-icon" style={{background:'#e8f4fd'}}><FaPhone /></span><div><div className="hm-ci-label">Phone</div><div className="hm-ci-val">+251 91 234 5678</div></div></a>
                  <a href="mailto:manager@hidaya.edu" className="hm-contact-row"><span className="hm-ci-icon" style={{background:'#f0e8fd'}}><FaEnvelope /></span><div><div className="hm-ci-label">Email</div><div className="hm-ci-val">manager@hidaya.edu</div></div></a>
                </div>
                <div className="hm-divider">Or send a message</div>
                <form className="hm-form" onSubmit={handleContactSubmit}>
                  <div className="hm-field"><label>Your Name</label><input type="text" placeholder="Full name" required value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} /></div>
                  <div className="hm-field"><label>Your Email</label><input type="email" placeholder="your@email.com" required value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} /></div>
                  <div className="hm-field"><label>Message</label><textarea placeholder="Write your message..." rows={4} required value={contactForm.message} onChange={e => setContactForm({...contactForm, message: e.target.value})} /></div>
                  <button type="submit" className="hm-submit hm-submit-blue">Send Message 📨</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <Chatbot />
    </div>
  )
}