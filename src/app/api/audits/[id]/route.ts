import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Audit from '@/models/Audit';
import { authenticateUser, canAccessAudit } from '@/lib/auth-middleware';
import mongoose from 'mongoose';

// GET /api/audits/[id] - Get single audit
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid audit ID' },
        { status: 400 }
      );
    }

    // Find audit
    const audit = await Audit.findOne({ _id: id, isActive: true })
      .populate('auditor', 'name email department')
      .populate('manager', 'name email department')
      .populate('items.assignedTo', 'name email')
      .lean();

    if (!audit) {
      return NextResponse.json(
        { error: 'Audit not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    const hasAccess = canAccessAudit(
      user.role,
      user.department,
      audit.department,
      audit.auditor._id.toString(),
      user.id
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { audit }
    });

  } catch (error: any) {
    console.error('Get audit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/audits/[id] - Update audit
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid audit ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Find audit first to check permissions
    const existingAudit = await Audit.findOne({ _id: id, isActive: true });

    if (!existingAudit) {
      return NextResponse.json(
        { error: 'Audit not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    const hasAccess = canAccessAudit(
      user.role,
      user.department,
      existingAudit.department,
      existingAudit.auditor.toString(),
      user.id
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Process items if provided
    if (body.items) {
      body.items = body.items.map((item: any, index: number) => {
        // Keep existing item data if updating, otherwise set createdBy
        const existingItem = existingAudit.items[index];
        return {
          ...item,
          createdBy: existingItem?.createdBy || user.id,
          // Set completion date if status changed to completed
          completedDate: item.status === 'completed' && existingItem?.status !== 'completed' 
            ? new Date() 
            : existingItem?.completedDate
        };
      });
    }

    // Update audit
    const updatedAudit = await Audit.findByIdAndUpdate(
      id,
      {
        ...body,
        // Set completion date if status changed to completed
        completedDate: body.status === 'completed' && existingAudit.status !== 'completed'
          ? new Date()
          : existingAudit.completedDate
      },
      { 
        new: true, 
        runValidators: true 
      }
    )
      .populate('auditor', 'name email department')
      .populate('manager', 'name email department')
      .populate('items.assignedTo', 'name email');

    return NextResponse.json({
      success: true,
      data: { audit: updatedAudit }
    });

  } catch (error: any) {
    console.error('Update audit error:', error);

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

// DELETE /api/audits/[id] - Delete audit (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid audit ID' },
        { status: 400 }
      );
    }

    // Find audit first to check permissions
    const audit = await Audit.findOne({ _id: id, isActive: true });

    if (!audit) {
      return NextResponse.json(
        { error: 'Audit not found' },
        { status: 404 }
      );
    }

    // Only admin or audit creator can delete
    if (user.role !== 'admin' && audit.auditor.toString() !== user.id) {
      return NextResponse.json(
        { error: 'Only audit creator or admin can delete audits' },
        { status: 403 }
      );
    }

    // Soft delete by setting isActive to false
    await Audit.findByIdAndUpdate(id, { isActive: false });

    return NextResponse.json({
      success: true,
      message: 'Audit deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete audit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
