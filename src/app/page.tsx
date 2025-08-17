"use client";

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
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api-client";

// Types
interface User {
    id: string;
    email: string;
    name: string;
    role: "admin" | "auditor" | "manager";
    department: string;
    createdAt?: Date;
    updatedAt?: Date;
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

// Auth Provider Component
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check for stored token and validate it
        const checkAuthStatus = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (token) {
                    apiClient.setToken(token);
                    const response = await apiClient.getCurrentUser();
                    if (response.success && response.data?.user) {
                        setUser(response.data.user);
                        router.push("/audit"); // Redirect to audit page if already logged in
                    } else {
                        // Token is invalid, clear it
                        localStorage.removeItem('auth_token');
                        apiClient.setToken(null);
                    }
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                // Clear invalid token
                localStorage.removeItem('auth_token');
                apiClient.setToken(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthStatus();
    }, [router]);

    const login = async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true);

        try {
            const response = await apiClient.login(email, password);
            
            if (response.success && response.data?.user) {
                setUser(response.data.user);
                localStorage.setItem("tata_auth_user", JSON.stringify(response.data.user));
                setIsLoading(false);
                router.push("/audit"); // Redirect to audit page after successful login
                return true;
            }

            setIsLoading(false);
            return false;
        } catch (error) {
            console.error('Login failed:', error);
            setIsLoading(false);
            return false;
        }
    };

    const register = async (
        email: string,
        password: string,
        name: string,
        department: string
    ): Promise<boolean> => {
        setIsLoading(true);

        try {
            const response = await apiClient.register(email, password, name, department);
            
            if (response.success && response.data?.user) {
                setUser(response.data.user);
                localStorage.setItem("tata_auth_user", JSON.stringify(response.data.user));
                setIsLoading(false);
                router.push("/audit"); // Redirect to audit page after successful registration
                return true;
            }

            setIsLoading(false);
            return false;
        } catch (error) {
            console.error('Registration failed:', error);
            setIsLoading(false);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("tata_auth_user");
        localStorage.removeItem('auth_token');
        apiClient.logout();
        router.push("/"); // Redirect to login page
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
                    Getting Started:
                </h4>
                <div
                    className="text-sm text-blue-700 dark:text-blue-300 space-y-1"
                    style={{
                        color: "color-mix(in srgb, var(--foreground) 70%, blue)",
                    }}
                >
                    <div>
                        Create an account by clicking "Create Account" above.
                    </div>
                    <div>
                        Your first user will be assigned the "auditor" role by default.
                    </div>
                    <div>
                        Make sure MongoDB is running and configured in .env.local
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

// Main Login Page Component
const LoginPage: React.FC = () => {
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

// Export wrapped with AuthProvider
const LoginPageWithProvider: React.FC = () => {
    return (
        <AuthProvider>
            <LoginPage />
        </AuthProvider>
    );
};

export default LoginPageWithProvider;
