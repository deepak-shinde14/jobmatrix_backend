import User from '../models/User';
import { generateTokens } from '../utils/jwt';
import { IUser } from '../types';

export class AuthService {
  async register(name: string, email: string, password: string, role: string) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    const tokens = generateTokens(user._id, user.role, user.email);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens,
    };
  }

  async login(email: string, password: string) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const tokens = generateTokens(user._id, user.role, user.email);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens,
    };
  }

  async getUserById(id: string) {
    return await User.findById(id).select('-password');
  }
}
