import Job from '../models/Job';
import Application from '../models/Application';
import { Types } from 'mongoose';

export class JobService {
  async createJob(data: any, employerId: Types.ObjectId) {
    return await Job.create({ ...data, employerId });
  }

  async getJobs(filters: any = {}) {
    const { search, location, jobType, page = 1, limit = 10 } = filters;
    
    const query: any = {};
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    if (jobType) {
      query.jobType = jobType;
    }
    
    const skip = (page - 1) * limit;
    
    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate('employerId', 'name email')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Job.countDocuments(query),
    ]);
    
    return {
      jobs,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async getJobById(id: string) {
    return await Job.findById(id).populate('employerId', 'name email company');
  }

  async updateJob(id: string, data: any, employerId: Types.ObjectId) {
    const job = await Job.findOne({ _id: id, employerId });
    if (!job) {
      throw new Error('Job not found or not authorized');
    }
    
    return await Job.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteJob(id: string, employerId: Types.ObjectId) {
    const job = await Job.findOne({ _id: id, employerId });
    if (!job) {
      throw new Error('Job not found or not authorized');
    }
    
    // Delete associated applications
    await Application.deleteMany({ jobId: id });
    
    await job.deleteOne();
    return true;
  }

  async getEmployerJobs(employerId: Types.ObjectId) {
    return await Job.find({ employerId }).sort('-createdAt');
  }
}