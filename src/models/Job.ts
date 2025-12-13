import mongoose, { Schema } from 'mongoose';
import { IJob } from '../types';

const JobSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Please provide a job title'],
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a job description']
  },
  company: {
    type: String,
    required: [true, 'Please provide a company name'],
    maxlength: [100, 'Company name cannot be more than 100 characters']
  },
  location: {
    type: String,
    required: [true, 'Please provide a location']
  },
  salaryRange: {
    type: String,
    required: [true, 'Please provide a salary range']
  },
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Remote'],
    required: [true, 'Please provide a job type']
  },
  employerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for search optimization
JobSchema.index({ title: 'text', description: 'text', company: 'text' });
JobSchema.index({ location: 1 });
JobSchema.index({ jobType: 1 });
JobSchema.index({ createdAt: -1 });

export default mongoose.model<IJob>('Job', JobSchema);