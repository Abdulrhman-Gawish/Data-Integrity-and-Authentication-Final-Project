import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LogOut,
  Upload,
  Download,
  Edit2,
  Trash2,
  File,
  Search,
  Plus,
  X,
  User,
  Save,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";

import {
  getDocuments,
  uploadDocument,
  downloadDocument,
  updateDocument,
  deleteDocument,
  logout,
  getCurrentUser,
  updateUserProfile,
  verifyDocumentSignature,
} from "../services/api";

export default function Dashboard() {
  const [user, setUser] = useState({ name: "", email: "" });
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingDoc, setEditingDoc] = useState(null);
  const [newDocName, setNewDocName] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [verificationStatus, setVerificationStatus] = useState({});

  useEffect(() => {
    fetchUserData();
    fetchDocuments();
  }, []);

  const fetchUserData = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData.data.user);
      setProfileForm({
        name: userData.data.user.name,
        email: userData.data.user.email,
      });
    } catch (err) {
      console.error("Failed to fetch user data:", err);
    }
  };

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDocuments();
      setDocuments(data.data || []);
    } catch (err) {
      setError("Failed to load documents");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileEdit = () => {
    setIsEditingProfile(!isEditingProfile);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSave = async () => {
    try {
      const updatedUser = await updateUserProfile(profileForm);
      console.log("User: ", updatedUser); // debugging

      setUser(updatedUser.user);
      setIsEditingProfile(false);
      setError(null);
    } catch (err) {
      setError("Failed to update profile");
      console.error(err);
    }
  };

  const handleProfileCancel = () => {
    setIsEditingProfile(false);
    setProfileForm({
      name: user.name,
      email: user.email,
      password: user.password,
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setError(null);
    try {
      await uploadDocument(selectedFile);
      await fetchDocuments();
      setSelectedFile(null);
      const fileInput = document.getElementById("file-upload");
      if (fileInput) fileInput.value = "";
    } catch (err) {
      setError("Upload failed");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (docId) => {
    setIsLoading(true);
    setError(null);
    try {
      const blob = await downloadDocument(docId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "document");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Download failed");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySignature = async (docId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await verifyDocumentSignature(docId);
      console.log(response); // for dubgging

      setVerificationStatus((prev) => ({
        ...prev,
        [docId]: {
          status: response.status,
          message: response.message,
          verifiedAt: new Date().toISOString(),
        },
      }));
    } catch (err) {
      setError("Signature verification failed");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (doc) => {
    setEditingDoc(doc);
    setNewDocName(doc.originalName);
  };

  const cancelEdit = () => {
    setEditingDoc(null);
    setNewDocName("");
  };

  const saveEdit = async () => {
    if (!editingDoc || !newDocName.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      await updateDocument(editingDoc._id, { originalName: newDocName });
      setDocuments((docs) =>
        docs.map((doc) =>
          doc._id === editingDoc._id
            ? { ...doc, originalName: newDocName }
            : doc
        )
      );
      cancelEdit();
    } catch (err) {
      setError("Failed to update document");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (docId) => setShowConfirmDelete(docId);
  const cancelDelete = () => setShowConfirmDelete(null);

  const handleDelete = async (docId) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteDocument(docId);
      setDocuments((docs) => docs.filter((doc) => doc._id !== docId));
      setShowConfirmDelete(null);
    } catch (err) {
      setError("Failed to delete document");
      console.error("Full error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.originalName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.includes("pdf")) return "📄";
    if (mimeType.includes("word")) return "📝";
    if (mimeType.includes("sheet") || mimeType.includes("excel")) return "📊";
    if (mimeType.includes("image")) return "🖼️";
    return "📁";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-600 text-white py-4 px-6 shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Secure Document Vault</h1>
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <button
                className="flex items-center space-x-2 bg-indigo-700 hover:bg-indigo-800 py-1 px-3 rounded"
                onClick={handleProfileEdit}
              >
                <div className="flex items-center">
                  <User size={18} className="mr-2" />
                  <span className="font-medium">{user.name}</span>
                </div>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    isEditingProfile ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Profile Dropdown */}
              {isEditingProfile && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 p-4 border border-gray-200">
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">
                    User Profile
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={profileForm.name}
                        onChange={handleProfileChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={profileForm.email}
                        onChange={handleProfileChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-800"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={profileForm.password}
                        onChange={handleProfileChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-800"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={handleProfileCancel}
                        className="px-3 py-1 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleProfileSave}
                        className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
                      >
                        <Save size={16} className="mr-1" />
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex items-center bg-indigo-700 hover:bg-indigo-800 py-1 px-3 rounded text-sm transition-colors disabled:opacity-60"
            >
              <LogOut size={16} className="mr-1" />
              {loading ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </header>

      {/* Rest of the component remains the same */}
      <main className="flex-grow p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
          {/* File Upload Section */}
          <div className="mb-8 border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Upload New Document</h2>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded flex items-center"
              >
                <Plus size={18} className="mr-2" />
                {selectedFile ? "Change File" : "Select File"}
              </label>
              {selectedFile && (
                <div className="flex items-center">
                  <span className="text-sm text-gray-600">
                    {selectedFile.name}
                  </span>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <button
                onClick={handleUpload}
                disabled={!selectedFile || isLoading}
                className={`flex items-center py-2 px-4 rounded text-white ${
                  !selectedFile || isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                <Upload size={18} className="mr-2" />
                Upload
              </button>
            </div>
          </div>

          {/* Documents List Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Your Documents</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            {/* Error state */}
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                <p>{error}</p>
              </div>
            )}

            {/* Loading state */}
            {isLoading && !documents.length && (
              <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !documents.length && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <File size={48} className="mx-auto text-gray-400" />
                <p className="mt-4 text-gray-600">
                  You haven't uploaded any documents yet
                </p>
              </div>
            )}

            {/* Documents table */}
            {filteredDocuments.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Document
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Uploaded
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredDocuments.map((doc) => (
                      <tr key={doc._id} className="hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <span className="mr-2 text-lg">
                              {getFileIcon(doc.mimeType)}
                            </span>
                            <div>
                              {editingDoc && editingDoc._id === doc._id ? (
                                <input
                                  type="text"
                                  value={newDocName}
                                  onChange={(e) =>
                                    setNewDocName(e.target.value)
                                  }
                                  className="border rounded px-2 py-1 w-full"
                                  autoFocus
                                />
                              ) : (
                                <>
                                  <span className="font-medium text-gray-900 block">
                                    {doc.originalName}
                                  </span>
                                  {verificationStatus[doc._id] && (
                                    <span
                                      className={`text-xs ${
                                        verificationStatus[doc._id].status ===
                                        "success"
                                          ? "text-green-600"
                                          : "text-red-600"
                                      }`}
                                    >
                                      {verificationStatus[doc._id].message}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500">
                          {formatDate(doc.createdAt)}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500">
                          {doc.mimeType.split("/")[1].toUpperCase()}
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          {editingDoc && editingDoc._id === doc._id ? (
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={saveEdit}
                                className="bg-green-500 hover:bg-green-600 text-white p-1 rounded"
                                title="Save"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="bg-gray-400 hover:bg-gray-500 text-white p-1 rounded"
                                title="Cancel"
                              >
                                <X size={20} />
                              </button>
                            </div>
                          ) : showConfirmDelete === doc._id ? (
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleDelete(doc._id)}
                                className="bg-red-500 hover:bg-red-600 text-white p-1 rounded"
                                title="Confirm Delete"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={cancelDelete}
                                className="bg-gray-400 hover:bg-gray-500 text-white p-1 rounded"
                                title="Cancel Delete"
                              >
                                <X size={20} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-end space-x-1">
                              <button
                                onClick={() => handleDownload(doc._id)}
                                className="text-blue-500 hover:text-blue-700 p-1"
                                title="Download"
                              >
                                <Download size={18} />
                              </button>
                              <button
                                onClick={() => handleVerifySignature(doc._id)}
                                className="text-green-600 hover:text-green-800 p-1"
                                title="Verify Signature"
                                disabled={isLoading}
                              >
                                <ShieldCheck size={18} />
                              </button>
                              <button
                                onClick={() => startEdit(doc)}
                                className="text-indigo-500 hover:text-indigo-700 p-1"
                                title="Rename"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => confirmDelete(doc._id)}
                                className="text-red-500 hover:text-red-700 p-1"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-4 px-6 text-center text-gray-600 text-sm">
        <p>
          © 2025 Secure Document Vault. All documents are end-to-end encrypted.
        </p>
      </footer>
    </div>
  );
}
