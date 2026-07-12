import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api`  
  : "http://localhost:5000/api";

function Layout({ children }) {
  const navigate = useNavigate();
  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav className="navbar" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
        <div className="nav-logo" style={{ fontSize: '1.4rem', fontWeight: '800' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>Proud Senior Parichay</Link>
        </div>
        <button className="profile-btn" onClick={() => navigate('/login')} title="Login" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="8" r="5" fill="#475569"/>
            <path d="M3 20C3 15.578 7.03 12 12 12C16.97 12 21 15.578 21 20" stroke="#475569" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </nav>
      <div className="container" style={{ padding: '2rem 1rem', flex: 1, maxWidth: '1550px', width: '100%', margin: '0 auto' }}>
        {children}
      </div>
    </div>
  );
}

function HomePage() {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', marginTop: '2rem' }}>
      <h2 style={{ fontSize: '2.2rem', color: '#0f172a', fontWeight: '800' }}>Proud Senior Parichay</h2>
      <p style={{ maxWidth: '600px', margin: '1.5rem auto', lineHeight: '1.7', color: '#475569' }}>
        A specialized identification and verification ecosystem built to manage the safety, profiles, and quick authorization workflow logs for senior citizens.
      </p>
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '2.5rem' }}>
        <Link to="/login"><button className="btn" style={{ padding: '0.75rem 2rem', fontWeight: '600' }}>Access Console</button></Link>
        <Link to="/user-dashboard"><button className="btn" style={{ backgroundColor: '#475569', padding: '0.75rem 2rem', fontWeight: '600' }}>Enrollment Form</button></Link>
      </div>
    </div>
  );
}

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { username, password });
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate(res.data.role === 'admin' ? '/admin' : '/user-dashboard');
    } catch (err) { 
      alert("Invalid username or password combination.");
    }
  };

  return (
    <div className="card" style={{ maxWidth: '420px', margin: '5rem auto', padding: '2.5rem 2rem' }}>
      <h3 style={{ fontSize: '1.75rem', fontWeight: '800', textAlign: 'center', marginBottom: '2rem', color: '#0f172a' }}>System Sign-In</h3>
      <form onSubmit={handleLogin}>
        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem', display: 'block' }}>Username</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
        </div>
        <div className="form-group" style={{ marginBottom: '2rem' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem', display: 'block' }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
        </div>
        <button type="submit" className="btn" style={{ width: '100%', padding: '0.8rem', fontWeight: '700' }}>Login</button>
      </form>
    </div>
  );
}

function EnrollmentForm({ onFormSubmit }) {
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [searchAadhar, setSearchAadhar] = useState('');
  const [activeId, setActiveId] = useState('');
  
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [aadharId, setAadharId] = useState('');
  const [contacts, setContacts] = useState(['']);

  const [applicationNo, setApplicationNo] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [personalContact, setPersonalContact] = useState('');
  const [photo, setPhoto] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  
  const [successStatusText, setSuccessStatusText] = useState('');

  useEffect(() => {
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      let calcAge = today.getFullYear() - birthDate.getFullYear();
      if (today.getMonth() - birthDate.getMonth() < 0 || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
        calcAge--;
      }
      setAge(calcAge >= 0 ? calcAge : 0);
    } else { setAge(''); }
  }, [dob]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result);
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSearchRecord = async () => {
    if (!searchAadhar) return;
    try {
      const res = await axios.get(`${API_URL}/enrollments/search?aadharId=${searchAadhar}`);
      setActiveId(res.data._id);
      setName(res.data.name);
      setDob(res.data.dob ? res.data.dob.split('T')[0] : '');
      setBloodGroup(res.data.bloodGroup);
      setAadharId(res.data.aadharId);
      setContacts(res.data.emergencyContacts ? res.data.emergencyContacts.split(', ') : ['']);
      setApplicationNo(res.data.applicationNo || '');
      setAddress(res.data.address || '');
      setPincode(res.data.pincode || '');
      setPersonalContact(res.data.personalContact || '');
      setPhoto(res.data.photo || '');
      setPhotoPreview(res.data.photo || '');
      setSuccessStatusText('');
    } catch (err) {
      alert('No record found with this Aadhaar ID.');
    }
  };

  const resetForm = () => {
    setName(''); setDob(''); setAge(''); setBloodGroup(''); setAadharId(''); setContacts(['']);
    setApplicationNo(''); setAddress(''); setPincode(''); setPersonalContact('');
    setPhoto(''); setPhotoPreview('');
    setSearchAadhar(''); setActiveId('');
  };

  const executeSubmit = async (e) => {
    e.preventDefault();
    
    const cleanAadhar = String(aadharId).trim();
    if (cleanAadhar.length !== 12) {
      alert("Aadhaar number must be exactly 12 digits.");
      return;
    }
    if (pincode && !/^\d{6}$/.test(pincode)) {
      alert("Pincode must be exactly 6 digits.");
      return;
    }

    const payload = { 
      name: name.trim(), 
      dob, 
      age: Number(age), 
      bloodGroup, 
      aadharId: cleanAadhar, 
      emergencyContacts: contacts.map(c => c.trim()).filter(Boolean).join(', '),
      applicationNo: applicationNo.trim(),
      address: address.trim(),
      pincode: pincode.trim(),
      personalContact: personalContact.trim(),
      photo
    };

    try {
      if (isUpdateMode && activeId) {
        await axios.put(`${API_URL}/enrollments/${activeId}`, payload);
        setSuccessStatusText("Citizen profile updated successfully");
      } else {
        await axios.post(`${API_URL}/enrollments`, payload);
        setSuccessStatusText("Citizen registered successfully");
      }
      
      resetForm();
      if (onFormSubmit) onFormSubmit();
    } catch (err) { 
      alert(err.response?.data?.error || "Submission error. Please ensure the server is responding.");
    }
    setTimeout(() => setSuccessStatusText(''), 5000);
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
        <button type="button" className="btn" onClick={() => { setIsUpdateMode(false); setActiveId(''); setSuccessStatusText(''); }} style={{ backgroundColor: !isUpdateMode ? '#2563eb' : '#edf2f7', color: !isUpdateMode ? '#fff' : '#475569', padding: '0.6rem 1.2rem', fontWeight: '600', fontSize: '0.9rem' }}>New Enrollment</button>
        <button type="button" className="btn" onClick={() => { setIsUpdateMode(true); setSuccessStatusText(''); }} style={{ backgroundColor: isUpdateMode ? '#2563eb' : '#edf2f7', color: isUpdateMode ? '#fff' : '#475569', padding: '0.6rem 1.2rem', fontWeight: '600', fontSize: '0.9rem' }}>Update Existing Profile</button>
      </div>

      {isUpdateMode && !activeId && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '2rem', backgroundColor: '#f1f5f9', padding: '1.25rem', borderRadius: '12px', alignItems: 'center' }}>
          <input type="text" placeholder="Enter 12-Digit Aadhaar" value={searchAadhar} onChange={e => setSearchAadhar(e.target.value.replace(/\D/g, ''))} maxLength={12} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          <button type="button" className="btn" onClick={handleSearchRecord} style={{ padding: '0.75rem 1.5rem', margin: 0, fontWeight: '700' }}>Search</button>
        </div>
      )}

      {(!isUpdateMode || activeId) && (
        <form onSubmit={executeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          <div className="form-group">
            <label style={{ fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }}>Application No.</label>
            <input type="text" value={applicationNo} onChange={e => setApplicationNo(e.target.value)} placeholder="e.g. APP-10001" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          </div>

          <div className="form-group">
            <label style={{ fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }}>Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          </div>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }}>DOB</label>
              <input type="date" value={dob} onChange={e => setDob(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }}>Age</label>
              <input type="number" value={age} readOnly style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#edf2f7', cursor: 'not-allowed', fontWeight: '600' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }}>Blood Group</label>
              <select value={bloodGroup} onChange={e => setBloodGroup(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', height: '46px' }}>
                <option value="">Select</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }}>Aadhaar ID</label>
              <input type="text" maxLength={12} value={aadharId} onChange={e => setAadharId(e.target.value.replace(/\D/g, ''))} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
          </div>

          <div className="form-group">
            <label style={{ fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }}>Address</label>
            <textarea value={address} onChange={e => setAddress(e.target.value)} rows={3} placeholder="House No, Street, City" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'inherit', resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }}>Pincode</label>
              <input type="text" maxLength={6} value={pincode} onChange={e => setPincode(e.target.value.replace(/\D/g, ''))} placeholder="6-digit pincode" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }}>Personal Contact</label>
              <input type="text" maxLength={10} value={personalContact} onChange={e => setPersonalContact(e.target.value.replace(/\D/g, ''))} placeholder="10-digit mobile number" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
          </div>

          <div className="form-group">
            <label style={{ fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }}>Photo (optional)</label>
            <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            {photoPreview && (
              <img src={photoPreview} alt="Preview" style={{ marginTop: '0.75rem', width: '90px', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            )}
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.9rem', margin: 0 }}>Emergency Contacts</label>
              <button type="button" onClick={() => setContacts([...contacts, ''])} className="btn" style={{ padding: '4px 10px', fontSize: '0.8rem', fontWeight: '700' }}>+ Add Number</button>
            </div>
            {contacts.map((contactValue, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <input type="text" value={contactValue} onChange={e => { const u = [...contacts]; u[i] = e.target.value.replace(/\D/g, '').slice(0,10); setContacts(u); }} required placeholder="Enter 10-digit mobile number" style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                {contacts.length > 1 && <button type="button" onClick={() => setContacts(contacts.filter((_, idx) => idx !== i))} className="btn btn-danger" style={{ padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}>Delete</button>}
              </div>
            ))}
          </div>
          
          <button type="submit" className="btn" style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: '700', marginTop: '0.5rem' }}>Submit Entry</button>
        </form>
      )}

      {successStatusText && (
        <div style={{ marginTop: '1.25rem', padding: '0.85rem', backgroundColor: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', borderRadius: '8px', fontWeight: '700', textAlign: 'center', fontSize: '1rem' }}>
          {successStatusText}
        </div>
      )}
    </div>
  );
}

function CreateUserForm() {
  const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [createUserMsg, setCreateUserMsg] = useState('');
  const [createUserError, setCreateUserError] = useState(false);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateUserMsg('');
    setCreateUserError(false);
    try {
      await axios.post(`${API_URL}/admin/create-user`, {
        requesterRole: loggedInUser.role || 'admin',
        username: newUsername.trim(),
        password: newPassword,
        name: newName.trim()
      });
      setCreateUserMsg(`Employee account "${newUsername.trim()}" created successfully.`);
      setNewName(''); setNewUsername(''); setNewPassword('');
      setTimeout(() => setCreateUserMsg(''), 5000);
    } catch (err) {
      setCreateUserError(true);
      setCreateUserMsg(err.response?.data?.error || 'Failed to create employee account.');
    }
  };

  return (
    <div className="card" style={{ padding: '1.5rem 2rem', backgroundColor: '#fff', marginBottom: '0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showForm ? '1.5rem' : 0 }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: '800', margin: 0 }}>Company Staff Accounts</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>Create login credentials for employees who will operate this console.</p>
        </div>
        <button type="button" className="btn" onClick={() => setShowForm(!showForm)} style={{ padding: '0.6rem 1.25rem', fontWeight: '700', backgroundColor: showForm ? '#e2e8f0' : '#2563eb', color: showForm ? '#334155' : '#fff' }}>
          {showForm ? 'Cancel' : '+ Create Employee Account'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '480px' }}>
          <div className="form-group">
            <label style={{ fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }}>Full Name</label>
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          </div>
          <div className="form-group">
            <label style={{ fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }}>Username</label>
            <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          </div>
          <div className="form-group">
            <label style={{ fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }}>Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={4} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          </div>
          <button type="submit" className="btn" style={{ padding: '0.75rem', fontWeight: '700' }}>Create Account</button>
        </form>
      )}

      {createUserMsg && (
        <div style={{ marginTop: '1.25rem', padding: '0.85rem', backgroundColor: createUserError ? '#fef2f2' : '#ecfdf5', border: `1px solid ${createUserError ? '#ef4444' : '#10b981'}`, color: createUserError ? '#991b1b' : '#065f46', borderRadius: '8px', fontWeight: '700', textAlign: 'center', fontSize: '0.95rem' }}>
          {createUserMsg}
        </div>
      )}
    </div>
  );
}

function AdminDashboard() {
  const [allEnrollments, setAllEnrollments] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);
  
  const [previewQrUrl, setPreviewQrUrl] = useState('');
  const [previewCitizenName, setPreviewCitizenName] = useState('');
  const [previewVerifyTarget, setPreviewVerifyTarget] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const resEnrollments = await axios.get(`${API_URL}/enrollments`);
      setAllEnrollments(resEnrollments.data);
    } catch (e) { 
      console.error("Could not fetch database records", e);
    }
  };

const handleStatusUpdate = async (id, status) => {
  try {
    const verificationLink = `${window.location.origin}/verify/${id}`;
    const reliableQR = `https://api.qrserver.com/v1/create-qr-code/?size=450x450&data=${encodeURIComponent(verificationLink)}&_=${Date.now()}`;
    
    await axios.patch(`${API_URL}/admin/enrollments/${id}`, { 
      status,
      qrCodeData: status === 'Approved' ? reliableQR : '',
      verificationUrl: status === 'Approved' ? verificationLink : ''
    });
    fetchAdminData();
  } catch (err) {
    console.error(err);
  }
};

  const handleRemoveUser = async (id) => {
    if(!window.confirm("Are you sure you want to remove this record?")) return;
    try {
      await axios.delete(`${API_URL}/enrollments/${id}`);
      fetchAdminData();
    } catch (err) {}
  };

  const handleAdminEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/enrollments/${editingRecord._id}`, editingRecord);
      setEditingRecord(null);
      fetchAdminData();
    } catch (err) {}
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      <h2 style={{ fontSize: '1.8rem', color: '#0f172a', fontWeight: '800' }}>Admin Dashboard Console</h2>

      <CreateUserForm />

      {editingRecord && (
        <div className="card" style={{ border: '2px solid #2563eb', padding: '1.5rem 2rem', backgroundColor: '#fff' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.25rem' }}>Edit User Row</h3>
          <form onSubmit={handleAdminEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}><label style={{ fontWeight: '700', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>Name</label><input type="text" value={editingRecord.name} onChange={e => setEditingRecord({...editingRecord, name: e.target.value})} required style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} /></div>
              <div style={{ flex: 1 }}><label style={{ fontWeight: '700', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>Blood Group</label><input type="text" value={editingRecord.bloodGroup} onChange={e => setEditingRecord({...editingRecord, bloodGroup: e.target.value})} required style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} /></div>
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}><label style={{ fontWeight: '700', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>Application No.</label><input type="text" value={editingRecord.applicationNo || ''} onChange={e => setEditingRecord({...editingRecord, applicationNo: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} /></div>
              <div style={{ flex: 1 }}><label style={{ fontWeight: '700', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>Personal Contact</label><input type="text" value={editingRecord.personalContact || ''} onChange={e => setEditingRecord({...editingRecord, personalContact: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} /></div>
            </div>
            <div><label style={{ fontWeight: '700', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>Address</label><input type="text" value={editingRecord.address || ''} onChange={e => setEditingRecord({...editingRecord, address: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} /></div>
            <div><label style={{ fontWeight: '700', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>Pincode</label><input type="text" value={editingRecord.pincode || ''} onChange={e => setEditingRecord({...editingRecord, pincode: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} /></div>
            <div><label style={{ fontWeight: '700', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>Emergency Contacts</label><input type="text" value={editingRecord.emergencyContacts} onChange={e => setEditingRecord({...editingRecord, emergencyContacts: e.target.value})} required style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} /></div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
              <button type="submit" className="btn" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}>Save</button>
              <button type="button" className="btn btn-danger" onClick={() => setEditingRecord(null)} style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: '1.5rem', backgroundColor: '#fff', overflowX: 'auto', width: '100%' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: '800', marginBottom: '1.25rem' }}>Registry System Operations</h3>
        <div style={{ minWidth: '1350px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '1rem', fontWeight: '800', color: '#475569', fontSize: '0.85rem' }}>NAME</th>
                <th style={{ padding: '1rem', fontWeight: '800', color: '#475569', fontSize: '0.85rem' }}>AADHAAR ID</th>
                <th style={{ padding: '1rem', fontWeight: '800', color: '#475569', fontSize: '0.85rem' }}>AGE</th>
                <th style={{ padding: '1rem', fontWeight: '800', color: '#475569', fontSize: '0.85rem' }}>DOB</th>
                <th style={{ padding: '1rem', fontWeight: '800', color: '#475569', fontSize: '0.85rem' }}>REGISTRATION DATE</th>
                <th style={{ padding: '1rem', fontWeight: '800', color: '#475569', fontSize: '0.85rem' }}>EMERGENCY CONTACTS</th>
                <th style={{ padding: '1rem', fontWeight: '800', color: '#475569', fontSize: '0.85rem' }}>STATUS</th>
                <th style={{ padding: '1rem', fontWeight: '800', color: '#475569', fontSize: '0.85rem' }}>QR CODE</th>
                <th style={{ padding: '1rem', fontWeight: '800', color: '#475569', fontSize: '0.85rem' }}>LINKS</th>
                <th style={{ padding: '1rem', fontWeight: '800', color: '#475569', fontSize: '0.85rem', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {allEnrollments.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontWeight: '500' }}>No citizens registered in database console.</td>
                </tr>
              ) : (
                allEnrollments.map((rowItem) => (
                  <tr key={rowItem._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem', fontWeight: '700', color: '#0f172a' }}>{rowItem.name}</td>
                    <td style={{ padding: '1rem', color: '#334155', fontFamily: 'monospace', fontSize: '0.95rem' }}>{rowItem.aadharId}</td>
                    <td style={{ padding: '1rem', color: '#334155', fontWeight: '600' }}>{rowItem.age || 'N/A'}</td>
                    <td style={{ padding: '1rem', color: '#334155' }}>{rowItem.dob ? rowItem.dob.split('T')[0] : 'N/A'}</td>
                    <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
                      {rowItem.createdAt ? new Date(rowItem.createdAt).toLocaleDateString('en-IN', {day: '2-digit', month: '2-digit', year: 'numeric'}) : 'Recently'}
                    </td>
                    <td style={{ padding: '1rem', color: '#1e293b', fontWeight: '500' }}>{rowItem.emergencyContacts || 'None'}</td>
                    
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`status-badge ${rowItem.status ? rowItem.status.toLowerCase() : 'pending'}`} style={{ padding: '0.3rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '800' }}>
                          {rowItem.status || 'Pending'}
                        </span>
                        {rowItem.status === 'Approved' ? (
                          <button className="btn" onClick={() => handleStatusUpdate(rowItem._id, 'Pending')} style={{ backgroundColor: '#e2e8f0', color: '#334155', padding: '4px 8px', fontSize: '0.75rem' }}>Revoke</button>
                        ) : (
                          <button className="btn btn-success" onClick={() => handleStatusUpdate(rowItem._id, 'Approved')} style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Approve</button>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {rowItem.status === 'Approved' && rowItem.qrCodeData ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <img 
                            src={rowItem.qrCodeData} 
                            alt="Badge Matrix" 
                            onClick={() => { 
                              setPreviewQrUrl(rowItem.qrCodeData); 
                              setPreviewCitizenName(rowItem.name); 
                              setPreviewVerifyTarget(`${window.location.origin}/verify/${rowItem._id}`);
                            }}
                            style={{ width: '45px', height: '45px', border: '1px solid #cbd5e1', padding: '2px', backgroundColor: '#fff', borderRadius: '4px', cursor: 'pointer' }} 
                            title="Click to Verify & Preview"
                          />
                          <a href={rowItem.qrCodeData} target="_blank" rel="noreferrer" download={`${rowItem.name}_badge.png`} style={{ display: 'inline-flex', alignItems: 'center' }}>
                            <button className="btn" style={{ padding: '6px', minWidth: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9' }} title="Download QR">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 3V16M12 16L7 11M12 16L17 11" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M3 20H21" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round"/>
                              </svg>
                            </button>
                          </a>
                        </div>
                      ) : <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>No Asset</span>}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {rowItem.status === 'Approved' ? (
                        <a 
                          href={`${window.location.origin}/verify/${rowItem._id}`}
                          target="_blank" 
                          rel="noreferrer" 
                          style={{ color: '#2563eb', fontSize: '0.85rem', fontWeight: '700', textDecoration: 'underline', wordBreak: 'break-all' }}
                        >
                          {`${window.location.origin}/verify/${rowItem._id}`}
                        </a>
                      ) : <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Inactive</span>}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button className="btn" onClick={() => setEditingRecord(rowItem)} style={{ backgroundColor: '#475569', padding: '5px 10px', fontSize: '0.8rem' }}>Edit</button>
                        <button className="btn btn-danger" onClick={() => handleRemoveUser(rowItem._id)} style={{ padding: '5px 10px', fontSize: '0.8rem' }}>Remove</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {previewQrUrl && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="card" style={{ maxWidth: '420px', width: '92%', padding: '2rem', textAlign: 'center', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', backgroundColor: '#fff' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>QR Code Review</h4>
            <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.85rem', color: '#64748b' }}>Testing high-res asset matrix for <strong>{previewCitizenName}</strong></p>
            
            <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '12px', display: 'inline-block', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
              <img src={previewQrUrl} alt="Testing Matrix HD Modal" style={{ width: '240px', height: '240px', display: 'block', margin: '0 auto' }} />
            </div>

            <div style={{ marginBottom: '1.5rem', padding: '0.65rem 0.85rem', backgroundColor: '#f1f5f9', borderRadius: '6px', textAlign: 'center', wordBreak: 'break-all' }}>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '3px', textTransform: 'uppercase' }}>Embedded Data Route Link:</span>
              <a href={previewVerifyTarget} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: '700', textDecoration: 'underline' }}>
                {previewVerifyTarget}
              </a>
            </div>

            <button className="btn" onClick={() => { setPreviewQrUrl(''); setPreviewCitizenName(''); setPreviewVerifyTarget(''); }} style={{ width: '100%', padding: '0.75rem', fontWeight: '700', backgroundColor: '#0f172a' }}>
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function UserDashboard() {
  return (
    <div className="card" style={{ maxWidth: '600px', margin: '1.5rem auto', padding: '2rem 1.75rem', backgroundColor: '#fff' }}>
      <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.5rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem' }}>Senior Citizen Intake Hub</h3>
      <EnrollmentForm />
    </div>
  );
}

function PublicVerificationPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`${API_URL}/public/verify/${id}`)
      .then(res => setData(res.data))
      .catch(() => setError("Invalid token profile. Identity lookup failed."));
  }, [id]);

  if (error) return <div className="card" style={{ color: '#ef4444', textAlign: 'center', padding: '3rem', fontWeight: '700' }}>{error}</div>;
  if (!data) return <div style={{ textAlign: 'center', marginTop: '6rem', color: '#475569', fontSize: '1.1rem' }}>Verifying Identity Token Parameters...</div>;

  return (
    <div className="card" style={{ maxWidth: '500px', margin: '4rem auto', padding: '2.5rem 2rem', backgroundColor: '#fff' }}>
      <h2 style={{ color: '#2563eb', fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem', textAlign: 'center' }}>Verification Profile</h2>
      <div style={{ width: '50px', height: '4px', backgroundColor: '#10b981', margin: '1rem auto 1.5rem auto', borderRadius: '2px' }}></div>
      {data.photo && (
        <img src={data.photo} alt={data.name} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%', display: 'block', margin: '0 auto 1.25rem auto', border: '3px solid #2563eb' }} />
      )}
      <div style={{ textAlign: 'left', lineHeight: '2.2', fontSize: '1.05rem', color: '#1e293b' }}>
        <p><strong>Name:</strong> <span style={{ marginLeft: '8px', color: '#0f172a', fontWeight: '600' }}>{data.name}</span></p>
        <p><strong>Age:</strong> <span style={{ marginLeft: '8px', color: '#0f172a', fontWeight: '600' }}>{data.age}</span></p>
        <p><strong>Blood Group:</strong> <span style={{ marginLeft: '8px', color: '#0f172a', fontWeight: '600' }}>{data.bloodGroup}</span></p>
        <p><strong>Aadhaar ID:</strong> <span style={{ marginLeft: '8px', color: '#0f172a', fontWeight: '600', fontFamily: 'monospace' }}>{data.maskedAadhar || `XXXX-XXXX-${data.aadharId?.slice(-4)}`}</span></p>
        {data.address && <p><strong>Address:</strong> <span style={{ marginLeft: '8px', color: '#0f172a', fontWeight: '600' }}>{data.address} {data.pincode ? `- ${data.pincode}` : ''}</span></p>}
        {data.personalContact && <p><strong>Contact:</strong> <span style={{ marginLeft: '8px', color: '#0f172a', fontWeight: '600' }}>{data.personalContact}</span></p>}
        <p><strong>Emergency Contacts:</strong> <span style={{ marginLeft: '8px', color: '#ef4444', fontWeight: '700' }}>{data.emergencyContacts}</span></p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/verify/:id" element={<PublicVerificationPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}