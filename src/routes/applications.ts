import express from 'express';
import {
  createApplication,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  getApplicationStats
} from '../controllers/applicationController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.use(protect);

// Job seeker routes
router.post('/', authorize('JOB_SEEKER'), createApplication);
router.get('/me', authorize('JOB_SEEKER'), getMyApplications);

// Employer routes
router.get('/job/:jobId', authorize('EMPLOYER'), getJobApplications);
router.put('/:id/status', authorize('EMPLOYER'), updateApplicationStatus);

// Both roles
router.get('/stats', getApplicationStats);

export default router;