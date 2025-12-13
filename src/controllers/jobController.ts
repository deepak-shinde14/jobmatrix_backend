import { Request, Response } from 'express';
import Job from '../models/Job';
import Application from '../models/Application';
import { AuthenticatedRequest } from '../types';
import mongoose from 'mongoose';

// @desc    Get all jobs with filters
// @route   GET /api/jobs
// @access  Public
export const getJobs = async (req: Request, res: Response) => {
  try {
    const { 
      search, 
      location, 
      jobType, 
      minSalary, 
      maxSalary,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    const query: any = {};

    // Text search
    if (search) {
      query.$text = { $search: search as string };
    }

    // Filters
    if (location) {
      query.location = { $regex: location as string, $options: 'i' };
    }

    if (jobType) {
      query.jobType = jobType as string;
    }

    // Salary range filter (assuming salaryRange is stored as string like "$50k-$80k")
    // You might want to adjust this based on your actual salary format
    if (minSalary || maxSalary) {
      // This is a simplified implementation
      query.salaryRange = {};
      // Implement actual salary parsing based on your format
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination
    const total = await Job.countDocuments(query);

    // Get jobs
    const jobs = await Job.find(query)
      .sort(sort as string)
      .skip(skip)
      .limit(limitNum)
      .populate('employerId', 'name email');

    res.json({
      success: true,
      data: jobs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
export const getJob = async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.id).populate('employerId', 'name email company');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({
      success: true,
      data: job
    });
  } catch (error: any) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    });
  }
};

// @desc    Create job
// @route   POST /api/jobs
// @access  Private/Employer
export const createJob = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const jobData = {
      ...req.body,
      employerId: req.user?._id
    };

    const job = await Job.create(jobData);

    res.status(201).json({
      success: true,
      data: job
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private/Employer
export const updateJob = async (req: AuthenticatedRequest, res: Response) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check ownership
    if (job.employerId.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: job
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private/Employer
export const deleteJob = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check ownership
    if (job.employerId.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    // Delete associated applications
    await Application.deleteMany({ jobId: job._id });

    await job.deleteOne();

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    });
  }
};

// @desc    Get employer's jobs
// @route   GET /api/jobs/employer/my-jobs
// @access  Private/Employer
export const getEmployerJobs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const jobs = await Job.find({ employerId: req.user?._id }).sort('-createdAt');

    res.json({
      success: true,
      data: jobs
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    });
  }
};