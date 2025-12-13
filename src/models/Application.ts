import mongoose, { Schema } from 'mongoose';
import { IApplication } from '../types';

const ApplicationSchema: Schema = new Schema({
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicantId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Applied', 'Reviewed', 'Rejected', 'Accepted'],
    default: 'Applied'
  },
  coverLetter: {
    type: String,
    maxlength: [2000, 'Cover letter cannot be more than 2000 characters']
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure one application per job per applicant
ApplicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });

export default mongoose.model<IApplication>('Application', ApplicationSchema);