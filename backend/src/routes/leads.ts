import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  exportLeadsCSV,
  getLeadStats,
} from '../controllers/leadController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/errorHandler';

const router = Router();

// All routes require authentication
router.use(authenticate);

const leadValidation = [
  body('name').trim().isLength({ min: 2, max: 150 }).withMessage('Name must be 2–150 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('status')
    .optional()
    .isIn(['New', 'Contacted', 'Qualified', 'Lost'])
    .withMessage('Invalid status'),
  body('source')
    .isIn(['Website', 'Instagram', 'Referral'])
    .withMessage('Invalid source'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes too long'),
];

const updateLeadValidation = [
  param('id').isMongoId().withMessage('Invalid lead ID'),
  body('name').optional().trim().isLength({ min: 2, max: 150 }).withMessage('Name must be 2–150 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('status')
    .optional()
    .isIn(['New', 'Contacted', 'Qualified', 'Lost'])
    .withMessage('Invalid status'),
  body('source')
    .optional()
    .isIn(['Website', 'Instagram', 'Referral'])
    .withMessage('Invalid source'),
];

router.get('/stats', getLeadStats);
router.get('/export/csv', exportLeadsCSV);
router.get('/', getLeads);
router.get('/:id', param('id').isMongoId(), validate, getLead);
router.post('/', leadValidation, validate, createLead);
router.put('/:id', updateLeadValidation, validate, updateLead);
router.delete('/:id', param('id').isMongoId(), validate, authorize('admin', 'sales'), deleteLead);

export default router;
