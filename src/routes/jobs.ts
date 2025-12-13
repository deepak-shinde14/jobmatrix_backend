import express from 'express';
import { 
  getJobs, 
  getJob, 
  createJob, 
  updateJob, 
  deleteJob,
  getEmployerJobs
} from '../controllers/jobController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/', getJobs);
router.get('/:id', getJob);

// Protected routes
router.use(protect);

router.post('/', authorize('EMPLOYER'), createJob);
router.put('/:id', authorize('EMPLOYER'), updateJob);
router.delete('/:id', authorize('EMPLOYER'), deleteJob);
router.get('/employer/my-jobs', authorize('EMPLOYER'), getEmployerJobs);

export default router;