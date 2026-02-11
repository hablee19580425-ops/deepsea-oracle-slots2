
import React, { useState, useEffect } from 'react';
import { getUsers, registerUser, updateUser, deleteUser } from '../services/userService';
import { User } from '../types';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<Record<string, User>>({});
  const [newUserId, setNewUserId] = useState('');
  const [newUserPw, setNewUserPw] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chargeAmounts, setChargeAmounts] = useState<Record<string, string>>({});

  const fetchUsers = async () => {
    setLoading(true);
    const data = await getUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserId || !newUserPw) return;
    try {
      await registerUser(newUserId, newUserPw);
      setMessage(`Diver ${newUserId} successfully enlisted.`);
      setNewUserId('');
      setNewUserPw('');
      fetchUsers();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleUpdateCredit = async (userId: string, currentCredit: number, delta: number) => {
    const inputVal = chargeAmounts[userId] || '0';
    const amount = delta === 0 ? parseInt(inputVal) : delta;

    if (isNaN(amount) || (amount === 0 && delta === 0)) return;

    try {
      const updated = await updateUser(userId, { credit: currentCredit + amount });
      if (updated) {
        setMessage(`Balance updated for ${userId}.`);
        setChargeAmounts(prev => ({ ...prev, [userId]: '' }));
        fetchUsers();
      }
    } catch (err) {
      setMessage('Failed to update credit.');
    }
  };

  const handleDelete = async (userId: string) => {
    if (userId === 'OCEAN_MASTER') return;
    if (!window.confirm(`Are you sure you want to purge ${userId} from the abyss?`)) return;

    try {
      const ok = await deleteUser(userId);
      if (ok) {
        setMessage(`User ${userId} has been purged.`);
        fetchUsers();
      }
    } catch (err) {
      setMessage('Purge failed.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Messages */}
      {message && (
        <div className="bg-cyan-900/40 border border-cyan-500/50 text-cyan-200 px-6 py-3 rounded-xl text-center font-rajdhani font-bold animate-pulse">
          {message}
        </div>
      )}

      {/* Enlist Form */}
      <section className="bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-2xl">
        <h3 className="font-orbitron text-cyan-400 text-sm tracking-[0.3em] mb-6 uppercase">Enlist New Diver</h3>
        <form onSubmit={handleCreateUser} className="flex flex-col md:flex-row gap-4">
          <input
            placeholder="Diver ID"
            value={newUserId}
            onChange={e => setNewUserId(e.target.value)}
            className="flex-1 bg-slate-950/50 border border-slate-800 px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500 transition-all text-cyan-100"
          />
          <input
            type="password"
            placeholder="Passphrase"
            value={newUserPw}
            onChange={e => setNewUserPw(e.target.value)}
            className="flex-1 bg-slate-950/50 border border-slate-800 px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500 transition-all text-cyan-100"
          />
          <button
            type="submit"
            className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-orbitron font-bold px-8 py-3 rounded-xl transition-all hover:scale-105"
          >
            CREATE
          </button>
        </form>
      </section>

      {/* Divers Dashboard */}
      <section className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-orbitron text-cyan-400 text-sm tracking-[0.3em] uppercase">Abyssal Manifest</h3>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="text-xs text-slate-500 hover:text-cyan-400 transition-colors uppercase tracking-widest font-bold"
          >
            {loading ? 'SYNCING...' : 'REFRESH LIST'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-rajdhani">
            <thead className="bg-slate-950/50 text-slate-500 text-xs uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Diver ID</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Balance</th>
                <th className="px-6 py-4">Actions</th>
                <th className="px-6 py-4 text-right">Purge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {Object.values(users).map((u) => (
                <tr key={u.id} className="hover:bg-cyan-500/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-200">{u.id}</div>
                    <div className="text-[10px] text-slate-600 uppercase">Registered Asset</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2 py-1 rounded-full border ${u.role === 'admin' ? 'border-red-500/50 text-red-400 bg-red-500/10' : 'border-slate-700 text-slate-500 bg-slate-800/50'}`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-orbitron text-cyan-400">{u.credit.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Amt"
                        value={chargeAmounts[u.id] || ''}
                        onChange={e => setChargeAmounts(prev => ({ ...prev, [u.id]: e.target.value }))}
                        className="w-20 bg-slate-950 border border-slate-800 px-2 py-1 rounded-lg text-sm text-cyan-100 focus:border-cyan-500 focus:outline-none"
                      />
                      <button
                        onClick={() => handleUpdateCredit(u.id, u.credit, 0)}
                        className="bg-cyan-900/30 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 px-3 py-1 rounded-lg text-xs font-bold transition-all"
                      >
                        CHARGE
                      </button>
                      <button
                        onClick={() => handleUpdateCredit(u.id, u.credit, -(parseInt(chargeAmounts[u.id] || '0')))}
                        className="bg-pink-900/30 hover:bg-pink-500 text-pink-400 hover:text-white px-3 py-1 rounded-lg text-xs font-bold transition-all"
                      >
                        WITHDRAW
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u.id !== 'OCEAN_MASTER' && (
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="text-slate-700 hover:text-red-500 p-2 transition-colors opacity-0 group-hover:opacity-100"
                        title="Purge Diver"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {Object.keys(users).length === 0 && !loading && (
            <div className="p-12 text-center text-slate-600 font-rajdhani italic">
              The abyss is empty...
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminPanel;
