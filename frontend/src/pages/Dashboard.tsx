import React from 'react';
import Navbar from '../components/Navbar';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-6">
            <div className="bg-blue-50 text-blue-600 p-4 rounded-lg">
              <Users size={28} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">Students Processed</p>
              <h2 className="text-2xl font-bold text-slate-800">1,248</h2>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-6">
            <div className="bg-emerald-50 text-emerald-500 p-4 rounded-lg">
              <FileText size={28} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">Generated Reports</p>
              <h2 className="text-2xl font-bold text-slate-800">24</h2>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-6">
            <div className="bg-red-50 text-red-500 p-4 rounded-lg">
              <Clock size={28} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">Time Saved</p>
              <h2 className="text-2xl font-bold text-slate-800">12h 45m</h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold mb-6 text-slate-800">Quick Actions</h2>
            <div className="flex flex-col gap-4">
              <Link to="/mark-entry" className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition group">
                <div>
                  <h3 className="font-bold text-slate-800 group-hover:text-blue-600">Start Mark Entry System</h3>
                  <p className="text-sm text-slate-500 mt-1">Initialize voice-based dynamic mark entry</p>
                </div>
                <div className="text-blue-600 font-bold">→</div>
              </Link>
              <Link to="/files" className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-emerald-500 hover:shadow-sm transition group">
                <div>
                  <h3 className="font-bold text-slate-800 group-hover:text-emerald-600">Open Mark Files</h3>
                  <p className="text-sm text-slate-500 mt-1">View and download previously generated sheets</p>
                </div>
                <div className="text-emerald-600 font-bold">→</div>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold mb-6 text-slate-800">Recent Activity</h2>
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`flex items-center justify-between pb-4 ${i !== 3 ? 'border-b border-slate-100' : ''}`}>
                  <div className="flex items-center gap-4">
                    <CheckCircle size={20} className="text-emerald-500" />
                    <div>
                      <p className="font-medium text-slate-800">Sheet_CS_ThirdYear.xlsx generated</p>
                      <p className="text-xs text-slate-500 mt-1">60 students processed via voice entry</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{i} hour{i>1?'s':''} ago</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
