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

      <main className="flex-1 ml-64 p-0">
        {/* Modern Hero Header */}
        <div className="glass rounded-2xl shadow-glass mx-6 mt-6 mb-6 px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-2 btn-gradient rounded-xl shadow-glass">
              <User2 size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1 text-slate-800">Hello, {user?.username || "User"}! 👋</h1>
              <p className="text-slate-600 text-sm">Your personal presentation coaching hub</p>
            </div>
          </div>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass rounded-xl shadow-glass hover:shadow-xl transition-all p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 btn-gradient rounded-xl shadow-glass">
                  <Video className="text-white" size={20} />
                </div>
                <TrendingUp className="text-green-500" size={18} />
              </div>
              <p className="text-slate-600 text-sm font-medium mb-1">Total Videos</p>
              <p className="text-2xl font-bold text-slate-800">{stats.totalVideos}</p>
            </div>
            
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 btn-gradient rounded-xl shadow-glass">
                  <Award className="text-white" size={20} />
                </div>
                <TrendingUp className="text-yellow-500" size={18} />
              </div>
              <p className="text-slate-600 text-sm font-medium mb-1">With Feedback</p>
              <p className="text-2xl font-bold text-slate-800">{stats.videosWithFeedback}</p>
            </div>
            
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 btn-gradient rounded-xl shadow-glass">
                  <Calendar className="text-white" size={20} />
                </div>
                <TrendingUp className="text-blue-500" size={18} />
              </div>
              <p className="text-slate-600 text-sm font-medium mb-1">Last Activity</p>
              <p className="text-lg font-bold text-slate-800">{stats.lastActivity}</p>
            </div>
          </div>
        </div>

        <div className="px-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          ) : error ? (
            <div className="bg-white border-2 border-red-300 rounded-lg p-6 text-center">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Main Profile Card */}
              <div className="lg:col-span-2 glass rounded-2xl shadow-glass p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-1 w-12 bg-gradient-ai rounded-full"></div>
                  <h2 className="text-xl font-bold text-slate-800">Account Details</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 glass rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <User2 className="text-indigo-500" size={18} />
                        <p className="text-sm font-medium text-slate-600">Full Name</p>
                      </div>
                      <p className="text-base font-semibold text-slate-800">{user?.username || "—"}</p>
                    </div>
                    
                    <div className="p-4 glass rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <Mail className="text-blue-500" size={18} />
                        <p className="text-sm font-medium text-slate-600">Email</p>
                      </div>
                      <p className="text-base font-semibold text-slate-800">{user?.email || "—"}</p>
                    </div>
                    
                    {user?.role && (
                      <div className="p-4 glass rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                          <Award className="text-purple-500" size={18} />
                          <p className="text-sm font-medium text-slate-600">Role</p>
                        </div>
                        <p className="text-base font-semibold text-slate-800 capitalize">{user.role}</p>
                      </div>
                    )}
                    
                    {user?.studentId && (
                      <div className="p-4 glass rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                          <GraduationCap className="text-green-500" size={18} />
                          <p className="text-sm font-medium text-slate-600">Student ID</p>
                        </div>
                        <p className="text-base font-semibold text-slate-800">{user.studentId}</p>
                      </div>
                    )}
                    
                    {user?.program && (
                      <div className="p-4 glass rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                          <GraduationCap className="text-orange-500" size={18} />
                          <p className="text-sm font-medium text-slate-600">Program</p>
                        </div>
                        <p className="text-base font-semibold text-slate-800">{user.program}</p>
                      </div>
                    )}
                    
                    {user?.semester && (
                      <div className="p-4 glass rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                          <Calendar className="text-yellow-500" size={18} />
                          <p className="text-sm font-medium text-slate-600">Semester</p>
                        </div>
                        <p className="text-base font-semibold text-slate-800">{user.semester}</p>
                      </div>
                    )}
                    
                    {user?.phone && (
                      <div className="p-4 glass rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                          <Phone className="text-teal-500" size={18} />
                          <p className="text-sm font-medium text-slate-600">Phone</p>
                        </div>
                        <p className="text-base font-semibold text-slate-800">{user.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Stats Card */}
              <div className="glass rounded-2xl shadow-glass p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-1 w-8 bg-gradient-ai rounded-full"></div>
                  <h3 className="text-lg font-bold text-slate-800">Quick Stats</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="p-4 glass rounded-xl">
                    <p className="text-sm text-slate-600 mb-1">Completion Rate</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-indigo-600">
                        {stats.totalVideos > 0 ? Math.round((stats.videosWithFeedback / stats.totalVideos) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4 glass rounded-xl">
                    <p className="text-sm text-slate-600 mb-1">Videos Analyzed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.videosWithFeedback}</p>
                  </div>
                  
                  <div className="p-4 glass rounded-xl">
                    <p className="text-sm text-slate-600 mb-1">Pending Analysis</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalVideos - stats.videosWithFeedback}</p>
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
