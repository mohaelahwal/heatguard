Heatguard SaaS - AI Coding Assistant UI Guide
Context for AI: You are acting as a Senior Frontend Engineer and UI/UX Designer. This document is your ultimate source of truth for styling, component structure, and design tokens for the "Heatguard" SaaS platform (Worker App, Admin Dashboard, and Nurse Portal).
Do not invent new colors or styles. Stick strictly to the Tailwind CSS classes and design principles outlined below.
1. Core Design Principles
Mobile-First for Workers: The worker app must be highly legible in high-glare outdoor environments. Use high contrast.
Modern & Approachable: Synthesize the "SafeMatch" aesthetic—ample whitespace, highly rounded corners (pill shapes), soft shadows, and clean typography.
Data-Visibility: Health data (WBGT, Heart Rate) must be instantly readable using gauges, color-coded badges, and clear typography.
Glassmorphism (Contextual): Use subtle frosted glass effects for floating alerts or camera/video overlays (like the Nurse Tele-triage screen).
2. Design Tokens (Tailwind CSS)
Configure these in your tailwind.config.js or use the closest utility classes.
Colors
Primary Green (Brand/Actions): #00D15A (Use bg-[#00D15A] or map to primary) - Used for primary buttons, active states, and "Safe" indicators.
Deep Forest (Dark Backgrounds): #0B281F (Use bg-[#0B281F]) - Used for dark mode backgrounds, landing page hero sections, and high-contrast header bars.
Surface Light: #F7F9F8 - Default background for the light-mode mobile app.
Card White: #FFFFFF - Standard card background.
Danger Red: #FF3B30 - Used for High Heat Alerts, SOS buttons, and critical warnings.
Warning Amber: #FFCC00 - Used for Caution states.
Text Primary: #111827 (Gray-900) for light mode, #FFFFFF for dark mode.
Text Secondary: #6B7280 (Gray-500) for labels and timestamps.
Border Radius (Highly Rounded Aesthetic)
Buttons: rounded-full (Pill shape is mandatory for primary actions).
Cards/Modals: rounded-3xl or rounded-2xl for a soft, friendly feel.
Input Fields: rounded-xl or rounded-2xl.
Typography
Font Family: Inter, SF Pro Text, or system sans-serif.
Headings: Bold (font-bold), tight tracking (tracking-tight).
Numbers/Metrics: Use monospaced or highly legible tabular figures for live data (Heart Rate, Temperature).
3. Component Library Specifications
Instruct Claude to build these reusable components using the exact Tailwind classes provided.
3.1 Buttons
Primary Button (e.g., "Continue", "Talk to a Nurse"):
Classes: w-full bg-[#00D15A] text-white font-semibold py-4 px-6 rounded-full hover:bg-green-600 transition-colors shadow-lg shadow-green-500/30 flex items-center justify-center
Secondary/Ghost Button (e.g., "Reset", "Cancel"):
Classes: text-[#00D15A] font-medium py-3 px-6 rounded-full hover:bg-green-50 transition-colors
SOS/Emergency Button:
Classes: bg-[#FF3B30] text-white font-bold rounded-full py-3 px-6 shadow-lg shadow-red-500/40 animate-pulse
3.2 Cards & Containers
Standard Data Card (Light Mode):
Classes: bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100
Glassmorphic Overlay Card (used over video/maps):
Classes: bg-white/70 backdrop-blur-md border border-white/50 rounded-3xl p-4 shadow-xl
Dark Mode Alert Card (See Deck Pg 8):
Classes: bg-[#0B281F]/80 backdrop-blur-lg border border-green-500/30 rounded-3xl p-6 text-white
3.3 Inputs & Forms (SafeMatch Style)
Text/Email Input:
Container: relative w-full mb-4
Input: w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00D15A] focus:border-transparent transition-all
Note: Use floating labels or inset labels for a premium feel.
Segmented Control / Toggles (e.g., Language Selection):
Classes: flex bg-gray-100 p-1 rounded-full
Active Item: bg-white shadow-sm rounded-full py-2 px-4 text-gray-900 font-medium
3.4 Data Visualizations & Indicators
Status Badges:
Safe: bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
Danger: bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
Hydration Tracker (Segmented Progress Bar):
Use a flex container with multiple div segments.
Filled segment: bg-[#00D15A] h-2 rounded-full flex-1 mx-0.5
Empty segment: bg-gray-200 h-2 rounded-full flex-1 mx-0.5
Heat Stress Meter (Half-Gauge):
Build using SVG. The arc should transition from Green -> Yellow -> Red.
Current value should be large, centered text: text-4xl font-bold text-gray-900.
3.5 Navigation (Mobile)
Bottom Tab Bar:
Classes: fixed bottom-0 w-full bg-white border-t border-gray-100 pb-safe pt-2 px-6 flex justify-between items-center rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)]
Icons: Use standard icons (Home, Water Drop for Hydration, Clock for Break, Map, User Profile).
Active State: Icon turns #00D15A and gains a small green dot underneath.
4. Specific Screen Implementations
When prompting the AI to build specific screens, reference these layouts:
A. Worker Dashboard (Main Screen)
Header: Greeting ("Good Morning, George"), current location ("Palm Jebel Ali"), and supervisor name.
Hero Card: The "Heat Stress Meter". Large white card, half-gauge showing current WBGT. Include a bright badge "PPE: ON".
Alert Banner: If high heat, a full-width pill bg-red-500 text-white stating "STAY HYDRATED. REPORT SYMPTOMS."
Hydration Widget: Shows Goal vs Drank. Include quick-add buttons (+250, +500, +1000 pill buttons).
Floating Action: "TALK TO A NURSE" button pinned above the bottom nav.
B. Live Tele-Triage (Nurse Video Call)
Background: Full-screen video feed of the nurse.
Overlay Top: "TALKING WITH NURSE SARAH RAWI" with call duration.
Overlay Bottom: Glassmorphic card (bg-white/80 backdrop-blur) displaying the worker's live vitals transmitted from wearables:
HR: 122 BPM
Body Temp: 38.0°C
SPO2: 92%
Controls: End call button (Red pill, centered).
C. Admin / Supervisor View (Desktop/Tablet)
Sidebar Navigation: Deep forest green #0B281F.
Main Content area: Light gray background.
Tables: Clean, borderless tables with row hover effects (hover:bg-gray-50). Use badges for worker compliance status (e.g., "Break Taken", "Hydration Low").
5. AI Prompting Instructions (How to use this guide)
Copy and paste this exact prompt to Claude when you are ready to generate code:
"Act as an expert Frontend Developer. Using React, Tailwind CSS, and Lucide React (for icons), build the [INSERT SCREEN NAME, e.g., Worker Dashboard] for the Heatguard app.
Strictly follow these rules:
Use #00D15A for primary accents and buttons.
Use heavily rounded corners (rounded-2xl, rounded-3xl, rounded-full for buttons).
Use shadow-[0_8px_30px_rgb(0,0,0,0.04)] for soft, modern card elevations.
Ensure the design is fully responsive but optimized for a mobile-first viewport.
Do not use external CSS files; rely entirely on Tailwind utility classes.
Keep inputs and buttons large (minimum py-3 or py-4) for easy tapping by workers wearing gloves."

