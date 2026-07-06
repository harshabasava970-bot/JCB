# JCB Working — Web App

A complete offline-first web application for JCB operators to record daily work, calculate charges, and generate reports.

## Features
- Login with mobile number
- Start/Stop work with live timer
- Auto-calculate earnings (minutes ÷ 60 × ₹1300/hr)
- Payment tracking (Paid / Pending / Partially Paid)
- Work history with search and filter
- Daily / Monthly / Yearly reports with charts
- PDF invoice generator
- WhatsApp share
- Dark mode
- 100% offline — data stored in browser (IndexedDB)

## Tech Stack
- HTML5, CSS3, Vanilla JavaScript
- IndexedDB (offline database)
- Chart.js (reports charts)
- jsPDF (PDF generation)
- No backend, no server, no install needed

## Live Demo
Deployed on Render: [https://jcb-working.onrender.com](https://jcb-working.onrender.com)

## How to Run Locally
Just open `index.html` in any browser. No installation needed.

## Deploy on Render
1. Push this repo to GitHub
2. Go to [render.com](https://render.com)
3. New → Static Site
4. Connect this GitHub repo
5. Build command: _(leave empty)_
6. Publish directory: `.` (dot)
7. Click Deploy

## License
Free to use.
