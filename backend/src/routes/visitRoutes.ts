import { Router } from 'express';
import { addEvidence, createVisit, deleteVisit, getVisit, listVisits, updateVisit } from '../controllers/visitController';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth } from '../middleware/auth';
import { uploadEvidence } from '../middleware/upload';

const router = Router();
router.use(requireAuth);
router.get('/', asyncHandler(listVisits));
router.post('/', asyncHandler(createVisit));
router.get('/:id', asyncHandler(getVisit));
router.put('/:id', asyncHandler(updateVisit));
router.delete('/:id', asyncHandler(deleteVisit));
router.post('/:id/evidence', uploadEvidence.single('evidence'), asyncHandler(addEvidence));

export default router;
