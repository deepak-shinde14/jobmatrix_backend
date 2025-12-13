import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('EMPLOYER', 'JOB_SEEKER').required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const jobSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).required(),
  company: Joi.string().min(2).max(100).required(),
  location: Joi.string().required(),
  salaryRange: Joi.string().required(),
  jobType: Joi.string().valid('Full-time', 'Part-time', 'Remote').required(),
});

export const applicationSchema = Joi.object({
  jobId: Joi.string().required(),
  coverLetter: Joi.string().max(2000),
});

export const updateApplicationStatusSchema = Joi.object({
  status: Joi.string().valid('Applied', 'Reviewed', 'Rejected', 'Accepted').required(),
});

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    next();
  };
};