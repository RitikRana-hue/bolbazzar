'use client';

import { useState, useEffect } from 'react';
import {
    Search,
    MoreVertical,
    Eye,
    Ban,
    CheckCircle,
    Mail,
    Phone,
    Calendar,
    DollarSign
} from 'lucide-react';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'buyer' | 'seller' | 'admin';
    status: 'active' | 'suspended' | 'pending_verification';
    avatar: string;
    joinedAt: string;
    lastActive: string;
    totalOrders: number;
    totalSpent: number;
    totalSales?: number;
    verificationLevel: 'unverified' | 'email_verified' | 'phone_verified' | 'fully_verified';
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, searchTerm, roleFilter, statusFilter]);

    const fetchUsers = async () => {
        try {
            // Mock data - replace with actual API call
            const mockUsers: User[] = [
                {
                    id: '1',
                    name: 'John Doe',
                    email: 'john.doe@email.com',
                    role: 'buyer',
                    status: 'active',
                    avatar: 'https://via.placeholder.com/40',
                    joinedAt: '2024-01-10T00:00:00Z',
                    lastActive: '2024-01-15T10:30:00Z',
                    totalOrders: 15,
                    totalSpent: 2450.99,
                    verificationLevel: 'fully_verified'
                },
                {
                    id: '2',
                    name: 'TechStore Inc',
                    email: 'contact@techstore.com',
                    role: 'seller',
                    status: 'active',
                    avatar: 'https://via.placeholder.com/40',
                    joinedAt: '2023-12-01T00:00:00Z',
                    lastActive: '2024-01-15T14:20:00Z',
                    totalOrders: 89,
                    totalSpent: 0,
                    totalSales: 45670.50,
                    verificationLevel: 'fully_verified'
                },
                {
                    id: '3',
                    name: 'Jane Smith',
                    email: 'jane.smith@email.com',
                    role: 'buyer',
                    status: 'pending_verification',
                    avatar: 'https://via.placeholder.com/40',
                    joinedAt: '2024-01-14T00:00:00Z',
                    lastActive: '2024-01-15T09:15:00Z',
                    totalOrders: 2,
                    totalSpent: 199.99,
                    verificationLevel: 'email_verified'
                },
                {
                    id: '4',
                    name: 'Mike Wilson',
                    email: 'mike.wilson@email.com',
                    role: 'buyer',
                    status: 'suspended',
                    avatar: 'https://via.placeholder.com/40',
                    joinedAt: '2024-01-05T00:00:00Z',
                    lastActive: '2024-01-12T16:45:00Z',
                    totalOrders: 8,
                    totalSpent: 890.50,
                    verificationLevel: 'phone_verified'
                },
                {
                    id: '5',
                    name: 'Admin User',
                    email: 'admin@instasell.com',
                    role: 'admin',
                    status: 'active',
                    avatar: 'https://via.placeholder.com/40',
                    joinedAt: '2023-01-01T00:00:00Z',
                    lastActive: '2024-01-15T15:00:00Z',
                    totalOrders: 0,
                    totalSpent: 0,
                    verificationLevel: 'fully_verified'
                }
            ];

            setUsers(mockUsers);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = users;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Role filter
        if (roleFilter !== 'all') {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(user => user.status === statusFilter);
        }

        setFilteredUsers(filtered);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'suspended':
                return 'bg-red-100 text-red-800';
            case 'pending_verification':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-purple-100 text-purple-800';
            case 'seller':
                return 'bg-blue-100 text-blue-800';
            case 'buyer':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getVerificationIcon = (level: string) => {
        switch (level) {
            case 'fully_verified':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'phone_verified':
                return <Phone className="h-4 w-4 text-blue-500" />;
            case 'email_verified':
                return <Mail className="h-4 w-4 text-yellow-500" />;
            default:
                return <Eye className="h-4 w-4 text-gray-400" />;
        }
    };

    const suspendUser = async (userId: string) => {
        try {
            setUsers(prev => prev.map(user =>
                user.id === userId ? { ...user, status: 'suspended' } : user
            ));
            // TODO: API call
        } catch (error) {
            console.error('Failed to suspend user:', error);
        }
    };

    const activateUser = async (userId: string) => {
        try {
            setUsers(prev => prev.map(user =>
                user.id === userId ? { ...user, status: 'active' } : user
            ));
            // TODO: API call
        } catch (error) {
            console.error('Failed to activate user:', error);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600">Manage users, verify accounts, and handle suspensions</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Role Filter */}
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">All Roles</option>
                        <option value="buyer">Buyers</option>
                        <option value="seller">Sellers</option>
                        <option value="admin">Admins</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="pending_verification">Pending Verification</option>
                    </select>

                    {/* Export */}
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                        Export Users
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Verification
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Activity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Stats
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                className="w-10 h-10 rounded-full"
                                            />
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {user.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                                            {user.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {getVerificationIcon(user.verificationLevel)}
                                            <span className="ml-2 text-sm text-gray-600 capitalize">
                                                {user.verificationLevel.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div>
                                            <div className="flex items-center">
                                                <Calendar className="h-4 w-4 mr-1" />
                                                Joined {formatDate(user.joinedAt)}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                Last active {formatDate(user.lastActive)}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div>
                                            <div>{user.totalOrders} orders</div>
                                            <div className="flex items-center">
                                                <DollarSign className="h-3 w-3 mr-1" />
                                                {user.role === 'seller' && user.totalSales
                                                    ? `$${user.totalSales.toFixed(2)} sales`
                                                    : `$${user.totalSpent.toFixed(2)} spent`
                                                }
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => setSelectedUser(user)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>

                                            {user.status === 'active' ? (
                                                <button
                                                    onClick={() => suspendUser(user.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Ban className="h-4 w-4" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => activateUser(user.id)}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                </button>
                                            )}

                                            <button className="text-gray-600 hover:text-gray-900">
                                                <MoreVertical className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* User Detail Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">User Details</h2>
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Basic Info */}
                            <div className="flex items-center space-x-4">
                                <img
                                    src={selectedUser.avatar}
                                    alt={selectedUser.name}
                                    className="w-16 h-16 rounded-full"
                                />
                                <div>
                                    <h3 className="text-lg font-medium">{selectedUser.name}</h3>
                                    <p className="text-gray-600">{selectedUser.email}</p>
                                    <div className="flex items-center space-x-2 mt-2">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(selectedUser.role)}`}>
                                            {selectedUser.role}
                                        </span>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedUser.status)}`}>
                                            {selectedUser.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-gray-700">Total Orders</p>
                                    <p className="text-2xl font-bold text-gray-900">{selectedUser.totalOrders}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-gray-700">
                                        {selectedUser.role === 'seller' ? 'Total Sales' : 'Total Spent'}
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        ${selectedUser.role === 'seller' && selectedUser.totalSales
                                            ? selectedUser.totalSales.toFixed(2)
                                            : selectedUser.totalSpent.toFixed(2)
                                        }
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex space-x-3 pt-4 border-t border-gray-200">
                                {selectedUser.status === 'active' ? (
                                    <button
                                        onClick={() => {
                                            suspendUser(selectedUser.id);
                                            setSelectedUser(null);
                                        }}
                                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                                    >
                                        Suspend User
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            activateUser(selectedUser.id);
                                            setSelectedUser(null);
                                        }}
                                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                                    >
                                        Activate User
                                    </button>
                                )}

                                <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                                    Send Message
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}