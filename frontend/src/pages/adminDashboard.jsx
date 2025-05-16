import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  LogOut,
  Users,
  Activity,
  RefreshCw,
} from "lucide-react";
import {
  getAllUsers,
  createUser,
  updateUserRole,
  deleteUser,
  logout,
  getLogs,
} from "../services/api";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const [usersPage, setUsersPage] = useState(1);
  const [logsPage, setLogsPage] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);
  const [logsTotal, setLogsTotal] = useState(0);
  const limit = 10;

  const [logFilters, setLogFilters] = useState({
    action: "",
    entity: "",
    userId: "",
    startDate: "",
    endDate: "",
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllUsers({
        page: usersPage,
        limit,
      });
      console.log("teDate: ", response.data);
      
      setUsers(response.data);
      setUsersTotal(response.count);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: logsPage,
        limit,
        ...Object.fromEntries(
          Object.entries(logFilters).filter(([_, v]) => v !== "")
        ),
      };

      const response = await getLogs(params);
      console.log("Dataaaaaaaaaaaaaaaaaaaaaa: ", response.data)
      setLogs(response.data);
      setLogsTotal(response.total);

      if (response.currentPage !== logsPage) {
        setLogsPage(response.currentPage);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch logs");
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "logs") {
      fetchLogs();
    }
  }, [activeTab, usersPage, logsPage, logFilters]); // Added logFilters to dependencies

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setLogFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setLogsPage(1);
    fetchLogs();
  };

  const resetFilters = () => {
    setLogFilters({
      action: "",
      entity: "",
      userId: "",
      startDate: "",
      endDate: "",
    });
    setLogsPage(1);
    fetchLogs();
  };

  const createUserHandler = async () => {
    setLoading(true);
    setError(null);
    try {
      await createUser(formData);
      setModalOpen(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
      console.error("Error creating user:", err);
    } finally {
      setLoading(false);
    }
  };
  const updateUserRoleHandler = async () => {
    setLoading(true);
    setError(null);
    try {
      await updateUserRole(selectedUser._id, { role: formData.role });
      setModalOpen(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user");
      console.error("Error updating user:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteUserHandler = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    setLoading(true);
    setError(null);
    try {
      await deleteUser(id);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
      console.error("Error deleting user:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedUser) {
      updateUserRoleHandler();
    } else {
      createUserHandler();
    }
  };

  const openCreateModal = () => {
    setSelectedUser(null);
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "user",
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch (err) {
      console.error("Error during logout:", err);
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center text-gray-700 hover:text-gray-900"
          >
            <LogOut size={18} className="mr-1" />
            Logout
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            className={`px-4 py-2 ${
              activeTab === "users"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("users")}
          >
            <div className="flex items-center">
              <Users size={18} className="mr-2" />
              Users Management
            </div>
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === "logs"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("logs")}
          >
            <div className="flex items-center">
              <Activity size={18} className="mr-2" />
              Activity Logs
            </div>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Users Management Tab */}
        {activeTab === "users" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Users</h2>
              <button
                onClick={openCreateModal}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
              >
                <Plus size={18} className="mr-1" />
                Add User
              </button>
            </div>

            {/* Users table */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading && users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <RefreshCw
                            size={24}
                            className="animate-spin text-blue-500"
                          />
                        </div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => openEditModal(user)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => deleteUserHandler(user._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination for users */}
            <div className="mt-4 flex justify-between items-center">
              <div>
                <span className="text-gray-600 text-sm">
                  {usersTotal > 0
                    ? `Showing ${(usersPage - 1) * limit + 1} to ${Math.min(
                        usersPage * limit,
                        usersTotal
                      )} of ${usersTotal} results`
                    : "No results"}
                </span>
              </div>
              <div className="flex">
                <button
                  onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
                  disabled={usersPage === 1}
                  className={`px-3 py-1 border rounded-l ${
                    usersPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-blue-500 hover:bg-blue-50"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setUsersPage((p) => p + 1)}
                  disabled={usersPage * limit >= usersTotal}
                  className={`px-3 py-1 border border-l-0 rounded-r ${
                    usersPage * limit >= usersTotal
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-blue-500 hover:bg-blue-50"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === "logs" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Activity Logs</h2>

            {/* Filters */}
            <div className="bg-white shadow rounded-lg p-4 mb-4">
              <h3 className="text-lg font-medium mb-3">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Action
                  </label>
                  <select
                    name="action"
                    value={logFilters.action}
                    onChange={handleFilterChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                  >
                    <option value="">All Actions</option>
                    <option value="CREATE">Create</option>
                    <option value="READ">Read</option>
                    <option value="READ_ALL">Read All</option>
                    <option value="UPDATE">Update</option>
                    <option value="UPDATE_PROFILE">Update Profile</option>
                    <option value="DELETE">Delete</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Entity
                  </label>
                  <select
                    name="entity"
                    value={logFilters.entity}
                    onChange={handleFilterChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                  >
                    <option value="">All Entities</option>
                    <option value="User">User</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User ID
                  </label>
                  <input
                    type="text"
                    name="userId"
                    value={logFilters.userId}
                    onChange={handleFilterChange}
                    placeholder="Enter User ID"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={logFilters.startDate}
                    onChange={handleFilterChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={logFilters.endDate}
                    onChange={handleFilterChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={applyFilters}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2 flex items-center"
                  >
                    <Search size={16} className="mr-1" />
                    Apply Filters
                  </button>
                  <button
                    onClick={resetFilters}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded flex items-center"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Logs table */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading && logs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <RefreshCw
                            size={24}
                            className="animate-spin text-blue-500"
                          />
                        </div>
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No logs found
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              log.action === "CREATE"
                                ? "bg-green-100 text-green-800"
                                : log.action === "DELETE"
                                ? "bg-red-100 text-red-800"
                                : log.action === "UPDATE"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.entity}
                          {log.entityId && (
                            <span className="text-gray-500 text-xs">
                              {" "}
                              ({log.entityId})
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.userDetails?.name || "Unknown"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.ipAddress}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination for logs */}
            <div className="mt-4 flex justify-between items-center">
              <div>
                <span className="text-gray-600 text-sm">
                  {logsTotal > 0
                    ? `Showing ${(logsPage - 1) * limit + 1} to ${Math.min(
                        logsPage * limit,
                        logsTotal
                      )} of ${logsTotal} results`
                    : "No results"}
                </span>
              </div>
              <div className="flex">
                <button
                  onClick={() => setLogsPage((p) => Math.max(1, p - 1))}
                  disabled={logsPage === 1}
                  className={`px-3 py-1 border rounded-l ${
                    logsPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-blue-500 hover:bg-blue-50"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => {
                    setLogsPage((p) => p + 1);
                    // No need to call fetchLogs here - useEffect will handle it
                  }}
                  disabled={logsPage * limit >= logsTotal}
                  className={`px-3 py-1 border border-l-0 rounded-r ${
                    logsPage * limit >= logsTotal
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-blue-500 hover:bg-blue-50"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">
                {selectedUser
                  ? `Edit User: ${selectedUser.name}`
                  : "Add New User"}
              </h2>
              <form onSubmit={handleSubmit}>
                {!selectedUser && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required={!selectedUser}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required={!selectedUser}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required={!selectedUser}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                      />
                    </div>
                  </>
                )}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={16} className="animate-spin mr-1" />
                        Processing...
                      </>
                    ) : selectedUser ? (
                      "Update User"
                    ) : (
                      "Create User"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
