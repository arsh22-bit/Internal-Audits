'use client'

import React, { useState, createContext, useContext, useEffect } from "react";
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    User,
    Shield,
    CheckCircle,
    AlertCircle,
    ArrowRight,
    Building,
} from "lucide-react";

// Types
interface User {
    id: string;
    email: string;
    name: string;
    role: "admin" | "auditor" | "manager";
    department: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    register: (
        email: string,
        password: string,
        name: string,
        department: string
    ) => Promise<boolean>;
    logout: () => void;
    isLoading: boolean;
}

// Auth Context
const AuthContext = createContext<AuthContextType | null>(null);

// Mock user database
const mockUsers = [
    {
        id: "1",
        email: "admin@tata.com",
        password: "admin123",
        name: "Admin User",
        role: "admin",
        department: "IT Administration",
    },
    {
        id: "2",
        email: "auditor@tata.com",
        password: "audit123",
        name: "Quality Auditor",
        role: "auditor",
        department: "Quality Assurance",
    },
    {
        id: "3",
        email: "manager@tata.com",
        password: "manager123",
        name: "Project Manager",
        role: "manager",
        department: "Project Management",
    },
];

// Auth Provider Component
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("tata_auth_user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const foundUser = mockUsers.find(
            (u) => u.email === email && u.password === password
        );

        if (foundUser) {
            const userData: User = {
                id: foundUser.id,
                email: foundUser.email,
                name: foundUser.name,
                role: foundUser.role as "admin" | "auditor" | "manager",
                department: foundUser.department,
            };

            setUser(userData);
            localStorage.setItem("tata_auth_user", JSON.stringify(userData));
            setIsLoading(false);
            return true;
        }

        setIsLoading(false);
        return false;
    };

    const register = async (
        email: string,
        password: string,
        name: string,
        department: string
    ): Promise<boolean> => {
        setIsLoading(true);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const existingUser = mockUsers.find((u) => u.email === email);
        if (existingUser) {
            setIsLoading(false);
            return false;
        }

        const newUser: User = {
            id: Date.now().toString(),
            email,
            name,
            role: "auditor",
            department,
        };

        const newUserEntry = {
            id: newUser.id,
            email: newUser.email,
            password: password,
            name: newUser.name,
            role: "auditor",
            department: newUser.department,
        };

        mockUsers.push(newUserEntry);

        setUser(newUser);
        localStorage.setItem("tata_auth_user", JSON.stringify(newUser));
        setIsLoading(false);
        return true;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("tata_auth_user");
    };

    return (
        <AuthContext.Provider
            value={{ user, login, register, logout, isLoading }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Hook to use auth
const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};

// Login Component
const LoginForm: React.FC<{ onToggleMode: () => void }> = ({
    onToggleMode,
}) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useAuth();

    const handleSubmit = async () => {
        setError("");
        setIsSubmitting(true);

        if (!email || !password) {
            setError("Please fill in all fields");
            setIsSubmitting(false);
            return;
        }

        const success = await login(email, password);

        if (!success) {
            setError("Invalid email or password");
        }

        setIsSubmitting(false);
    };

    return (
        <div className="w-full max-w-md">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <Shield className="w-8 h-8 text-white" />
                </div>
                <h2
                    className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent"
                    style={{ color: "var(--foreground)" }}
                >
                    Welcome Back
                </h2>
                <p
                    className="text-gray-600 dark:text-gray-400 mt-2"
                    style={{ color: "var(--foreground)", opacity: 0.7 }}
                >
                    Sign in to access the Internal Audit System
                </p>
            </div>

            <div className="space-y-6">
                {error && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label
                            className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                            style={{ color: "var(--foreground)" }}
                        >
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="w-5 h-5 absolute left-4 top-4 text-gray-400 dark:text-gray-500" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 focus:border-blue-500 transition-all duration-300 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm text-gray-900 dark:text-gray-100"
                                style={{
                                    backgroundColor:
                                        "color-mix(in srgb, var(--background) 70%, white)",
                                    color: "var(--foreground)",
                                    borderColor:
                                        "color-mix(in srgb, var(--foreground) 30%, transparent)",
                                }}
                                placeholder="Enter your email"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                            style={{ color: "var(--foreground)" }}
                        >
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="w-5 h-5 absolute left-4 top-4 text-gray-400 dark:text-gray-500" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 focus:border-blue-500 transition-all duration-300 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm text-gray-900 dark:text-gray-100"
                                style={{
                                    backgroundColor:
                                        "color-mix(in srgb, var(--background) 70%, white)",
                                    color: "var(--foreground)",
                                    borderColor:
                                        "color-mix(in srgb, var(--foreground) 30%, transparent)",
                                }}
                                placeholder="Enter your password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                >
                    {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Signing in...
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2">
                            Sign In
                            <ArrowRight className="w-5 h-5" />
                        </div>
                    )}
                </button>
            </div>

            <div className="mt-6 text-center">
                <p
                    className="text-gray-600 dark:text-gray-400"
                    style={{ color: "var(--foreground)", opacity: 0.8 }}
                >
                    Don't have an account?{" "}
                    <button
                        onClick={onToggleMode}
                        className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                        Create Account
                    </button>
                </p>
            </div>

            <div
                className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200 dark:border-blue-800 rounded-xl"
                style={{
                    backgroundColor:
                        "color-mix(in srgb, var(--background) 90%, blue)",
                    borderColor:
                        "color-mix(in srgb, var(--foreground) 20%, blue)",
                }}
            >
                <h4
                    className="font-semibold text-blue-800 dark:text-blue-200 mb-2"
                    style={{
                        color: "color-mix(in srgb, var(--foreground) 80%, blue)",
                    }}
                >
                    Demo Credentials:
                </h4>
                <div
                    className="text-sm text-blue-700 dark:text-blue-300 space-y-1"
                    style={{
                        color: "color-mix(in srgb, var(--foreground) 70%, blue)",
                    }}
                >
                    <div>
                        <strong>Admin:</strong> admin@tata.com / admin123
                    </div>
                    <div>
                        <strong>Auditor:</strong> auditor@tata.com / audit123
                    </div>
                    <div>
                        <strong>Manager:</strong> manager@tata.com / manager123
                    </div>
                </div>
            </div>
        </div>
    );
};

