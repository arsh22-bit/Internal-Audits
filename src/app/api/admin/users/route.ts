import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { authenticateUser, hasRole } from '@/lib/auth-middleware';

// GET /api/admin/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const authResult = await authenticateUser(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;

    // Check if user is admin
    if (!hasRole(user.role, ['admin'])) {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    // Fetch all users
    const users = await User.find({ isActive: true })
      .select('-password') // Exclude password field
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: { users }
    });

  } catch (error: any) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const authResult = await authenticateUser(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user: currentUser } = authResult;

    // Check if user is admin
    if (!hasRole(currentUser.role, ['admin'])) {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, password, name, role, department } = body;

    // Validate input
    if (!email || !password || !name || !role || !department) {
      return NextResponse.json(
        { error: 'All fields are required: email, password, name, role, department' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['admin', 'auditor', 'manager'].includes(role)) {
      return NextResponse.json(
        { error: 'Role must be admin, auditor, or manager' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      email: email.toLowerCase() 
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = new User({
      email: email.toLowerCase(),
      password,
      name: name.trim(),
      role,
      department
    });

    await newUser.save();

    // Return user data (password excluded by schema transform)
    const userData = {
      id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      department: newUser.department,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    };

    return NextResponse.json({
      success: true,
      data: { user: userData }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create user error:', error);

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: messages.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
