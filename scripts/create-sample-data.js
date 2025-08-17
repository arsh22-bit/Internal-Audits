#!/usr/bin/env node

// Script to create sample audit data for testing
// Run with: node scripts/create-sample-data.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// Import models
const User = require('../models/User');
const { Audit, AuditItem } = require('../models/Audit');

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

async function createSampleUsers() {
    console.log('Creating sample users...');
    
    const users = [
        {
            email: 'admin@tasl.com',
            password: await bcrypt.hash('admin123', 12),
            name: 'System Administrator',
            role: 'admin',
            department: 'IT'
        },
        {
            email: 'auditor1@tasl.com',
            password: await bcrypt.hash('auditor123', 12),
            name: 'John Smith',
            role: 'auditor',
            department: 'Quality Assurance'
        },
        {
            email: 'auditor2@tasl.com',
            password: await bcrypt.hash('auditor123', 12),
            name: 'Sarah Johnson',
            role: 'auditor',
            department: 'Compliance'
        },
        {
            email: 'manager1@tasl.com',
            password: await bcrypt.hash('manager123', 12),
            name: 'Michael Brown',
            role: 'manager',
            department: 'Operations'
        },
        {
            email: 'manager2@tasl.com',
            password: await bcrypt.hash('manager123', 12),
            name: 'Emily Davis',
            role: 'manager',
            department: 'Engineering'
        }
    ];

    for (const userData of users) {
        const existingUser = await User.findOne({ email: userData.email });
        if (!existingUser) {
            const user = new User(userData);
            await user.save();
            console.log(`Created user: ${userData.email}`);
        } else {
            console.log(`User already exists: ${userData.email}`);
        }
    }
}

async function createSampleAudits() {
    console.log('Creating sample audits...');
    
    // Get users for assignment
    const admin = await User.findOne({ email: 'admin@tasl.com' });
    const auditor1 = await User.findOne({ email: 'auditor1@tasl.com' });
    const auditor2 = await User.findOne({ email: 'auditor2@tasl.com' });
    const manager1 = await User.findOne({ email: 'manager1@tasl.com' });
    const manager2 = await User.findOne({ email: 'manager2@tasl.com' });

    const audits = [
        {
            title: 'Q4 2024 Internal Security Audit',
            description: 'Comprehensive security audit covering network infrastructure, access controls, and data protection measures.',
            auditType: 'internal',
            department: 'IT',
            status: 'active',
            riskLevel: 'high',
            startDate: new Date('2024-12-01'),
            endDate: new Date('2024-12-31'),
            auditor: auditor1._id,
            manager: manager1._id,
            createdBy: admin._id
        },
        {
            title: 'ISO 9001:2015 Compliance Review',
            description: 'Annual compliance audit to ensure adherence to ISO 9001:2015 quality management standards.',
            auditType: 'compliance',
            department: 'Quality Assurance',
            status: 'completed',
            riskLevel: 'medium',
            startDate: new Date('2024-10-01'),
            endDate: new Date('2024-11-15'),
            completedDate: new Date('2024-11-12'),
            overallScore: 87,
            auditor: auditor2._id,
            manager: manager2._id,
            createdBy: admin._id
        },
        {
            title: 'Financial Controls Assessment',
            description: 'External audit of financial controls and reporting processes.',
            auditType: 'external',
            department: 'Finance',
            status: 'draft',
            riskLevel: 'critical',
            startDate: new Date('2025-01-15'),
            auditor: auditor1._id,
            manager: manager1._id,
            createdBy: admin._id
        },
        {
            title: 'Manufacturing Safety Inspection',
            description: 'Safety audit of manufacturing floor operations and equipment.',
            auditType: 'safety',
            department: 'Manufacturing',
            status: 'active',
            riskLevel: 'high',
            startDate: new Date('2024-12-10'),
            endDate: new Date('2024-12-20'),
            auditor: auditor2._id,
            manager: manager2._id,
            createdBy: admin._id
        },
        {
            title: 'Product Quality Assurance Review',
            description: 'Quality audit of production processes and final product inspection procedures.',
            auditType: 'quality',
            department: 'Quality Assurance',
            status: 'completed',
            riskLevel: 'medium',
            startDate: new Date('2024-11-01'),
            endDate: new Date('2024-11-30'),
            completedDate: new Date('2024-11-28'),
            overallScore: 92,
            auditor: auditor1._id,
            manager: manager1._id,
            createdBy: admin._id
        },
        {
            title: 'Vendor Management Process Audit',
            description: 'Review of vendor selection, evaluation, and management processes.',
            auditType: 'internal',
            department: 'Procurement',
            status: 'archived',
            riskLevel: 'low',
            startDate: new Date('2024-09-01'),
            endDate: new Date('2024-09-30'),
            completedDate: new Date('2024-09-28'),
            overallScore: 78,
            auditor: auditor2._id,
            manager: manager2._id,
            createdBy: admin._id
        }
    ];

    for (const auditData of audits) {
        const existingAudit = await Audit.findOne({ title: auditData.title });
        if (!existingAudit) {
            const audit = new Audit(auditData);
            await audit.save();
            console.log(`Created audit: ${auditData.title}`);

            // Create sample audit items for some audits
            if (auditData.status === 'completed') {
                await createSampleAuditItems(audit._id);
            }
        } else {
            console.log(`Audit already exists: ${auditData.title}`);
        }
    }
}

async function createSampleAuditItems(auditId) {
    const sampleItems = [
        {
            audit: auditId,
            category: 'Security Controls',
            question: 'Are access controls properly implemented and documented?',
            response: 'Yes, access controls are implemented using role-based authentication with regular reviews.',
            score: 4,
            riskLevel: 'low',
            status: 'completed',
            evidence: ['Access control policy document', 'User access review logs'],
            recommendations: ['Consider implementing multi-factor authentication for admin accounts']
        },
        {
            audit: auditId,
            category: 'Data Protection',
            question: 'Is sensitive data properly encrypted in transit and at rest?',
            response: 'Data encryption is implemented for data at rest, but some legacy systems lack transit encryption.',
            score: 3,
            riskLevel: 'medium',
            status: 'completed',
            evidence: ['Encryption policy', 'System configuration screenshots'],
            recommendations: ['Upgrade legacy systems to support TLS encryption', 'Implement end-to-end encryption for all data transfers']
        },
        {
            audit: auditId,
            category: 'Compliance',
            question: 'Are all regulatory requirements being met?',
            response: 'Most regulatory requirements are met, with minor gaps in documentation.',
            score: 4,
            riskLevel: 'low',
            status: 'completed',
            evidence: ['Compliance checklist', 'Regulatory filing records'],
            recommendations: ['Update documentation to address remaining gaps']
        }
    ];

    for (const itemData of sampleItems) {
        const item = new AuditItem(itemData);
        await item.save();
    }
    
    console.log(`Created ${sampleItems.length} audit items for audit ${auditId}`);
}

async function main() {
    try {
        await connectDB();
        await createSampleUsers();
        await createSampleAudits();
        console.log('Sample data creation completed successfully!');
        console.log('\nLogin credentials:');
        console.log('Admin: admin@tasl.com / admin123');
        console.log('Auditor: auditor1@tasl.com / auditor123');
        console.log('Manager: manager1@tasl.com / manager123');
        process.exit(0);
    } catch (error) {
        console.error('Error creating sample data:', error);
        process.exit(1);
    }
}

main();
