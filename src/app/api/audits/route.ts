import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Audit from '@/models/Audit';
import { authenticateUser, hasRole, canAccessAudit } from '@/lib/auth-middleware';

// GET /api/audits - Get all audits (with filtering and pagination)
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
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const department = searchParams.get('department');
    const auditType = searchParams.get('auditType');
    const riskLevel = searchParams.get('riskLevel');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query based on user role and permissions
    let query: any = { isActive: true };

    // Role-based filtering
    if (user.role === 'admin') {
      // Admin can see all audits
    } else if (user.role === 'manager') {
      // Manager can see audits in their department
      query.department = user.department;
    } else {
      // Auditor can see their own audits or audits in their department
      query.$or = [
        { auditor: user.id },
        { department: user.department }
      ];
    }

    // Apply filters
    if (status) query.status = status;
    if (department && user.role === 'admin') query.department = department;
    if (auditType) query.auditType = auditType;
    if (riskLevel) query.riskLevel = riskLevel;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const [audits, totalCount] = await Promise.all([
      Audit.find(query)
        .populate('auditor', 'name email department')
        .populate('manager', 'name email department')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Audit.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        audits,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error: any) {
    console.error('Get audits error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/audits - Create new audit
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

    const { user } = authResult;

    // Check if user can create audits
    if (!hasRole(user.role, ['admin', 'manager', 'auditor'])) {
      return NextResponse.json(
        { error: 'Insufficient permissions to create audits' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      auditType,
      department,
      manager,
      startDate,
      endDate,
      riskLevel,
      items = []
    } = body;

    // Validate required fields
    if (!title || !description || !auditType || !department || !startDate) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, auditType, department, startDate' },
        { status: 400 }
      );
    }

    // Non-admin users can only create audits in their department
    if (user.role !== 'admin' && department !== user.department) {
      return NextResponse.json(
        { error: 'You can only create audits in your own department' },
        { status: 403 }
      );
    }

    // Process audit items
    const processedItems = items.map((item: any) => ({
      ...item,
      createdBy: user.id
    }));

    // Create audit
    const audit = new Audit({
      title: title.trim(),
      description: description.trim(),
      auditType,
      department,
      auditor: user.id, // Set current user as auditor
      manager: manager || null,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      riskLevel: riskLevel || 'medium',
      items: processedItems
    });

    await audit.save();

    // Populate references before returning
    await audit.populate('auditor', 'name email department');
    if (audit.manager) {
      await audit.populate('manager', 'name email department');
    }

    return NextResponse.json({
      success: true,
      data: { audit }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create audit error:', error);

    // Handle validation errors
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
