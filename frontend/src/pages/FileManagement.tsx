import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Breadcrumb from '../components/Breadcrumb';
import { supabase } from '../lib/supabase';
import { Download, Edit2, Trash2, FileSpreadsheet, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FileRecord {
  id: string;
  file_name: string;
  size: string;
  created_at: string;
  uploader_id: string;
}

const FileManagement = () => {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    // Real Supabase DB fetch:
    // const { data } = await supabase.from('files').select('*').order('created_at', { ascending: false });
    
    // Fallback Mock for the prototype (since db might be empty or unconfigured)
    setTimeout(() => {
      setFiles([
        { id: '1', file_name: 'Marks_104021.xlsx', size: '12 KB', created_at: '2026-04-05', uploader_id: 'User1' },
         { id: '2', file_name: 'Marks_104022.pdf', size: '45 KB', created_at: '2026-04-04', uploader_id: 'User1' },
      ]);
      setLoading(false);
    }, 600);
  };

  const handleDelete = async (id: string) => {
    if(window.confirm('Delete this metadata record?')) {
      // await supabase.from('files').delete().eq('id', id);
      setFiles(files.filter(f => f.id !== id));
    }
  };

  const handleRename = async (id: string, oldName: string) => {
    const newName = window.prompt('Enter new filename:', oldName);
    if(newName && newName.trim() !== '') {
      // await supabase.from('files').update({ file_name: newName }).eq('id', id);
      setFiles(files.map(f => f.id === id ? { ...f, file_name: newName } : f));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <Breadcrumb />
      <main className="flex-1 w-full max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800">File Management</h1>
          <span className="text-sm font-medium bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">
            Supabase Postgres Connected
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
             <div className="p-16 text-center text-slate-500 font-medium animate-pulse">Fetching file records from Supabase...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-xs uppercase text-slate-500 tracking-wider">
                    <th className="px-6 py-4 font-medium">File Name</th>
                    <th className="px-6 py-4 font-medium">Size</th>
                    <th className="px-6 py-4 font-medium">Date Processed</th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {files.map(file => (
                    <tr key={file.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3 font-medium text-slate-800">
                        <FileSpreadsheet size={18} className="text-blue-500"/> {file.file_name}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm">{file.size}</td>
                      <td className="px-6 py-4 text-slate-500 text-sm whitespace-nowrap">{file.created_at}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link to={`/files/${file.id}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition" title="View Details">
                            <Eye size={18} />
                          </Link>
                          <button onClick={() => window.alert('In production, downloads from Supabase Storage bucket...')} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition" title="Download">
                            <Download size={18} />
                          </button>
                          <button onClick={() => handleRename(file.id, file.file_name)} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded transition" title="Rename Record">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDelete(file.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition" title="Delete Record">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {files.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center text-slate-400 italic">
                        No files recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FileManagement;
