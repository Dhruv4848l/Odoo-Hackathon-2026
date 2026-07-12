import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';

export default function DepartmentCategoryManager() {
  const [activeTab, setActiveTab] = useState('users'); // users, departments, categories
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Data lists
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);

  // Create User Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('Employee');
  const [department, setDepartment] = useState('');

  // Create Department Form State
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptDesc, setDeptDesc] = useState('');

  // Create Category Form State
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState('Emission');
  const [catDesc, setCatDesc] = useState('');

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [deptRes, catRes] = await Promise.all([
        axiosClient.get('/departments'),
        axiosClient.get('/categories')
      ]);

      if (deptRes.success) setDepartments(deptRes.data);
      if (catRes.success) setCategories(catRes.data);

      // Fetch users list (we can try to fetch, since only Admin can access)
      // Note: If user endpoint is handled by Dev B or C, we can still fetch or handle fallback.
      // For now, we can fetch users if there's an API, or fallback gracefully.
      try {
        const userRes = await axiosClient.get('/auth/me'); // simple check, or users query if implemented
        // Since get users list endpoint might be owned by other devs, we fallback gracefully.
      } catch (err) {}

    } catch (error) {
      setErrorMsg('Failed to load configuration lists.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username || !email || !password || !department) {
      setErrorMsg('Please fill in all user registration fields.');
      return;
    }

    try {
      setLoading(true);
      const res = await axiosClient.post('/auth/register', {
        username,
        email,
        password,
        role,
        department
      });

      if (res.success) {
        setSuccessMsg(`User "${username}" created successfully!`);
        setUsername('');
        setEmail('');
        setPassword('');
        setDepartment('');
        setRole('Employee');
      } else {
        setErrorMsg(res.message || 'Failed to create user.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error occurred while creating user.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!deptName || !deptCode) {
      setErrorMsg('Name and code are required.');
      return;
    }

    try {
      setLoading(true);
      const res = await axiosClient.post('/departments', {
        name: deptName,
        code: deptCode,
        description: deptDesc
      });

      if (res.success) {
        setSuccessMsg(`Department "${deptName}" created successfully!`);
        setDeptName('');
        setDeptCode('');
        setDeptDesc('');
        fetchData(); // reload
      } else {
        setErrorMsg(res.message || 'Failed to create department.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error creating department.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!catName || !catType) {
      setErrorMsg('Name and type are required.');
      return;
    }

    try {
      setLoading(true);
      const res = await axiosClient.post('/categories', {
        name: catName,
        type: catType,
        description: catDesc
      });

      if (res.success) {
        setSuccessMsg(`Category "${catName}" created successfully!`);
        setCatName('');
        setCatType('Emission');
        setCatDesc('');
        fetchData(); // reload
      } else {
        setErrorMsg(res.message || 'Failed to create category.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error creating category.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Title Header */}
        <div className="flex justify-between items-center bg-neutral-surface p-6 rounded-lg shadow-md border border-neutral-border">
          <div>
            <h1 className="text-3xl font-display font-bold text-brand-primary">⚙️ Admin Console</h1>
            <p className="text-sm text-neutral-textMuted mt-1">Manage system users, departments, and ESG categories</p>
          </div>
          <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-xs font-semibold uppercase tracking-wider rounded-full">
            Admin Access
          </span>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-neutral-surface p-1 rounded-lg border border-neutral-border shadow-sm">
          <button
            onClick={() => setActiveTab('users')}
            className={`w-1/3 py-2.5 text-center font-medium rounded-md transition-all ${
              activeTab === 'users'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-neutral-textMuted hover:text-neutral-text'
            }`}
          >
            Create & Manage Users
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`w-1/3 py-2.5 text-center font-medium rounded-md transition-all ${
              activeTab === 'departments'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-neutral-textMuted hover:text-neutral-text'
            }`}
          >
            Departments
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`w-1/3 py-2.5 text-center font-medium rounded-md transition-all ${
              activeTab === 'categories'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-neutral-textMuted hover:text-neutral-text'
            }`}
          >
            ESG Categories
          </button>
        </div>

        {/* Action Alerts */}
        {successMsg && (
          <div className="p-4 bg-brand-primary/10 border-l-4 border-brand-primary text-brand-primary rounded font-medium text-sm">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="p-4 bg-brand-alert/10 border-l-4 border-brand-alert text-brand-alert rounded font-medium text-sm">
            {errorMsg}
          </div>
        )}

        {/* Layout Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: Form Panel */}
          <div className="lg:col-span-1 bg-neutral-surface p-6 rounded-lg shadow-md border border-neutral-border">
            {activeTab === 'users' && (
              <form onSubmit={handleCreateUser} className="space-y-4">
                <h3 className="text-lg font-bold text-neutral-text border-b pb-2">Add New User</h3>
                <div>
                  <label className="block text-xs font-semibold text-neutral-textMuted uppercase mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full p-2.5 border border-neutral-border rounded bg-neutral-bg/25 focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-textMuted uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@company.com"
                    className="w-full p-2.5 border border-neutral-border rounded bg-neutral-bg/25 focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-textMuted uppercase mb-1">Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 border border-neutral-border rounded bg-neutral-bg/25 focus:ring-2 focus:ring-brand-primary/20"
                  />
                  <div className="flex items-center mt-2">
                    <input
                      id="admin-show-password"
                      type="checkbox"
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                      className="h-4 w-4 rounded border-neutral-border text-brand-primary focus:ring-brand-primary"
                    />
                    <label htmlFor="admin-show-password" className="ml-2 text-xs font-semibold text-neutral-textMuted uppercase cursor-pointer select-none">
                      Show Password
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-textMuted uppercase mb-1">Department</label>
                  <select
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2.5 border border-neutral-border rounded bg-neutral-bg/25 focus:ring-2 focus:ring-brand-primary/20"
                  >
                    <option value="">Select Department...</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-textMuted uppercase mb-1">System Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full p-2.5 border border-neutral-border rounded bg-neutral-bg/25 focus:ring-2 focus:ring-brand-primary/20"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                    <option value="Auditor">Auditor</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-primary text-white py-2.5 rounded hover:bg-brand-primary/95 font-medium transition active:scale-[0.98] disabled:opacity-50"
                >
                  Create User Account
                </button>
              </form>
            )}

            {activeTab === 'departments' && (
              <form onSubmit={handleCreateDepartment} className="space-y-4">
                <h3 className="text-lg font-bold text-neutral-text border-b pb-2">Add Department</h3>
                <div>
                  <label className="block text-xs font-semibold text-neutral-textMuted uppercase mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    placeholder="e.g. Sales"
                    className="w-full p-2.5 border border-neutral-border rounded bg-neutral-bg/25 focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-textMuted uppercase mb-1">Code</label>
                  <input
                    type="text"
                    required
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    placeholder="e.g. SLS"
                    className="w-full p-2.5 border border-neutral-border rounded bg-neutral-bg/25 focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-textMuted uppercase mb-1">Description</label>
                  <textarea
                    value={deptDesc}
                    onChange={(e) => setDeptDesc(e.target.value)}
                    placeholder="Department details..."
                    className="w-full p-2.5 border border-neutral-border rounded bg-neutral-bg/25 focus:ring-2 focus:ring-brand-primary/20 h-24"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-primary text-white py-2.5 rounded hover:bg-brand-primary/95 font-medium transition active:scale-[0.98] disabled:opacity-50"
                >
                  Create Department
                </button>
              </form>
            )}

            {activeTab === 'categories' && (
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <h3 className="text-lg font-bold text-neutral-text border-b pb-2">Add ESG Category</h3>
                <div>
                  <label className="block text-xs font-semibold text-neutral-textMuted uppercase mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="e.g. Recycling Rate"
                    className="w-full p-2.5 border border-neutral-border rounded bg-neutral-bg/25 focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-textMuted uppercase mb-1">ESG Stream Type</label>
                  <select
                    value={catType}
                    onChange={(e) => setCatType(e.target.value)}
                    className="w-full p-2.5 border border-neutral-border rounded bg-neutral-bg/25 focus:ring-2 focus:ring-brand-primary/20"
                  >
                    <option value="Emission">Environmental (Emission)</option>
                    <option value="Social">Social (CSR/Wellness)</option>
                    <option value="Governance">Governance (Audit/Compliance)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-textMuted uppercase mb-1">Description</label>
                  <textarea
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    placeholder="Category context..."
                    className="w-full p-2.5 border border-neutral-border rounded bg-neutral-bg/25 focus:ring-2 focus:ring-brand-primary/20 h-24"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-primary text-white py-2.5 rounded hover:bg-brand-primary/95 font-medium transition active:scale-[0.98] disabled:opacity-50"
                >
                  Create Category
                </button>
              </form>
            )}
          </div>

          {/* RIGHT: List view Panel */}
          <div className="lg:col-span-2 bg-neutral-surface p-6 rounded-lg shadow-md border border-neutral-border overflow-x-auto">
            {activeTab === 'users' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-neutral-text border-b pb-2">Active Org Departments</h3>
                <div className="text-sm text-neutral-textMuted mb-2">
                  Select a tab to view configured categories or departments. Registered users are managed through the database console or respective CSR/audit lists.
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b text-neutral-textMuted text-xs font-semibold uppercase">
                      <th className="py-2">Name</th>
                      <th className="py-2">Code</th>
                      <th className="py-2">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map((dept) => (
                      <tr key={dept._id} className="border-b last:border-0 hover:bg-neutral-bg/10">
                        <td className="py-3 font-medium text-brand-primary">{dept.name}</td>
                        <td className="py-3"><span className="px-2 py-0.5 bg-neutral-bg text-neutral-text rounded text-xs">{dept.code}</span></td>
                        <td className="py-3 text-neutral-textMuted text-xs">{dept.description || 'No description'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'departments' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-neutral-text border-b pb-2">Department Configuration</h3>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b text-neutral-textMuted text-xs font-semibold uppercase">
                      <th className="py-2">Name</th>
                      <th className="py-2">Code</th>
                      <th className="py-2">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map((dept) => (
                      <tr key={dept._id} className="border-b last:border-0 hover:bg-neutral-bg/10">
                        <td className="py-3 font-medium text-brand-primary">{dept.name}</td>
                        <td className="py-3"><span className="px-2 py-0.5 bg-neutral-bg text-neutral-text rounded text-xs">{dept.code}</span></td>
                        <td className="py-3 text-neutral-textMuted text-xs">{dept.description || 'No description'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'categories' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-neutral-text border-b pb-2">ESG Categories Configuration</h3>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b text-neutral-textMuted text-xs font-semibold uppercase">
                      <th className="py-2">Category Name</th>
                      <th className="py-2">Stream Type</th>
                      <th className="py-2">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr key={cat._id} className="border-b last:border-0 hover:bg-neutral-bg/10">
                        <td className="py-3 font-medium text-neutral-text">{cat.name}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            cat.type === 'Emission' ? 'bg-brand-primary/10 text-brand-primary' :
                            cat.type === 'Social' ? 'bg-brand-info/10 text-brand-info' :
                            'bg-brand-alert/10 text-brand-alert'
                          }`}>
                            {cat.type}
                          </span>
                        </td>
                        <td className="py-3 text-neutral-textMuted text-xs">{cat.description || 'No description'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

    </div>
  );
}
