const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');

dotenv.config();

const app = express();

// Import Controllers
const emailController = require('./controllers/emailController');
const pdfController = require('./controllers/pdfController');
const uploadController = require('./controllers/uploadController');

// Middleware
app.use(cors());
app.use(express.json());

// Disable caching to ensure fresh data during development
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// --- EMAIL ROUTES ---
// Route used by the "Send via Email" button in invoice.html
app.post('/api/documents/send-test', emailController.sendDocument);
// Route for sending existing documents by ID
app.post('/api/documents/:documentId/send', emailController.sendDocument);

// --- PDF ROUTES ---
// New route for the "Generate PDF" button (Direct Download)
app.post('/api/documents/generate-dynamic-pdf', pdfController.generateDynamicPDF);
// Route for generating PDF from database records
const { authenticate } = require('./middleware/auth');
app.get('/api/documents/:documentId/pdf', authenticate, pdfController.generatePDF);

// --- UPLOAD SETUP ---
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Upload endpoints
app.post('/api/upload/products', upload.single('file'), uploadController.uploadProducts);
app.post('/api/upload/clients', upload.single('file'), uploadController.uploadClients);
app.post('/api/upload/expenses', upload.single('file'), uploadController.uploadExpenses);

// --- OTHER API ROUTES ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/products', require('./routes/products'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/recurring', require('./routes/recurring'));

// --- ROOT ROUTE ---
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
});

// --- SERVER START ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});