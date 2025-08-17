import { NextRequest } from 'next/server';
import { getTokenFromHeaders, verifyToken } from './jwt';
import connectDB from './mongodb';
import User from '@/models/User';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
    department: string;
  };
}

export async function authenticateUser(request: NextRequest) {
  try {
    await connectDB();

    // Get token from headers
    const token = getTokenFromHeaders(request.headers);
    
    if (!token) {
      return { error: 'Authorization token required', status: 401 };
    }

    // Verify token
    const payload = verifyToken(token);
    
    if (!payload) {
      return { error: 'Invalid or expired token', status: 401 };
    }

    // Get user data
    const user = await User.findById(payload.userId);
    
    if (!user || !user.isActive) {
      return { error: 'User not found or inactive', status: 404 };
    }

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
        department: user.department
      }
    };

  } catch (error: any) {
    console.error('Authentication error:', error);
    return { error: 'Authentication failed', status: 500 };
  }
}

export function hasRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

export function canAccessAudit(userRole: string, userDepartment: string, auditDepartment: string, auditAuditor: string, userId: string): boolean {
  // Admin can access all audits
  if (userRole === 'admin') {
    return true;
  }
  
  // Manager can access audits in their department
  if (userRole === 'manager' && userDepartment === auditDepartment) {
    return true;
  }
  
  // Auditor can access their own audits or audits in their department
  if (userRole === 'auditor') {
    return auditAuditor === userId || userDepartment === auditDepartment;
  }
  
  return false;
}