// Register Component
const RegisterForm: React.FC<{ onToggleMode: () => void }> = ({
    onToggleMode,
}) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        department: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register } = useAuth();

    const departments = [
        "Quality Assurance",
        "IT Administration",
        "Project Management",
        "Engineering",
        "Operations",
        "Human Resources",
        "Finance",
        "Manufacturing",
    ];

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        setError("");
        setIsSubmitting(true);

        if (
            !formData.name ||
            !formData.email ||
            !formData.password ||
            !formData.department
        ) {
            setError("Please fill in all fields");
            setIsSubmitting(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setIsSubmitting(false);
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            setIsSubmitting(false);
            return;
        }

        const success = await register(
            formData.email,
            formData.password,
            formData.name,
            formData.department
        );

        if (!success) {
            setError("Email already exists");
        }

        setIsSubmitting(false);
    };

    return (
        <div className="w-full max-w-md">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <User className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Create Account
                </h2>
                <p className="text-gray-600 mt-2">
                    Join the Internal Audit System
                </p>
            </div>

            <div className="space-y-6">
                {error && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Full Name
                        </label>
                        <div className="relative">
                            <User className="w-5 h-5 absolute left-4 top-4 text-gray-400" />
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) =>
                                    handleChange("name", e.target.value)
                                }
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300 bg-white/70 backdrop-blur-sm"
                                placeholder="Enter your full name"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="w-5 h-5 absolute left-4 top-4 text-gray-400" />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    handleChange("email", e.target.value)
                                }
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300 bg-white/70 backdrop-blur-sm"
                                placeholder="Enter your email"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Department
                        </label>
                        <div className="relative">
                            <Building className="w-5 h-5 absolute left-4 top-4 text-gray-400" />
                            <select
                                value={formData.department}
                                onChange={(e) =>
                                    handleChange("department", e.target.value)
                                }
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300 bg-white/70 backdrop-blur-sm"
                            >
                                <option value="">Select your department</option>
                                {departments.map((dept) => (
                                    <option key={dept} value={dept}>
                                        {dept}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="w-5 h-5 absolute left-4 top-4 text-gray-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={(e) =>
                                    handleChange("password", e.target.value)
                                }
                                className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300 bg-white/70 backdrop-blur-sm"
                                placeholder="Create a password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <Lock className="w-5 h-5 absolute left-4 top-4 text-gray-400" />
                            <input
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) =>
                                    handleChange(
                                        "confirmPassword",
                                        e.target.value
                                    )
                                }
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300 bg-white/70 backdrop-blur-sm"
                                placeholder="Confirm your password"
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                >
                    {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Creating Account...
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2">
                            Create Account
                            <CheckCircle className="w-5 h-5" />
                        </div>
                    )}
                </button>
            </div>

            <div className="mt-6 text-center">
                <p className="text-gray-600">
                    Already have an account?{" "}
                    <button
                        onClick={onToggleMode}
                        className="text-green-600 font-semibold hover:text-green-700 transition-colors"
                    >
                        Sign In
                    </button>
                </p>
            </div>
        </div>
    );
};

