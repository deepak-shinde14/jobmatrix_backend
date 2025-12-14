import Application from '../models/Application';
import Job from '../models/Job';
import { Types } from 'mongoose';

export class ApplicationService {
  async createApplication(jobId: string, applicantId: Types.ObjectId, coverLetter?: string) {
    const job = await Job.findById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      jobId,
      applicantId,
    });

    if (existingApplication) {
      throw new Error('Already applied for this job');
    }

    return await Application.create({
      jobId,
      applicantId,
      coverLetter,
    });
  }

  async getUserApplications(applicantId: Types.ObjectId) {
    return await Application.find({ applicantId })
      .populate('jobId', 'title company location jobType salaryRange')
      .sort('-appliedAt');
  }

  async getJobApplications(jobId: string, employerId: Types.ObjectId) {
    const job = await Job.findOne({ _id: jobId, employerId });
    if (!job) {
      throw new Error('Job not found or not authorized');
    }

    return await Application.find({ jobId })
      .populate('applicantId', 'name email')
      .sort('-appliedAt');
  }

  async updateApplicationStatus(id: string, status: 'Applied' | 'Reviewed' | 'Rejected' | 'Accepted', employerId: Types.ObjectId) {
    const application = await Application.findById(id).populate({
      path: 'jobId',
      select: 'employerId',
    });

    if (!application) {
      throw new Error('Application not found');
    }

    const job = application.jobId as any;
    if (job.employerId.toString() !== employerId.toString()) {
      throw new Error('Not authorized to update this application');
    }

    application.status = status;
    await application.save();
    return application;
  }

  async getApplicationStats(userId: Types.ObjectId, role: string) {
    if (role === 'EMPLOYER') {
      const jobs = await Job.find({ employerId: userId });
      const jobIds = jobs.map(job => job._id);

      const stats = await Application.aggregate([
        { $match: { jobId: { $in: jobIds } } },
        {
          $group: {
            _id: null,
            totalApplications: { $sum: 1 },
            applied: { $sum: { $cond: [{ $eq: ['$status', 'Applied'] }, 1, 0] } },
            reviewed: { $sum: { $cond: [{ $eq: ['$status', 'Reviewed'] }, 1, 0] } },
            rejected: { $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] } },
            accepted: { $sum: { $cond: [{ $eq: ['$status', 'Accepted'] }, 1, 0] } },
          },
        },
      ]);

      return stats[0] || {};
    } else {
      const stats = await Application.aggregate([
        { $match: { applicantId: userId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            applied: { $sum: { $cond: [{ $eq: ['$status', 'Applied'] }, 1, 0] } },
            reviewed: { $sum: { $cond: [{ $eq: ['$status', 'Reviewed'] }, 1, 0] } },
            rejected: { $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] } },
            accepted: { $sum: { $cond: [{ $eq: ['$status', 'Accepted'] }, 1, 0] } },
          },
        },
      ]);

      return stats[0] || {};
    }
  }
}