import mongoose from 'mongoose';

export interface IAuditItem {
  id: string;
  title: string;
  description: string;
  category: 'compliance' | 'quality' | 'safety' | 'process' | 'security' | 'financial';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
  assignedTo?: mongoose.Types.ObjectId;
  findings: string;
  recommendations: string;
  evidence: string[];
  dueDate?: Date;
  completedDate?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAudit extends mongoose.Document {
  _id: string;
  title: string;
  description: string;
  auditType: 'internal' | 'external' | 'compliance' | 'quality' | 'safety';
  department: string;
  auditor: mongoose.Types.ObjectId;
  manager?: mongoose.Types.ObjectId;
  status: 'draft' | 'active' | 'completed' | 'archived';
  startDate: Date;
  endDate?: Date;
  completedDate?: Date;
  items: IAuditItem[];
  overallScore?: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const auditItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Audit item title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Audit item description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    enum: {
      values: ['compliance', 'quality', 'safety', 'process', 'security', 'financial'],
      message: 'Category must be one of: compliance, quality, safety, process, security, financial'
    },
    required: [true, 'Category is required']
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'critical'],
      message: 'Priority must be one of: low, medium, high, critical'
    },
    default: 'medium'
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'in-progress', 'completed', 'on-hold', 'cancelled'],
      message: 'Status must be one of: pending, in-progress, completed, on-hold, cancelled'
    },
    default: 'pending'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  findings: {
    type: String,
    trim: true,
    maxlength: [2000, 'Findings cannot exceed 2000 characters'],
    default: ''
  },
  recommendations: {
    type: String,
    trim: true,
    maxlength: [2000, 'Recommendations cannot exceed 2000 characters'],
    default: ''
  },
  evidence: [{
    type: String,
    trim: true,
    maxlength: [500, 'Evidence item cannot exceed 500 characters']
  }],
  dueDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    }
  }
});

const auditSchema = new mongoose.Schema<IAudit>(
  {
    title: {
      type: String,
      required: [true, 'Audit title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Audit description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    auditType: {
      type: String,
      enum: {
        values: ['internal', 'external', 'compliance', 'quality', 'safety'],
        message: 'Audit type must be one of: internal, external, compliance, quality, safety'
      },
      required: [true, 'Audit type is required']
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: {
        values: [
          'Quality Assurance',
          'IT Administration', 
          'Project Management',
          'Engineering',
          'Operations',
          'Human Resources',
          'Finance',
          'Manufacturing'
        ],
        message: 'Please select a valid department'
      }
    },
    auditor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Auditor is required']
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'active', 'completed', 'archived'],
        message: 'Status must be one of: draft, active, completed, archived'
      },
      default: 'draft'
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date
    },
    completedDate: {
      type: Date
    },
    items: [auditItemSchema],
    overallScore: {
      type: Number,
      min: [0, 'Overall score cannot be negative'],
      max: [100, 'Overall score cannot exceed 100']
    },
    riskLevel: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'critical'],
        message: 'Risk level must be one of: low, medium, high, critical'
      },
      default: 'medium'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Indexes for performance
auditSchema.index({ auditor: 1 });
auditSchema.index({ manager: 1 });
auditSchema.index({ department: 1 });
auditSchema.index({ status: 1 });
auditSchema.index({ auditType: 1 });
auditSchema.index({ riskLevel: 1 });
auditSchema.index({ startDate: 1 });
auditSchema.index({ isActive: 1 });

// Compound indexes
auditSchema.index({ auditor: 1, status: 1 });
auditSchema.index({ department: 1, status: 1 });
auditSchema.index({ createdAt: -1 }); // For sorting by newest first

// Pre-save middleware to calculate overall score
auditSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    const completedItems = this.items.filter(item => item.status === 'completed');
    if (completedItems.length > 0) {
      // Simple scoring: percentage of completed items
      this.overallScore = Math.round((completedItems.length / this.items.length) * 100);
    }
  }
  next();
});

const Audit = mongoose.models.Audit || mongoose.model<IAudit>('Audit', auditSchema);

export default Audit;
