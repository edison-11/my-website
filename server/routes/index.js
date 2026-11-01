const express = require('express');
const asyncRoute = require('../middleware/asyncRoute');
const requireAuth = require('../middleware/requireAuth');
const requireAdmin = require('../middleware/requireAdmin');
const requireCustomer = require('../middleware/requireCustomer');
const validate = require('../middleware/validateRequest');
const validateCategory = require('../middleware/validateCategory');
const categories = require('../controllers/categoryController');
const decorations = require('../controllers/decorationController');
const auth = require('../controllers/authController');
const serviceRequests = require('../controllers/serviceRequestController');
const messages = require('../controllers/messageController');
const siteContent = require('../controllers/siteContentController');
const media = require('../controllers/mediaController');
const siteActivity = require('../controllers/siteActivityController');
const User = require('../models/User');

const router = express.Router();

router.post('/auth/register', validate({ name: { type: 'string', required: true, max: 100 }, email: { type: 'string', required: true, email: true }, password: { type: 'string', required: true, minLength: 8, max: 128 }, role: { type: 'string', enum: ['customer', 'admin'] } }), asyncRoute(auth.register));
router.get('/auth/setup-status', asyncRoute(async (_req, res) => {
  const adminExists = await User.exists({ role: 'admin', isActive: true });
  res.json({ needsSetup: !adminExists });
}));
router.post('/auth/setup-admin', validate({ name: { type: 'string', required: true, max: 100 }, email: { type: 'string', required: true, email: true }, password: { type: 'string', required: true, minLength: 8, max: 128 } }), asyncRoute(async (req, res) => {
  const clientAddress = (req.ip || '').replace(/^::ffff:/, '');
  if (!['127.0.0.1', '::1'].includes(clientAddress)) return res.status(403).json({ message: 'Initial administrator setup is available from this computer only.' });
  const existingAdmin = await User.exists({ role: 'admin', isActive: true });
  if (existingAdmin) return res.status(409).json({ message: 'An administrator is already set up. Sign in instead.' });
  const result = await auth.createInitialAdmin(req.body);
  res.status(201).json(result);
}));
router.post('/auth/login', validate({ email: { type: 'string', required: true, email: true }, password: { type: 'string', required: true, max: 128 } }), asyncRoute(auth.login));
router.get('/auth/me', requireAuth, asyncRoute(auth.getCurrentUser));

router.get('/site-content', asyncRoute(siteContent.getSiteContent));
router.patch('/site-content', requireAuth, requireAdmin, asyncRoute(siteContent.updateSiteContent));
router.post('/activity/page-view', asyncRoute(siteActivity.recordPageView));
router.post('/activity/share', asyncRoute(siteActivity.recordShare));
router.get('/admin/activity', requireAuth, requireAdmin, asyncRoute(siteActivity.getSummary));
router.get('/media', asyncRoute(media.listPublicMedia));
router.post('/media/:id/likes', asyncRoute(media.likePublicMedia));
router.post('/media/:id/comments', asyncRoute(media.addPublicComment));
router.get('/admin/media', requireAuth, requireAdmin, asyncRoute(media.listMedia));
router.post('/admin/media', requireAuth, requireAdmin, express.raw({ type: ['image/*', 'video/*'], limit: '80mb' }), asyncRoute(media.uploadMedia));
router.patch('/admin/media/:id/public', requireAuth, requireAdmin, asyncRoute(media.setMediaVisibility));
router.patch('/admin/media/:id', requireAuth, requireAdmin, asyncRoute(media.updateMediaDescription));
router.delete('/admin/media/:id', requireAuth, requireAdmin, asyncRoute(media.archiveMedia));

router.get('/categories', asyncRoute(categories.getCategories));
router.post('/categories', requireAuth, requireAdmin, validateCategory, asyncRoute(categories.createCategory));
router.patch('/categories/:id', requireAuth, requireAdmin, asyncRoute(categories.updateCategory));
router.delete('/categories/:id', requireAuth, requireAdmin, asyncRoute(categories.deleteCategory));

router.get('/decorations', asyncRoute(decorations.listDecorations));
router.get('/decorations/:id', asyncRoute(decorations.getDecoration));
router.post('/decorations', requireAuth, requireAdmin, asyncRoute(decorations.createDecoration));
router.patch('/decorations/:id', requireAuth, requireAdmin, asyncRoute(decorations.updateDecoration));
router.delete('/decorations/:id', requireAuth, requireAdmin, asyncRoute(decorations.deleteDecoration));

router.post('/service-requests', validate({ name: { type: 'string', required: true, max: 100 }, email: { type: 'string', required: true, email: true }, serviceType: { type: 'string', required: true, max: 100 }, details: { type: 'string', required: true, max: 5000 }, budget: { type: 'number' } }), asyncRoute(serviceRequests.createServiceRequest));
router.get('/customer/service-requests', requireAuth, requireCustomer, asyncRoute(serviceRequests.listCustomerServiceRequests));
router.post('/customer/service-requests', requireAuth, requireCustomer, validate({ serviceType: { type: 'string', required: true, max: 100 }, details: { type: 'string', required: true, max: 5000 }, budget: { type: 'number' } }), asyncRoute(serviceRequests.createCustomerServiceRequest));
router.get('/service-requests', requireAuth, requireAdmin, asyncRoute(serviceRequests.listServiceRequests));
router.patch('/service-requests/:id', requireAuth, requireAdmin, validate({ status: { type: 'string', required: true } }), asyncRoute(serviceRequests.updateServiceRequest));

router.post('/messages', validate({ name: { type: 'string', required: true, max: 100 }, email: { type: 'string', required: true, email: true }, subject: { type: 'string', max: 160 }, message: { type: 'string', required: true, max: 5000 } }), asyncRoute(messages.createMessage));
router.get('/customer/messages', requireAuth, requireCustomer, asyncRoute(messages.listCustomerMessages));
router.post('/customer/messages', requireAuth, requireCustomer, validate({ subject: { type: 'string', max: 160 }, message: { type: 'string', required: true, max: 5000 } }), asyncRoute(messages.createCustomerMessage));
router.post('/customer/messages/:id/replies', requireAuth, requireCustomer, asyncRoute(messages.addCustomerReply));
router.post('/customer/messages/:id/images', requireAuth, requireCustomer, express.raw({ type: 'image/*', limit: '12mb' }), asyncRoute(messages.attachCustomerImage));
router.get('/messages', requireAuth, requireAdmin, asyncRoute(messages.listMessages));
router.post('/messages/:id/replies', requireAuth, requireAdmin, asyncRoute(messages.addAdminReply));
router.post('/messages/:id/images', requireAuth, requireAdmin, express.raw({ type: 'image/*', limit: '12mb' }), asyncRoute(messages.attachAdminImage));
router.patch('/messages/:id', requireAuth, requireAdmin, asyncRoute(messages.updateMessage));

module.exports = router;