// Main Auth Component
const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4"
            style={{
                background: "var(--background)",
                color: "var(--foreground)",
            }}
        >
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 dark:from-blue-600/10 dark:to-purple-600/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 dark:from-indigo-600/10 dark:to-pink-600/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 dark:from-cyan-600/5 dark:to-blue-600/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="text-center lg:text-left">
                        <div className="mb-8">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-6 shadow-2xl">
                                <span className="text-white font-bold text-2xl">
                                    T
                                </span>
                            </div>
                            <h1
                                className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-4"
                                style={{ color: "var(--foreground)" }}
                            >
                                Tata Advanced Systems
                            </h1>
                            <p
                                className="text-xl text-gray-600 dark:text-gray-400 mb-8"
                                style={{
                                    color: "var(--foreground)",
                                    opacity: 0.7,
                                }}
                            >
                                Internal Audit Management System
                            </p>
                            <div
                                className="space-y-4 text-gray-600 dark:text-gray-400"
                                style={{
                                    color: "var(--foreground)",
                                    opacity: 0.8,
                                }}
                            >
                                <div className="flex items-center gap-3 justify-center lg:justify-start">
                                    <CheckCircle className="w-6 h-6 text-green-500" />
                                    <span>
                                        Secure audit management platform
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 justify-center lg:justify-start">
                                    <CheckCircle className="w-6 h-6 text-green-500" />
                                    <span>Real-time progress tracking</span>
                                </div>
                                <div className="flex items-center gap-3 justify-center lg:justify-start">
                                    <CheckCircle className="w-6 h-6 text-green-500" />
                                    <span>Compliance & quality assurance</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <div
                            className="w-full max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/50 dark:border-gray-700/50"
                            style={{
                                backgroundColor:
                                    "color-mix(in srgb, var(--background) 80%, transparent)",
                                borderColor:
                                    "color-mix(in srgb, var(--foreground) 20%, transparent)",
                            }}
                        >
                            {isLogin ? (
                                <LoginForm
                                    onToggleMode={() => setIsLogin(false)}
                                />
                            ) : (
                                <RegisterForm
                                    onToggleMode={() => setIsLogin(true)}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Dashboard Component - Integrated Audit System
const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [activeSection, setActiveSection] = useState<string>("categories");

    const auditCategories = [
        {
            id: "resource_tracker",
            title: "Resource Tracker Audit",
            icon: <User className="w-5 h-5" />,
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
            icon: <Shield className="w-5 h-5" />,
            color: "bg-green-500",
            sections: ["Assumptions", "Constraints", "Dependencies"],
        },
        {
            id: "ci_review",
            title: "CI & Review Plan Audit",
            icon: <CheckCircle className="w-5 h-5" />,
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
            icon: <Building className="w-5 h-5" />,
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
            icon: <User className="w-5 h-5" />,
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

    const AuditCategories = () => (
        <div className="space-y-8">
            <div className="text-center mb-12">
                <h2
                    className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent mb-4"
                    style={{ color: "var(--foreground)" }}
                >
                    Internal Audit Dashboard
                </h2>
                <p
                    className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
                    style={{ color: "var(--foreground)", opacity: 0.8 }}
                >
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

                    const progress = {
                        answered: 0,
                        total: getFieldCount(category.id),
                    };
                    const progressPercent = 0;

                    return (
                        <div
                            key={category.id}
                            className="group relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-white/50 dark:border-gray-700/50"
                            style={{
                                backgroundColor:
                                    "color-mix(in srgb, var(--background) 70%, white)",
                                borderColor:
                                    "color-mix(in srgb, var(--foreground) 20%, transparent)",
                                animationDelay: `${index * 100}ms`,
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/50 dark:from-gray-700/50 to-transparent pointer-events-none"></div>

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
                                                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-300 to-gray-400 transition-all duration-300"></div>
                                                <span
                                                    className="text-sm text-gray-700 dark:text-gray-300 font-medium group-hover/item:text-gray-900 dark:group-hover/item:text-gray-100 transition-colors"
                                                    style={{
                                                        color: "var(--foreground)",
                                                        opacity: 0.8,
                                                    }}
                                                >
                                                    {section}
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>

                                <div
                                    className="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/50 rounded-xl"
                                    style={{
                                        backgroundColor:
                                            "color-mix(in srgb, var(--background) 90%, blue)",
                                    }}
                                >
                                    <span
                                        className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                                        style={{ color: "var(--foreground)" }}
                                    >
                                        🚀 Ready to Start
                                    </span>
                                    <span
                                        className="text-xs text-gray-500 dark:text-gray-400 font-medium bg-white dark:bg-gray-700 px-2 py-1 rounded-full"
                                        style={{
                                            backgroundColor:
                                                "var(--background)",
                                            color: "var(--foreground)",
                                            opacity: 0.7,
                                        }}
                                    >
                                        {progress.total} remaining
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
                                        <ArrowRight className="w-5 h-5" />
                                    </span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-16 text-center">
                <div
                    className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-white/70 dark:bg-gray-800/70 px-4 py-2 rounded-full"
                    style={{
                        backgroundColor:
                            "color-mix(in srgb, var(--background) 70%, white)",
                        color: "var(--foreground)",
                        opacity: 0.7,
                    }}
                >
                    <span>🔒 Secure</span>
                    <span>•</span>
                    <span>📊 Compliant</span>
                    <span>•</span>
                    <span>⚡ Efficient</span>
                </div>
            </div>
        </div>
    );

    const AuditForm = ({ categoryId }: { categoryId: string }) => {
        const category = auditCategories.find((cat) => cat.id === categoryId);
        if (!category) return null;

        return (
            <div
                className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/50 dark:border-gray-700/50"
                style={{
                    backgroundColor:
                        "color-mix(in srgb, var(--background) 90%, white)",
                    borderColor:
                        "color-mix(in srgb, var(--foreground) 20%, transparent)",
                }}
            >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-t-2xl"></div>

                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div
                            className={`relative ${category.color} bg-gradient-to-br p-4 rounded-2xl text-white shadow-xl`}
                        >
                            {category.icon}
                        </div>
                        <div>
                            <h3
                                className="text-2xl font-bold text-gray-900 dark:text-gray-100"
                                style={{ color: "var(--foreground)" }}
                            >
                                {category.title}
                            </h3>
                            <p
                                className="text-gray-600 dark:text-gray-400 font-medium"
                                style={{
                                    color: "var(--foreground)",
                                    opacity: 0.7,
                                }}
                            >
                                Complete the audit assessment
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setActiveSection("categories")}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        style={{
                            backgroundColor: "var(--background)",
                            color: "var(--foreground)",
                            borderColor:
                                "color-mix(in srgb, var(--foreground) 30%, transparent)",
                        }}
                    >
                        ← Back to Categories
                    </button>
                </div>

                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        {category.icon}
                    </div>
                    <h4
                        className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2"
                        style={{ color: "var(--foreground)" }}
                    >
                        {category.title}
                    </h4>
                    <p
                        className="text-gray-600 dark:text-gray-400"
                        style={{ color: "var(--foreground)", opacity: 0.7 }}
                    >
                        This audit form is ready for implementation. The full
                        form interface with dynamic progress tracking and
                        validation will be integrated here.
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
            style={{ background: "var(--background)" }}
        >
            <div
                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50 dark:border-gray-700/50"
                style={{
                    backgroundColor:
                        "color-mix(in srgb, var(--background) 80%, transparent)",
                    borderColor:
                        "color-mix(in srgb, var(--foreground) 20%, transparent)",
                }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-xl">
                                    T
                                </span>
                            </div>
                            <div>
                                <h1
                                    className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent"
                                    style={{ color: "var(--foreground)" }}
                                >
                                    Tata Advanced Systems
                                </h1>
                                <p
                                    className="text-sm text-gray-600 dark:text-gray-400 font-medium"
                                    style={{
                                        color: "var(--foreground)",
                                        opacity: 0.7,
                                    }}
                                >
                                    Internal Audit Management System
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div
                                className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl px-4 py-3 shadow-md border border-gray-200/50 dark:border-gray-600/50"
                                style={{
                                    backgroundColor:
                                        "color-mix(in srgb, var(--background) 90%, gray)",
                                    borderColor:
                                        "color-mix(in srgb, var(--foreground) 30%, transparent)",
                                }}
                            >
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <span
                                        className="text-sm font-semibold text-gray-800 dark:text-gray-200"
                                        style={{ color: "var(--foreground)" }}
                                    >
                                        {user?.name}
                                    </span>
                                    <div
                                        className="text-xs text-gray-500 dark:text-gray-400"
                                        style={{
                                            color: "var(--foreground)",
                                            opacity: 0.6,
                                        }}
                                    >
                                        {user?.department}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                style={{
                                    backgroundColor: "var(--background)",
                                    color: "var(--foreground)",
                                    borderColor:
                                        "color-mix(in srgb, var(--foreground) 30%, transparent)",
                                }}
                            >
                                Logout
                            </button>
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
                                : "bg-white/70 dark:bg-gray-800/70 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md"
                        }`}
                        style={
                            activeSection !== "categories"
                                ? {
                                      backgroundColor:
                                          "color-mix(in srgb, var(--background) 70%, white)",
                                      color: "var(--foreground)",
                                  }
                                : {}
                        }
                    >
                        🏢 Audit Categories
                    </button>
                    {activeSection !== "categories" && (
                        <>
                            <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full animate-pulse"></div>
                            <span
                                className="text-gray-800 dark:text-gray-200 font-semibold bg-white/70 dark:bg-gray-800/70 px-3 py-1 rounded-lg"
                                style={{
                                    backgroundColor:
                                        "color-mix(in srgb, var(--background) 70%, white)",
                                    color: "var(--foreground)",
                                }}
                            >
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
                    <AuditForm categoryId={activeSection} />
                )}
            </div>
        </div>
    );
};

// Main App Component
const App: React.FC = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    return user ? <Dashboard /> : <AuthPage />;
};

// Root component with provider
const AuthenticatedAuditApp: React.FC = () => {
    return (
        <AuthProvider>
            <App />
        </AuthProvider>
    );
};

export default AuthenticatedAuditApp;