const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security middleware to protect against Clickjacking attacks
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
  next();
});

// Mock database for events
const events = [
  {
    id: "evt-01",
    title: "Global Tech Summit 2026",
    category: "technology",
    date: "Oct 24-26, 2026",
    location: "Metropolis Arena & Online",
    price: "$299",
    seatsLeft: 42,
    badge: "Keynote Highlight",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
    description: "Join 5,000+ engineers, founders, and security researchers exploring next-generation distributed systems and AI infrastructure.",
    speakers: ["Dr. Sarah Chen (Quantum Labs)", "Marcus Brody (CyberDefense AI)"]
  },
  {
    id: "evt-02",
    title: "CyberSec Defense Con 2026",
    category: "security",
    date: "Nov 12-14, 2026",
    location: "Cyber City Convention Center",
    price: "$450",
    seatsLeft: 18,
    badge: "Selling Fast",
    image: "https://images.unsplash.com/photo-1510519138171-cbe65663114d?auto=format&fit=crop&w=800&q=80",
    description: "The premier gathering for threat intelligence, offensive security research, defensive hardening, and runtime posture monitoring.",
    speakers: ["Elena Vance (ThreatOps)", "Devon Vance (Red Team Lead)"]
  },
  {
    id: "evt-03",
    title: "DesignCraft UI/UX Festival",
    category: "design",
    date: "Dec 05, 2026",
    location: "Arts & Media Center",
    price: "$149",
    seatsLeft: 75,
    badge: "Popular",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
    description: "A dynamic hands-on festival covering fluid design systems, micro-interactions, accessibility patterns, and spatial UI.",
    speakers: ["Sophia Loren (Lead Product Designer)", "Kevin Park (Motion Architect)"]
  },
  {
    id: "evt-04",
    title: "FullStack Cloud Native Jam",
    category: "technology",
    date: "Dec 18, 2026",
    location: "Virtual Stage Alpha",
    price: "Free",
    seatsLeft: 220,
    badge: "Free RSVP",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80",
    description: "Live coding workshops on microservices orchestration, serverless edge runtimes, and real-time observability telemetry.",
    speakers: ["Aiden Ross (DevOps Guru)", "Tanya Meyer (Cloud Specialist)"]
  },
  {
    id: "evt-05",
    title: "Future of FinTech & DeFi Summit",
    category: "business",
    date: "Jan 15, 2027",
    location: "Financial District Pavilion",
    price: "$380",
    seatsLeft: 29,
    badge: "Executive",
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80",
    description: "Exploration of high-frequency compliance systems, zero-knowledge proofs, decentralized ledger security, and payment gateways.",
    speakers: ["Julian Hayes (Chief Economist)", "Rachel Sterling (Blockchain Strategist)"]
  },
  {
    id: "evt-06",
    title: "Neon Sound & Lights Music Expo",
    category: "entertainment",
    date: "Feb 02-04, 2027",
    location: "Sunset Bay Amphitheater",
    price: "$85",
    seatsLeft: 94,
    badge: "Live Performances",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
    description: "Immersive audio-visual showcase featuring 40+ indie musicians, visual synthesizers, sound design workshops, and afterparties.",
    speakers: ["DJ Pulse", "Acoustic Horizon"]
  }
];

// In-memory bookings store
const bookings = [];

// Static frontend delivery
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'EventPulse API Service',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/events', (req, res) => {
  const { category, search } = req.query;
  let filtered = [...events];
  
  if (category && category !== 'all') {
    filtered = filtered.filter(e => e.category.toLowerCase() === category.toLowerCase());
  }
  
  if (search) {
    const query = search.toLowerCase();
    filtered = filtered.filter(e => 
      e.title.toLowerCase().includes(query) || 
      e.description.toLowerCase().includes(query) ||
      e.location.toLowerCase().includes(query)
    );
  }

  res.json({ success: true, count: filtered.length, data: filtered });
});

app.post('/api/tickets/book', (req, res) => {
  const { eventId, attendeeName, email, ticketType, quantity } = req.body;
  
  if (!eventId || !attendeeName || !email) {
    return res.status(400).json({ success: false, error: 'Missing required booking details' });
  }

  const targetEvent = events.find(e => e.id === eventId);
  if (!targetEvent) {
    return res.status(404).json({ success: false, error: 'Event not found' });
  }

  const qty = parseInt(quantity, 10) || 1;
  if (targetEvent.seatsLeft < qty) {
    return res.status(400).json({ success: false, error: 'Not enough seats available' });
  }

  targetEvent.seatsLeft -= qty;

  const bookingRecord = {
    bookingId: `BK-${Date.now().toString(36).toUpperCase()}`,
    eventId,
    eventTitle: targetEvent.title,
    attendeeName,
    email,
    ticketType: ticketType || 'General Admission',
    quantity: qty,
    bookedAt: new Date().toISOString()
  };

  bookings.push(bookingRecord);

  res.status(201).json({
    success: true,
    message: 'Booking confirmed successfully!',
    booking: bookingRecord
  });
});

app.listen(PORT, () => {
  console.log(`🚀 EventPulse server running on http://localhost:${PORT}`);
});
