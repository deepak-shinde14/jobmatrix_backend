import { Request, Response } from 'express';
import Application from '../models/Application';
import Job from '../models/Job';
import { AuthenticatedRequest } from '../types';
import mongoose from 'mongoose';

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private/JobSeeker
export const createApplication = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { jobId, coverLetter } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user is employer (employers cannot apply)
    if (req.user?.role === 'EMPLOYER') {
      return res.status(403).json({ message: 'Employers cannot apply for jobs' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      jobId,
      applicantId: req.user?._id
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'Already applied for this job' });
    }

    // Create application
    const application = await Application.create({
      jobId,
      applicantId: req.user?._id,
      coverLetter
    });

    // Populate job details
    await application.populate('jobId', 'title company location');

    res.status(201).json({
      success: true,
      data: application
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Already applied for this job' });
    }
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    });
  }
};

// @desc    Get user's applications
// @route   GET /api/applications/me
// @access  Private/JobSeeker
export const getMyApplications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const applications = await Application.find({ 
      applicantId: req.user?._id 
    })
    .populate('jobId', 'title company location jobType salaryRange')
    .sort('-appliedAt');

    res.json({
      success: true,
      data: applications
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    });
  }
};

// @desc    Get applications for a job (employer only)
// @route   GET /api/applications/job/:jobId
// @access  Private/Employer
export const getJobApplications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { jobId } = req.params;

    // Check if job exists and belongs to employer
    const job = await Job.findOne({ 
      _id: jobId, 
      employerId: req.user?._id 
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found or not authorized' });
    }

    const applications = await Application.find({ jobId })
      .populate('applicantId', 'name email')
      .sort('-appliedAt');

    res.json({
      success: true,
      data: applications
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private/Employer
export const updateApplicationStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    // Find application
    const application = await Application.findById(id)
      .populate({
        path: 'jobId',
        select: 'employerId'
      });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if job belongs to employer
    const job = application.jobId as any;
    if (job.employerId.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    // Update status
    application.status = status;
    await application.save();

    res.json({
      success: true,
      data: application
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    });
  }
};

// @desc    Get application statistics
// @route   GET /api/applications/stats
// @access  Private
export const getApplicationStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    let stats;

    if (req.user?.role === 'EMPLOYER') {
      // Employer stats: applications per job
      const jobs = await Job.find({ employerId: req.user._id });
      const jobIds = jobs.map(job => job._id);

      stats = await Application.aggregate([
        { $match: { jobId: { $in: jobIds } } },
        { $group: { 
          _id: '$jobId', 
          totalApplications: { $sum: 1 },
          applied: { 
            $sum: { $cond: [{ $eq: ['$status', 'Applied'] }, 1, 0] } 
          },
          reviewed: { 
            $sum: { $cond: [{ $eq: ['$status', 'Reviewed'] }, 1, 0] } 
          },
          rejected: { 
            $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] } 
          },
          accepted: { 
            $sum: { $cond: [{ $eq: ['$status', 'Accepted'] }, 1, 0] } 
          }
        }}
      ]);
    } else {
      // Job seeker stats
      stats = await Application.aggregate([
        { $match: { applicantId: req.user?._id } },
        { $group: { 
          _id: null, 
          total: { $sum: 1 },
          applied: { 
            $sum: { $cond: [{ $eq: ['$status', 'Applied'] }, 1, 0] } 
          },
          reviewed: { 
            $sum: { $cond: [{ $eq: ['$status', 'Reviewed'] }, 1, 0] } 
          },
          rejected: { 
            $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] } 
          },
          accepted: { 
            $sum: { $cond: [{ $eq: ['$status', 'Accepted'] }, 1, 0] } 
          }
        }}
      ]);
    }

    res.json({
      success: true,
      data: stats[0] || {}
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    });
  }
};