import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout, Users, Shield, Bell, Settings, LogOut, Activity, Globe, Monitor } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { useEffect, useState } from 'react';
import api from '../api/axios';

const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get('/users/me/sessions');
        setSessions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setTimeout(() => setIsLoading(false), 500); 
      }
    };
    fetchSessions();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {}
      <aside className="w-64 bg-white border-r border-neutral-200 hidden md:flex flex-col">
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">A</div>
            <span className="text-xl font-bold tracking-tight">Auth<span className="text-primary font-black">S</span></span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4">
          <SidebarItem icon={<Layout size={20} />} label="Overview" active />
          <SidebarItem icon={<Activity size={20} />} label="Activity Logs" />
          <SidebarItem icon={<Shield size={20} />} label="Security" />
          <SidebarItem icon={<Settings size={20} />} label="Settings" link="/profile" />
          {user?.role === 'ADMIN' && (
             <SidebarItem icon={<Users size={20} />} label="Admin Panel" link="/admin" />
          )}
        </nav>

        <div className="p-4 border-t border-neutral-100">
          <button onClick={logout} className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 font-semibold hover:bg-red-50 rounded-xl transition-colors">
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {}
      <main className="flex-1 overflow-y-auto">
        {}
        <header className="bg-white border-b border-neutral-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-xl font-bold text-neutral-800">Dashboard Overview</h1>
          <div className="flex items-center space-x-4">
             <button className="p-2 text-neutral-400 hover:text-neutral-600 relative">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
             </button>
             <div className="flex items-center space-x-3 pl-4 border-l border-neutral-100">
                <div className="text-right">
                   <p className="text-sm font-bold text-neutral-900">{user?.name}</p>
                   <p className="text-xs font-medium text-neutral-500">{user?.role}</p>
                </div>
                <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`} className="w-10 h-10 rounded-full border-2 border-neutral-50 shadow-sm" alt="" />
             </div>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto space-y-8">
          {}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-primary rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-primary/30"
          >
            <div className="relative z-10">
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-black mb-4 tracking-tight"
              >
                Welcome back, {user?.name?.split(' ')[0]}! 👋
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-indigo-100 text-lg max-w-md font-medium leading-relaxed"
              >
                Your account is currently <span className="text-white font-bold bg-white/20 px-2 py-1 rounded-lg">{user?.isVerified ? 'Verified' : 'Unverified'}</span>. Access all core features securely.
              </motion.p>
              <motion.button 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-8 px-8 py-3 bg-white text-primary rounded-2xl font-black hover:bg-neutral-50 transition-all shadow-lg hover:shadow-white/20 active:scale-95"
              >
                Run Security Audit
              </motion.button>
            </div>
            <div className="absolute top-0 right-0 w-1/3 h-full bg-white/10 skew-x-12 translate-x-1/4"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          </motion.div>

          {}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard label="Total Logins" value="24" icon={<Activity className="text-blue-500" />} isLoading={isLoading} />
            <StatCard label="Security Score" value="98%" icon={<Shield className="text-green-500" />} isLoading={isLoading} />
            <StatCard label="Active Sessions" value={sessions.length.toString()} icon={<Monitor className="text-purple-500" />} isLoading={isLoading} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-neutral-800 tracking-tight">Recent activity</h3>
                <button className="text-sm text-primary font-black hover:underline uppercase tracking-wider">View All</button>
              </div>
              <div className="bg-white rounded-[2rem] border border-neutral-200 overflow-hidden shadow-sm">
                {isLoading ? (
                  [...Array(4)].map((_, i) => <SkeletonItem key={i} />)
                ) : (
                  <>
                    <ActivityItem title="Successful Login" desc="from Chrome on macOS" time="2 hours ago" />
                    <ActivityItem title="Profile Updated" desc="Changed avatar image" time="5 hours ago" />
                    <ActivityItem title="Password Changed" desc="via security settings" time="Yesterday" />
                    <ActivityItem title="New Device Verified" desc="iPhone 15 Pro, London UK" time="2 days ago" />
                  </>
                )}
              </div>
            </div>

            {}
            <div className="space-y-6">
              <h3 className="text-xl font-black text-neutral-800 tracking-tight">Active devices</h3>
              <div className="space-y-4">
                {isLoading ? (
                  [...Array(2)].map((_, i) => <SkeletonItem key={i} />)
                ) : (
                  sessions.map((session, i) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <DeviceCard 
                        device={session.userAgent || 'Unknown Device'}
                        ip={session.ip || '0.0.0.0'}
                        isCurrent={session.refreshToken === localStorage.getItem('refreshToken')} 
                      />
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const SidebarItem = ({ icon, label, active = false, link = "/dashboard" }) => {
  const content = (
    <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-semibold ${active ? 'bg-primary/10 text-primary' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'}`}>
      {icon}
      <span>{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-sm shadow-primary/50"></div>}
    </div>
  );

  return link.startsWith('/') ? <Link to={link}>{content}</Link> : <a href={link}>{content}</a>;
};

const StatCard = ({ label, value, icon, isLoading }) => (
  <div className="bg-white p-8 rounded-[2rem] border border-neutral-200 flex items-center justify-between shadow-sm hover:shadow-md transition-all group">
    <div>
      <p className="text-xs font-black text-neutral-400 mb-2 uppercase tracking-widest">{label}</p>
      {isLoading ? (
        <div className="h-8 w-20 bg-neutral-100 rounded-lg animate-pulse"></div>
      ) : (
        <p className="text-3xl font-black text-neutral-900 tracking-tight">{value}</p>
      )}
    </div>
    <div className="p-4 bg-neutral-50 rounded-2xl group-hover:scale-110 transition-transform">
      {icon}
    </div>
  </div>
);

const SkeletonItem = () => (
    <div className="p-6 flex items-center justify-between border-b border-neutral-100 last:border-0 animate-pulse">
        <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-2xl"></div>
            <div className="space-y-2">
                <div className="h-4 w-32 bg-neutral-100 rounded"></div>
                <div className="h-3 w-48 bg-neutral-50 rounded"></div>
            </div>
        </div>
    </div>
);

const ActivityItem = ({ title, desc, time }) => (
  <div className="p-6 flex items-center justify-between hover:bg-neutral-50 transition-colors border-b border-neutral-100 last:border-0 group cursor-default">
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center group-hover:bg-white transition-colors">
        <Activity size={20} className="text-neutral-400" />
      </div>
      <div>
        <p className="text-base font-bold text-neutral-900">{title}</p>
        <p className="text-sm text-neutral-500 font-medium">{desc}</p>
      </div>
    </div>
    <span className="text-xs font-bold text-neutral-400 bg-neutral-100 px-3 py-1 rounded-full">{time}</span>
  </div>
);

const DeviceCard = ({ device, ip, isCurrent }) => (
  <div className="bg-white p-5 rounded-3xl border border-neutral-200 flex items-center space-x-4 hover:border-primary/30 transition-all shadow-sm">
    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
      <Monitor size={22} className="text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-black text-neutral-900 truncate tracking-tight">{device.split(')')[0] + ')'}</p>
      <p className="text-xs text-neutral-500 font-bold">{ip}</p>
    </div>
    {isCurrent && (
      <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded-lg tracking-tighter">Live</span>
    )}
  </div>
);

export default Dashboard;
