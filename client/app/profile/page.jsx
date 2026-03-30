"use client";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { User2, Mail, GraduationCap, Phone, Calendar, Video, Award, TrendingUp } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({ totalVideos: 0, videosWithFeedback: 0, lastActivity: "N/A" });

  useEffect(() => {
    const fetchUserAndStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please log in to view your profile.");
          setLoading(false);
          return;
        }

        // Fetch user details
        const userRes = await fetch("http://localhost:5000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userRes.json();
        if (!userRes.ok) throw new Error(userData?.error || "Failed to load user data");
        setUser(userData.user);

        // Fetch user sessions for stats
        const sessionsRes = await fetch("http://localhost:5000/session/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sessionsData = await sessionsRes.json();
        if (!sessionsRes.ok) throw new Error(sessionsData?.error || "Failed to load session data");

        const totalVideos = sessionsData.sessions.length;
        const videosWithFeedback = sessionsData.sessions.filter(s => s.feedback).length;
        const latestSession = sessionsData.sessions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

        setStats({
          totalVideos,
          videosWithFeedback,
          lastActivity: latestSession ? new Date(latestSession.created_at).toLocaleDateString() : "N/A"
        });

      } catch (e) {
        setError(e.message || "Error fetching profile data");
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndStats();
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 ml-64 p-6">
        <div className="rounded-2xl shadow-glass px-5 lg:px-7 py-6 mb-5 text-white relative overflow-hidden" style={{ background: "linear-gradient(145deg, #113a4b 0%, #061824 100%)" }}>
          <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-sky-300/20 blur-3xl" />
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2.5 rounded-xl bg-white/10 border border-white/20">
              <User2 size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1 text-white">Hello, {user?.username || "User"}! 👋</h1>
              <p className="text-slate-200 text-sm">Your personal presentation coaching hub</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl p-3 border border-white/15 bg-white/5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-white/15">
                  <Video className="text-white" size={16} />
                </div>
                <TrendingUp className="text-emerald-300" size={18} />
              </div>
              <p className="text-slate-200 text-xs font-medium mt-2">Total Videos</p>
              <p className="text-xl font-bold text-white">{stats.totalVideos}</p>
            </div>
            
            <div className="rounded-xl p-3 border border-white/15 bg-white/5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-white/15">
                  <Award className="text-white" size={16} />
                </div>
                <TrendingUp className="text-amber-300" size={18} />
              </div>
              <p className="text-slate-200 text-xs font-medium mt-2">With Feedback</p>
              <p className="text-xl font-bold text-white">{stats.videosWithFeedback}</p>
            </div>
            
            <div className="rounded-xl p-3 border border-white/15 bg-white/5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-white/15">
                  <Calendar className="text-white" size={16} />
                </div>
                <TrendingUp className="text-sky-300" size={18} />
              </div>
              <p className="text-slate-200 text-xs font-medium mt-2">Last Activity</p>
              <p className="text-base font-bold text-white">{stats.lastActivity}</p>
            </div>
          </div>
        </div>

        {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          ) : error ? (
            <div className="bg-white border-2 border-red-300 rounded-lg p-6 text-center">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 items-start">
              <div className="glass rounded-2xl shadow-glass p-4 self-start">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-1 w-12 bg-gradient-ai rounded-full"></div>
                  <h2 className="text-lg font-bold text-slate-800">Account Details</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
                    <div className="p-2.5 glass rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <User2 className="text-indigo-500" size={18} />
                        <p className="text-sm font-medium text-slate-600">Full Name</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 leading-5 break-words">{user?.username || "—"}</p>
                    </div>
                    
                    <div className="p-2.5 glass rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <Mail className="text-blue-500" size={18} />
                        <p className="text-sm font-medium text-slate-600">Email</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 leading-5 break-all">{user?.email || "—"}</p>
                    </div>
                    
                    {user?.role && (
                      <div className="p-2.5 glass rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                          <Award className="text-purple-500" size={18} />
                          <p className="text-sm font-medium text-slate-600">Role</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-800 capitalize leading-5">{user.role}</p>
                      </div>
                    )}
                    
                    {user?.studentId && (
                      <div className="p-2.5 glass rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                          <GraduationCap className="text-green-500" size={18} />
                          <p className="text-sm font-medium text-slate-600">Student ID</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-800 leading-5 break-words">{user.studentId}</p>
                      </div>
                    )}
                    
                    {user?.program && (
                      <div className="p-2.5 glass rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                          <GraduationCap className="text-orange-500" size={18} />
                          <p className="text-sm font-medium text-slate-600">Program</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-800 leading-5 break-words">{user.program}</p>
                      </div>
                    )}
                    
                    {user?.semester && (
                      <div className="p-2.5 glass rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                          <Calendar className="text-yellow-500" size={18} />
                          <p className="text-sm font-medium text-slate-600">Semester</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-800 leading-5">{user.semester}</p>
                      </div>
                    )}
                    
                    {user?.phone && (
                      <div className="p-2.5 glass rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                          <Phone className="text-teal-500" size={18} />
                          <p className="text-sm font-medium text-slate-600">Phone</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-800 leading-5 break-words">{user.phone}</p>
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}
      </main>
    </div>
  );
}
