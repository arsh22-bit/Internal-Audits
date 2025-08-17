"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  PlusCircle,
  Search,
  Filter,
  FileText,
  Calendar,
  User,
  Badge,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  LogOut,
  BarChart3,
  Users,
  Target,
  Layers,
  BookOpen,
  Shield,
  Info,
  X
} from 'lucide-react';
import apiClient from '@/lib/api-client';

// Types
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'auditor' | 'manager';
  department: string;
}

interface Audit {
  id: string;
  title: string;
  description: string;
  auditType: 'internal' | 'external' | 'compliance' | 'quality' | 'safety';
  department: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  startDate: string;
  endDate?: string;
  completedDate?: string;
  overallScore?: number;
  auditor: {
    name: string;
    email: string;
  };
  manager?: {
    name: string;
    email: string;
  };
  items: any[];
  createdAt: string;
  updatedAt: string;
}

// Type definitions for the existing audit form
interface AuditCategory {
    id: string;
    title: string;
    icon: React.ReactNode;
    color: string;
    sections: string[];
}

interface FormField {
    name: string;
    label: string;
    type: "text" | "select" | "textarea" | "date" | "number";
    placeholder?: string;
    options?: string[];
    rows?: number;
    hint?: string;
}

interface FormData {
    [key: string]: string | number;
}

interface Progress {
    answeredQuestions: number;
    totalQuestions: number;
}

interface AuditFormProps {
    category: AuditCategory;
}

