import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Search, ShieldAlert, ArrowLeft, MoreVertical, Trash2, Ban, ShieldCheck, UserCog, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get(`/admin/users?search=${search}`);
      setUsers(data.users);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBan = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/ban`);
      toast.success('User status updated');
      fetchUsers();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleChangeRole = async (id, role) => {
    try {
      await api.patch(`/admin/users/${id}/role`, { role });
      toast.success(`Role changed to ${role}`);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to change role');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/50">
      <nav className="bg-white/80 backdrop-blur-md border-b border-neutral-200 px-8 py-5 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center space-x-4">
           <Link to="/dashboard" className="p-2 hover:bg-neutral-100 rounded-full transition-all text-neutral-500 active:scale-90">
             <ArrowLeft size={20} />
           </Link>
           <div>
              <h1 className="text-xl font-black text-neutral-800 tracking-tight">Admin Control Center</h1>
              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest -mt-1">System Management</p>
           </div>
        </div>
        <div className="relative group">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary transition-colors" size={18} />
           <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email..." 
            className="pl-12 pr-6 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all w-80 font-medium" 
           />
        </div>
      </nav>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-8 py-10 max-w-7xl mx-auto"
      >
         <div className="bg-white rounded-[2.5rem] border border-neutral-200 overflow-hidden shadow-xl shadow-neutral-200/30">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-neutral-50/50 border-b border-neutral-100">
                         <th className="px-8 py-5 text-[10px] font-black uppercase text-neutral-400 tracking-widest">User Profile</th>
                         <th className="px-8 py-5 text-[10px] font-black uppercase text-neutral-400 tracking-widest">Access Role</th>
                         <th className="px-8 py-5 text-[10px] font-black uppercase text-neutral-400 tracking-widest">Account Status</th>
                         <th className="px-8 py-5 text-[10px] font-black uppercase text-neutral-400 tracking-widest text-right">Administrative Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-neutral-100">
                      <AnimatePresence mode="popLayout">
                      {loading ? (
                          [...Array(5)].map((_, i) => (
                              <tr key={`skeleton-${i}`} className="animate-pulse">
                                  <td className="px-8 py-6">
                                      <div className="flex items-center space-x-4">
                                          <div className="w-12 h-12 bg-neutral-100 rounded-2xl"></div>
                                          <div className="space-y-2">
                                              <div className="h-4 w-32 bg-neutral-100 rounded"></div>
                                              <div className="h-3 w-48 bg-neutral-50 rounded"></div>
                                          </div>
                                      </div>
                                  </td>
                                  <td colSpan={3}></td>
                              </tr>
                          ))
                      ) : (
                        users.map((user) => (
                          <motion.tr 
                            key={user.id} 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="hover:bg-neutral-50/50 transition-colors group"
                          >
                             <td className="px-8 py-6">
                                <div className="flex items-center space-x-4">
                                   <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center font-black text-primary border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all">
                                      {user.name?.[0].toUpperCase()}
                                   </div>
                                   <div>
                                      <p className="font-black text-neutral-900 leading-tight">{user.name}</p>
                                      <p className="text-sm font-bold text-neutral-400">{user.email}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-6">
                                <div className="relative inline-block">
                                   <select 
                                    value={user.role} 
                                    onChange={(e) => handleChangeRole(user.id, e.target.value)}
                                    className="appearance-none bg-neutral-100 px-4 py-2 rounded-xl font-black text-xs outline-none cursor-pointer border border-transparent focus:border-primary/30 pr-10 hover:bg-neutral-200 transition-all uppercase tracking-tighter"
                                   >
                                      <option value="USER">User</option>
                                      <option value="MODERATOR">Moderator</option>
                                      <option value="ADMIN">Administrator</option>
                                   </select>
                                   <UserCog className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={14} />
                                </div>
                             </td>
                             <td className="px-8 py-6">
                                {user.isBanned ? (
                                   <div className="flex items-center space-x-2 px-3 py-1 bg-red-100 text-red-700 rounded-lg text-[10px] font-black uppercase tracking-widest w-fit">
                                       <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                       <span>Suspended</span>
                                   </div>
                                ) : (
                                   <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-black uppercase tracking-widest w-fit">
                                       <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                       <span>Active</span>
                                   </div>
                                )}
                             </td>
                             <td className="px-8 py-6 text-right">
                                <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                                   <button 
                                     onClick={() => handleToggleBan(user.id)}
                                     title={user.isBanned ? 'Lift Suspension' : 'Suspend User'}
                                     className={`px-4 py-2 rounded-xl font-black text-xs transition-all active:scale-95 ${user.isBanned ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white shadow-lg shadow-red-500/10'}`}
                                   >
                                     {user.isBanned ? 'UNBAN' : 'SUSPEND'}
                                   </button>
                                </div>
                             </td>
                          </motion.tr>
                        ))
                      )}
                      </AnimatePresence>
                   </tbody>
                </table>
            </div>
            {users.length === 0 && !loading && (
               <div className="p-32 text-center animate-in fade-in zoom-in duration-500">
                   <div className="w-20 h-20 bg-neutral-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                       <Search className="text-neutral-300" size={32} />
                   </div>
                  <h3 className="text-xl font-black text-neutral-800">No matches found</h3>
                  <p className="text-neutral-400 font-bold mt-1">Try adjusting your search criteria</p>
               </div>
            )}
         </div>
      </motion.div>
    </div>
  );
};

export default AdminPanel;
