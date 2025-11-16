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
    <div className="flex bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 min-h-screen relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      {/* Gradient Orbs */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <Sidebar />

      <main className="flex-1 ml-64 p-0 relative z-10">
        {/* Modern Hero Header */}
        <div className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-red-500 text-white px-10 py-16 overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 3px 3px, white 1px, transparent 0)`,
              backgroundSize: '50px 50px'
            }}></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-8">
              <div className="p-4 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30">
                <User2 size={40} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Hello, {user?.username || "User"}! 👋</h1>
                <p className="text-white/90 text-base">Your personal presentation coaching hub</p>
              </div>
            </div>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl hover:bg-white/20 transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Video className="text-white" size={24} />
                  </div>
                  <TrendingUp className="text-green-300" size={20} />
                </div>
                <p className="text-white/70 text-sm font-medium mb-1">Total Videos</p>
                <p className="text-3xl font-bold">{stats.totalVideos}</p>
              </div>
              
              <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl hover:bg-white/20 transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Award className="text-white" size={24} />
                  </div>
                  <TrendingUp className="text-yellow-300" size={20} />
                </div>
                <p className="text-white/70 text-sm font-medium mb-1">With Feedback</p>
                <p className="text-3xl font-bold">{stats.videosWithFeedback}</p>
              </div>
              
              <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl hover:bg-white/20 transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Calendar className="text-white" size={24} />
                  </div>
                  <TrendingUp className="text-blue-300" size={20} />
                </div>
                <p className="text-white/70 text-sm font-medium mb-1">Last Activity</p>
                <p className="text-2xl font-bold">{stats.lastActivity}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-10">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
            </div>
          ) : error ? (
            <div className="bg-red-500/20 backdrop-blur-xl border-2 border-red-300/50 rounded-2xl p-8 text-center">
              <p className="text-red-200 font-medium">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Profile Card */}
              <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-1 w-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-white">Account Details</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                      <div className="flex items-center gap-3 mb-2">
                        <User2 className="text-indigo-300" size={20} />
                        <p className="text-sm font-medium text-white/70">Full Name</p>
                      </div>
                      <p className="text-lg font-semibold text-white">{user?.username || "—"}</p>
                    </div>
                    
                    <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                      <div className="flex items-center gap-3 mb-2">
                        <Mail className="text-blue-300" size={20} />
                        <p className="text-sm font-medium text-white/70">Email</p>
                      </div>
                      <p className="text-lg font-semibold text-white">{user?.email || "—"}</p>
                    </div>
                    
                    {user?.role && (
                      <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                        <div className="flex items-center gap-3 mb-2">
                          <Award className="text-purple-300" size={20} />
                          <p className="text-sm font-medium text-white/70">Role</p>
                        </div>
                        <p className="text-lg font-semibold text-white capitalize">{user.role}</p>
                      </div>
                    )}
                    
                    {user?.studentId && (
                      <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                        <div className="flex items-center gap-3 mb-2">
                          <GraduationCap className="text-green-300" size={20} />
                          <p className="text-sm font-medium text-white/70">Student ID</p>
                        </div>
                        <p className="text-lg font-semibold text-white">{user.studentId}</p>
                      </div>
                    )}
                    
                    {user?.program && (
                      <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                        <div className="flex items-center gap-3 mb-2">
                          <GraduationCap className="text-orange-300" size={20} />
                          <p className="text-sm font-medium text-white/70">Program</p>
                        </div>
                        <p className="text-lg font-semibold text-white">{user.program}</p>
                      </div>
                    )}
                    
                    {user?.semester && (
                      <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                        <div className="flex items-center gap-3 mb-2">
                          <Calendar className="text-yellow-300" size={20} />
                          <p className="text-sm font-medium text-white/70">Semester</p>
                        </div>
                        <p className="text-lg font-semibold text-white">{user.semester}</p>
                      </div>
                    )}
                    
                    {user?.phone && (
                      <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                        <div className="flex items-center gap-3 mb-2">
                          <Phone className="text-teal-300" size={20} />
                          <p className="text-sm font-medium text-white/70">Phone</p>
                        </div>
                        <p className="text-lg font-semibold text-white">{user.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Stats Card */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-1 w-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                  <h3 className="text-xl font-bold text-white">Quick Stats</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    <p className="text-sm text-white/70 mb-1">Completion Rate</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-indigo-300">
                        {stats.totalVideos > 0 ? Math.round((stats.videosWithFeedback / stats.totalVideos) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    <p className="text-sm text-white/70 mb-1">Videos Analyzed</p>
                    <p className="text-3xl font-bold text-green-300">{stats.videosWithFeedback}</p>
                  </div>
                  
                  <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    <p className="text-sm text-white/70 mb-1">Pending Analysis</p>
                    <p className="text-3xl font-bold text-blue-300">{stats.totalVideos - stats.videosWithFeedback}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