const InternalAuditDashboard: React.FC = () => {
    const [activeSection, setActiveSection] = useState<string>("categories");
    const [expandedCategories, setExpandedCategories] = useState<
        Record<string, boolean>
    >({});
    const [selectedAuditType, setSelectedAuditType] = useState<string>("all");

    const auditCategories: AuditCategory[] = [
        {
            id: "resource_tracker",
            title: "Resource Tracker Audit",
            icon: <Users className="w-5 h-5" />,
            color: "bg-blue-500",
            sections: [
                "Infrastructure Plan",
                "Human Resource Plan",
                "Training Plan",
            ],
        },
        {
            id: "acd_tracker",
            title: "ACD Tracker Audit",
            icon: <Target className="w-5 h-5" />,
            color: "bg-green-500",
            sections: ["Assumptions", "Constraints", "Dependencies"],
        },
        {
            id: "ci_review",
            title: "CI & Review Plan Audit",
            icon: <FileText className="w-5 h-5" />,
            color: "bg-purple-500",
            sections: [
                "Configuration Items",
                "Review Plans",
                "Baseline Management",
            ],
        },
        {
            id: "non_ci_records",
            title: "Non-CI & Records Audit",
            icon: <Layers className="w-5 h-5" />,
            color: "bg-orange-500",
            sections: [
                "Non-CI Management",
                "Records Management",
                "Access Rights",
            ],
        },
        {
            id: "lessons_learned",
            title: "Lessons Learned Audit",
            icon: <BookOpen className="w-5 h-5" />,
            color: "bg-indigo-500",
            sections: [
                "Best Practices",
                "Process Improvements",
                "Knowledge Transfer",
            ],
        },
        {
            id: "supplier_requirements",
            title: "Supplier & Requirements Audit",
            icon: <Shield className="w-5 h-5" />,
            color: "bg-red-500",
            sections: [
                "Requirement Providers",
                "Supplier Management",
                "Acquisition Tracking",
            ],
        },
    ];

    const toggleCategory = (categoryId: string): void => {
        setExpandedCategories((prev) => ({
            ...prev,
            [categoryId]: !prev[categoryId],
        }));
    };

    const AuditForm: React.FC<AuditFormProps> = ({ category }) => {
        const [formData, setFormData] = useState<FormData>({});
        const [showHint, setShowHint] = useState<string | null>(null);

        const handleInputChange = (
            field: string,
            value: string | number
        ): void => {
            setFormData((prev) => ({ ...prev, [field]: value }));
        };

        const toggleHint = (fieldName: string): void => {
            setShowHint(showHint === fieldName ? null : fieldName);
        };

        // Calculate progress dynamically
        const calculateProgress = (fields: FormField[]): Progress => {
            const totalQuestions = fields.length;
            const answeredQuestions = fields.filter((field) => {
                const value = formData[field.name];
                return value && value.toString().trim() !== "";
            }).length;

            return { answeredQuestions, totalQuestions };
        };

        const renderFormField = (field: FormField): React.ReactNode => {
            const baseClasses =
                "w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/70 backdrop-blur-sm font-medium shadow-sm hover:shadow-md";

            const value = formData[field.name] || "";

            switch (field.type) {
                case "select":
                    return (
                        <select
                            className={`${baseClasses} cursor-pointer`}
                            value={value}
                            onChange={(e) =>
                                handleInputChange(field.name, e.target.value)
                            }
                        >
                            <option value="" className="text-gray-500">
                                Select {field.label}
                            </option>
                            {field.options?.map((option) => (
                                <option
                                    key={option}
                                    value={option}
                                    className="text-gray-800"
                                >
                                    {option}
                                </option>
                            ))}
                        </select>
                    );
                case "textarea":
                    return (
                        <textarea
                            className={`${baseClasses} resize-none min-h-[120px]`}
                            rows={field.rows || 4}
                            placeholder={field.placeholder}
                            value={value}
                            onChange={(e) =>
                                handleInputChange(field.name, e.target.value)
                            }
                        />
                    );
                case "date":
                    return (
                        <input
                            type="date"
                            className={baseClasses}
                            value={value}
                            onChange={(e) =>
                                handleInputChange(field.name, e.target.value)
                            }
                        />
                    );
                case "number":
                    return (
                        <input
                            type="number"
                            className={baseClasses}
                            placeholder={field.placeholder}
                            value={value}
                            onChange={(e) =>
                                handleInputChange(
                                    field.name,
                                    parseInt(e.target.value) || ""
                                )
                            }
                        />
                    );
                default:
                    return (
                        <input
                            type="text"
                            className={baseClasses}
                            placeholder={field.placeholder}
                            value={value}
                            onChange={(e) =>
                                handleInputChange(field.name, e.target.value)
                            }
                        />
                    );
            }
        };

        const getFormFields = (categoryId: string): FormField[] => {
            switch (categoryId) {
                case "resource_tracker":
                    return [
                        {
                            name: "resourceType",
                            label: "Resource Type",
                            type: "select",
                            options: ["Software", "Hardware", "Others"],
                            hint: `Resource Type can be any of the following:
1. Software
2. Hardware  
3. Others

For each resource type, mention the details of resources required.

For Hardware (tools/machines/equipments):
Mention the hardware details used by the project with detailed specifications

Example:
Laptops, systems, assembly equipment/tools, testing tool, RAM, ROM, etc...

For software:
Mention the tools/IDE/Platform that are required by the project.

Example:
JIRA Tool Chain, MS Project, Crystal Ball, Minitab, Digitie tools used for verification/validation/simulation, tools used which are part of OS, Language Used/ to be used by project, VS 2010, EA, Qt, Eclipse, Rational DOORS, Rational Rhapsody, WindRiver Workbench, Windows 7 Linux , others platform related specific info.

For others:
If an additional resource is required such as infrastructure, Test facility which needs to be newly setup. For example: Laboratories

Note: Make sure that the resources mentioned here and which are required for testing are also mentioned in the STP document.
Project can refer to the Tool Database for identifying tools available in the organization. Tool Database is maintained in the following path in PULSE "Home » Business Process » 3. Process Repository » M. Tool Database".`,
                        },
                        {
                            name: "resourceRequired",
                            label: "Resource Required",
                            type: "text",
                            placeholder: "Specify the resource needed",
                            hint: "For each resource type, mention the details of resources required. Be specific about software versions, hardware specifications, or infrastructure requirements.",
                        },
                        {
                            name: "reason",
                            label: "Reason",
                            type: "textarea",
                            placeholder: "Explain why this resource is needed",
                            hint: `Mention the reason why resource is required.

Example:
Development, Testing, PM Activity Development Activity ( Elaborate, if possible ), Documentation, Version Controlling, other specifics required by project.

Reasons can be combined, if required.`,
                        },
                        {
                            name: "numberOfResources",
                            label: "No of resource required",
                            type: "number",
                            placeholder: "Enter quantity",
                            hint: "Mention the no of resources required for the project.",
                        },
                        {
                            name: "byWhen",
                            label: "By When",
                            type: "date",
                            hint: `Mention the phase / Date by when the Resource is required.

OR

Mention TBD or some reason, if the resources are required after some event has happened.`,
                        },
                        {
                            name: "allocationStatus",
                            label: "Resource allocated status",
                            type: "select",
                            options: ["Open", "Closed", "Pending", "On Hold"],
                            hint: "Mention status as Open or closed",
                        },
                        {
                            name: "remarks",
                            label: "Remarks",
                            type: "textarea",
                            placeholder: "Additional comments",
                            hint: `Mention details of status. Also, mention the impediments or reasons for delay if any.`,
                        },
                    ];
                case "acd_tracker":
                    return [
                        {
                            name: "type",
                            label: "Type",
                            type: "select",
                            options: ["Assumption", "Constraint", "Dependency"],
                            hint: "Select whether this is an Assumption (something we believe to be true), Constraint (limitation or restriction), or Dependency (reliance on external factors).",
                        },
                        {
                            name: "description",
                            label: "Description",
                            type: "textarea",
                            placeholder: "Detailed description",
                            hint: "Provide a clear and detailed description of the assumption, constraint, or dependency. Include context and potential impact.",
                        },
                        {
                            name: "riskId",
                            label: "Risk ID",
                            type: "text",
                            placeholder: "Risk identifier if applicable",
                            hint: "If this item is associated with a specific risk in your risk register, mention the Risk ID for traceability.",
                        },
                        {
                            name: "impact",
                            label: "Impact Level",
                            type: "select",
                            options: ["Low", "Medium", "High", "Critical"],
                            hint: "Assess the potential impact on the project if this assumption proves false, constraint becomes binding, or dependency fails.",
                        },
                        {
                            name: "mitigation",
                            label: "Mitigation Strategy",
                            type: "textarea",
                            placeholder: "How to address this item",
                            hint: "Describe the strategy to mitigate risks associated with this item. Include contingency plans and monitoring approaches.",
                        },
                        {
                            name: "owner",
                            label: "Owner",
                            type: "text",
                            placeholder: "Responsible person",
                            hint: "Name of the person responsible for monitoring and managing this assumption, constraint, or dependency.",
                        },
                        {
                            name: "status",
                            label: "Status",
                            type: "select",
                            options: [
                                "Open",
                                "In Progress",
                                "Resolved",
                                "Closed",
                            ],
                            hint: "Current status of the item. Open = newly identified, In Progress = being addressed, Resolved = solution implemented, Closed = no longer relevant.",
                        },
                    ];
                case "ci_review":
                    return [
                        {
                            name: "phase",
                            label: "Phase",
                            type: "select",
                            options: [
                                "Planning",
                                "Design",
                                "Development",
                                "Testing",
                                "Deployment",
                            ],
                            hint: "Select the project phase where this Configuration Item is being created or reviewed.",
                        },
                        {
                            name: "ciName",
                            label: "CI Name",
                            type: "text",
                            placeholder: "Configuration Item name",
                            hint: "Provide the exact name of the Configuration Item as it appears in the repository or documentation.",
                        },
                        {
                            name: "version",
                            label: "Version No",
                            type: "text",
                            placeholder: "Version identifier",
                            hint: "Current version number of the CI. Follow your organization's versioning convention (e.g., 1.0, v2.1, etc.).",
                        },
                        {
                            name: "location",
                            label: "Location",
                            type: "text",
                            placeholder: "Storage location/path",
                            hint: "Full path or location where the CI is stored (repository path, network location, etc.).",
                        },
                        {
                            name: "owner",
                            label: "Owner",
                            type: "text",
                            placeholder: "Responsible person",
                            hint: "Name of the person who owns and is responsible for maintaining this Configuration Item.",
                        },
                        {
                            name: "baselineDate",
                            label: "Baseline Date",
                            type: "date",
                            hint: "Date when this CI version was established as a baseline for the project.",
                        },
                        {
                            name: "approvalDate",
                            label: "Approval Date",
                            type: "date",
                            hint: "Date when this CI was formally approved by the designated authority.",
                        },
                        {
                            name: "reviewType",
                            label: "Review Type",
                            type: "select",
                            options: [
                                "Formal",
                                "Informal",
                                "Walkthrough",
                                "Inspection",
                            ],
                            hint: "Type of review conducted: Formal = structured process, Informal = casual review, Walkthrough = author-led, Inspection = defect-focused formal review.",
                        },
                    ];
                default:
                    return [
                        {
                            name: "itemName",
                            label: "Item Name",
                            type: "text",
                            placeholder: "Enter item name",
                            hint: "Provide a clear and descriptive name for this audit item.",
                        },
                        {
                            name: "description",
                            label: "Description",
                            type: "textarea",
                            placeholder: "Detailed description",
                            hint: "Provide comprehensive details about this item, including its purpose and relevance to the audit.",
                        },
                        {
                            name: "owner",
                            label: "Owner",
                            type: "text",
                            placeholder: "Responsible person",
                            hint: "Name of the person who is responsible for this item and can provide additional information if needed.",
                        },
                        {
                            name: "status",
                            label: "Status",
                            type: "select",
                            options: [
                                "Active",
                                "Inactive",
                                "Under Review",
                                "Approved",
                            ],
                            hint: "Current status of the item in the audit process.",
                        },
                    ];
            }
        };

        const fields = getFormFields(category.id);
        const progress = calculateProgress(fields);
        const progressPercentage =
            fields.length > 0
                ? (progress.answeredQuestions / progress.totalQuestions) * 100
                : 0;

        return (
            <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/50">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-t-2xl"></div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-bounce"></div>

                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div
                            className={`relative ${category.color} bg-gradient-to-br p-4 rounded-2xl text-white shadow-xl`}
                        >
                            {category.icon}
                            <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse"></div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                {category.title}
                            </h3>
                            <p className="text-gray-600 font-medium">
                                Complete all fields to submit the audit
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <div className="text-sm font-semibold text-gray-700 mb-1">
                                Questions Answered
                            </div>
                            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                {progress.answeredQuestions} /{" "}
                                {progress.totalQuestions}
                            </div>
                            <div className="text-xs text-gray-500">
                                {progress.totalQuestions -
                                    progress.answeredQuestions}{" "}
                                remaining
                            </div>
                        </div>
                        <div className="relative w-28 h-28">
                            <svg
                                className="w-28 h-28 transform -rotate-90"
                                viewBox="0 0 100 100"
                            >
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="35"
                                    stroke="#e5e7eb"
                                    strokeWidth="6"
                                    fill="transparent"
                                />
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="35"
                                    stroke="url(#gradient)"
                                    strokeWidth="6"
                                    fill="transparent"
                                    strokeDasharray={`${2 * Math.PI * 35}`}
                                    strokeDashoffset={`${
                                        2 *
                                        Math.PI *
                                        35 *
                                        (1 - progressPercentage / 100)
                                    }`}
                                    className="transition-all duration-700 ease-out"
                                    strokeLinecap="round"
                                />
                                <defs>
                                    <linearGradient
                                        id="gradient"
                                        x1="0%"
                                        y1="0%"
                                        x2="100%"
                                        y2="100%"
                                    >
                                        <stop offset="0%" stopColor="#3b82f6" />
                                        <stop
                                            offset="50%"
                                            stopColor="#8b5cf6"
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor="#06b6d4"
                                        />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        {Math.round(progressPercentage)}%
                                    </span>
                                    <div className="text-xs text-gray-500">
                                        Complete
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {fields.map((field, index) => (
                        <div
                            key={index}
                            className={`${
                                field.type === "textarea" ? "md:col-span-2" : ""
                            } space-y-3`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                        {index + 1}
                                    </span>
                                    <label className="block text-sm font-semibold text-gray-800">
                                        {field.label}
                                    </label>
                                </div>
                                {field.hint && (
                                    <button
                                        type="button"
                                        onClick={() => toggleHint(field.name)}
                                        className="group p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-all duration-200 hover:scale-110"
                                        title="Show help"
                                    >
                                        <Info className="w-4 h-4 group-hover:animate-pulse" />
                                    </button>
                                )}
                            </div>

                            {showHint === field.name && field.hint && (
                                <div className="relative mb-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-lg animate-fade-in">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-t-xl"></div>
                                    <button
                                        onClick={() => setShowHint(null)}
                                        className="absolute top-3 right-3 text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-1 rounded-full transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Info className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="text-sm text-blue-800 whitespace-pre-line pr-8 leading-relaxed">
                                            {field.hint}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="relative">
                                {renderFormField(field)}
                                {formData[field.name] &&
                                    formData[field.name].toString().trim() !==
                                        "" && (
                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                                            <CheckCircle className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between items-center gap-6 mt-10 pt-8 border-t border-gray-200">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-gray-700">
                            Progress:
                        </span>
                        <div className="relative w-40 h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 transition-all duration-700 ease-out rounded-full"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                        </div>
                        <span className="text-sm font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-full">
                            {progress.answeredQuestions}/
                            {progress.totalQuestions}
                        </span>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            className="px-8 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            💾 Save Draft
                        </button>
                        <button
                            type="button"
                            className={`px-8 py-3 rounded-xl transition-all duration-300 font-semibold shadow-lg transform hover:scale-105 ${
                                progress.answeredQuestions ===
                                progress.totalQuestions
                                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-green-200 animate-pulse"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                            disabled={
                                progress.answeredQuestions !==
                                progress.totalQuestions
                            }
                        >
                            {progress.answeredQuestions ===
                            progress.totalQuestions
                                ? "🚀 Submit Audit"
                                : "⏳ Complete All Fields"}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const AuditCategories: React.FC = () => (
        <div className="space-y-8">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                    Internal Audit Dashboard
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Select an audit category to begin your assessment. Track
                    your progress and ensure compliance with our quality
                    standards.
                </p>
                <div className="mt-6 flex justify-center">
                    <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {auditCategories.map((category, index) => {
                    const getFieldCount = (categoryId: string): number => {
                        switch (categoryId) {
                            case "resource_tracker":
                                return 7;
                            case "acd_tracker":
                                return 7;
                            case "ci_review":
                                return 8;
                            case "non_ci_records":
                                return 4;
                            case "lessons_learned":
                                return 4;
                            case "supplier_requirements":
                                return 4;
                            default:
                                return 4;
                        }
                    };

                    const getRealisticProgress = (categoryId: string) => {
                        const total = getFieldCount(categoryId);
                        return { answered: 0, total };
                    };

                    const progress = getRealisticProgress(category.id);
                    const progressPercent =
                        progress.total > 0
                            ? (progress.answered / progress.total) * 100
                            : 0;

                    return (
                        <div
                            key={category.id}
                            className="group relative bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-white/50"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent pointer-events-none"></div>

                            <div
                                className={`relative ${category.color} bg-gradient-to-br p-6 overflow-hidden`}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

                                <div className="relative flex items-center justify-between text-white">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                            {category.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">
                                                {category.title}
                                            </h3>
                                            <p className="text-white/80 text-sm">
                                                Quality Assessment
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs opacity-90 font-medium">
                                            Questions
                                        </div>
                                        <div className="font-bold text-2xl">
                                            {progress.answered}/{progress.total}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 relative">
                                    <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                                        <div
                                            className="h-full bg-gradient-to-r from-white to-white/80 transition-all duration-700 ease-out"
                                            style={{
                                                width: `${progressPercent}%`,
                                            }}
                                        ></div>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full animate-pulse"></div>
                                </div>
                            </div>

                            <div className="relative p-6">
                                <div className="space-y-3 mb-6">
                                    {category.sections.map(
                                        (section, sectionIndex) => (
                                            <div
                                                key={sectionIndex}
                                                className="flex items-center gap-3 group/item"
                                            >
                                                <div
                                                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                                        progressPercent > 0 &&
                                                        sectionIndex <
                                                            Math.ceil(
                                                                (progress.answered /
                                                                    progress.total) *
                                                                    category
                                                                        .sections
                                                                        .length
                                                            )
                                                            ? "bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg scale-110"
                                                            : "bg-gradient-to-r from-gray-300 to-gray-400"
                                                    }`}
                                                >
                                                    {progressPercent > 0 &&
                                                        sectionIndex <
                                                            Math.ceil(
                                                                (progress.answered /
                                                                    progress.total) *
                                                                    category
                                                                        .sections
                                                                        .length
                                                            ) && (
                                                            <div className="w-full h-full bg-white/50 rounded-full animate-ping"></div>
                                                        )}
                                                </div>
                                                <span className="text-sm text-gray-700 font-medium group-hover/item:text-gray-900 transition-colors">
                                                    {section}
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>

                                <div className="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
                                    <span className="text-sm font-semibold text-gray-700">
                                        {progressPercent === 100
                                            ? "✅ Complete"
                                            : progressPercent > 0
                                            ? `🔄 ${Math.round(
                                                  progressPercent
                                              )}% Complete`
                                            : "🚀 Ready to Start"}
                                    </span>
                                    <span className="text-xs text-gray-500 font-medium bg-white px-2 py-1 rounded-full">
                                        {progress.total - progress.answered}{" "}
                                        remaining
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setActiveSection(category.id)
                                    }
                                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 group-hover:animate-pulse"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <span>🎯 Start Audit</span>
                                        <span className="text-lg">→</span>
                                    </span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-16 text-center">
                <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-white/70 px-4 py-2 rounded-full">
                    <span>🔒 Secure</span>
                    <span>•</span>
                    <span>📊 Compliant</span>
                    <span>•</span>
                    <span>⚡ Efficient</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="text-white font-bold text-xl">
                                        T
                                    </span>
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    Tata Advanced Systems
                                </h1>
                                <p className="text-sm text-gray-600 font-medium">
                                    Internal Audit Management System
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Admin Panel Link - Only show for admins */}
                            <a
                                href="/admin"
                                className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            >
                                <Settings className="w-4 h-4" />
                                Admin Panel
                            </a>
                            
                            <div className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl px-4 py-3 shadow-md border border-gray-200/50">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <span className="text-sm font-semibold text-gray-800">
                                        Admin User
                                    </span>
                                    <div className="text-xs text-gray-500">
                                        System Administrator
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center gap-3 text-sm mb-8">
                    <button
                        type="button"
                        onClick={() => setActiveSection("categories")}
                        className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                            activeSection === "categories"
                                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105"
                                : "bg-white/70 text-gray-600 hover:bg-white hover:shadow-md"
                        }`}
                    >
                        🏢 Audit Categories
                    </button>
                    {activeSection !== "categories" && (
                        <>
                            <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full animate-pulse"></div>
                            <span className="text-gray-800 font-semibold bg-white/70 px-3 py-1 rounded-lg">
                                {auditCategories.find(
                                    (cat) => cat.id === activeSection
                                )?.title || "Audit Form"}
                            </span>
                        </>
                    )}
                </div>

                {activeSection === "categories" ? (
                    <AuditCategories />
                ) : (
                    <AuditForm
                        category={
                            auditCategories.find(
                                (cat) => cat.id === activeSection
                            )!
                        }
                    />
                )}
            </div>
        </div>
    );
};

export default InternalAuditDashboard;
