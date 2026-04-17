import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Breadcrumb from '../components/Breadcrumb';
import { FileSpreadsheet, Download, Trash2, ArrowLeft } from 'lucide-react';

const FileDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const mockFile = {
    id,
    fileName: `Marks_${id ? id : 'Data'}.xlsx`,
    size: '15 KB',
    date: '2026-04-05',
    uploader: 'Prof. Smith',
    department: 'Computer Science',
    totalEntries: 60,
    status: 'Processed'
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <Breadcrumb />
      <main className="flex-1 w-full max-w-7xl mx-auto p-8">
        <button 
          onClick={() => navigate('/files')} 
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={18} /> Back to Files
        </button>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 max-w-4xl">
          <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="bg-blue-50 p-4 rounded-xl">
                <FileSpreadsheet size={48} className="text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">{mockFile.fileName}</h1>
                <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {mockFile.status}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition">
                <Download size={18} /> Download
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-red-200 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition">
                <Trash2 size={18} /> Delete
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 p-8">
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-100">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">File Information</h3>
              <ul className="space-y-3">
                <li className="flex justify-between border-b border-slate-200 pb-2"><span className="text-slate-500">ID</span> <span className="font-medium text-slate-800">{mockFile.id}</span></li>
                <li className="flex justify-between border-b border-slate-200 pb-2"><span className="text-slate-500">Size</span> <span className="font-medium text-slate-800">{mockFile.size}</span></li>
                <li className="flex justify-between pb-2"><span className="text-slate-500">Generated</span> <span className="font-medium text-slate-800">{mockFile.date}</span></li>
              </ul>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-100">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Metadata</h3>
              <ul className="space-y-3">
                <li className="flex justify-between border-b border-slate-200 pb-2"><span className="text-slate-500">Uploader</span> <span className="font-medium text-slate-800">{mockFile.uploader}</span></li>
                <li className="flex justify-between border-b border-slate-200 pb-2"><span className="text-slate-500">Department</span> <span className="font-medium text-slate-800">{mockFile.department}</span></li>
                <li className="flex justify-between pb-2"><span className="text-slate-500">Total Entries</span> <span className="font-medium text-slate-800">{mockFile.totalEntries} students</span></li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FileDetails;
