import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// This endpoint creates an admin user if no users exist
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Check if any users already exist
    const userCount = await User.countDocuments();
    
    if (userCount > 0) {
      return NextResponse.json(
        { error: 'Users already exist. Admin setup not allowed.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, password, name } = body;

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
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

    // Create admin user
    const adminUser = new User({
      email: email.toLowerCase(),
      password,
      name: name.trim(),
      role: 'admin',
      department: 'IT Administration' // Default department for admin
    });

    await adminUser.save();

    console.log('Admin user created successfully');

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Admin setup error:', error);
    
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
