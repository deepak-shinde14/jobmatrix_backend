import { Request } from 'express';
import { Types } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'EMPLOYER' | 'JOB_SEEKER';
  phone?: string;
  bio?: string;
  profilePicture?: string;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IJob {
  _id: Types.ObjectId;
  title: string;
  description: string;
  company: string;
  location: string;
  salaryRange: string;
  jobType: 'Full-time' | 'Part-time' | 'Remote';
  employerId: Types.ObjectId;
  createdAt: Date;
}

export interface IApplication {
  _id: Types.ObjectId;
  jobId: Types.ObjectId;
  applicantId: Types.ObjectId;
  status: 'Applied' | 'Reviewed' | 'Rejected' | 'Accepted';
  appliedAt: Date;
  coverLetter?: string;
}

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  userId: string;
  role: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}