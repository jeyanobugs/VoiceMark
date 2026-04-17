import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Breadcrumb from '../components/Breadcrumb';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('VOICEMARK_STUDENTS') || '[]');
    setStudents(data);
    setTimeout(() => setLoading(false), 500);
  }, []);

  const statWrote = students.filter(s => s.mark !== 'AB').length;
  const statAbsent = students.filter(s => s.mark === 'AB').length;
  const statPass = students.filter(s => s.mark !== 'AB' && s.mark >= 50).length;
  const statFail = students.filter(s => s.mark !== 'AB' && s.mark < 50).length;

  const r1 = students.filter(s => s.mark !== 'AB' && s.mark < 50).length;
  const r2 = students.filter(s => s.mark >= 50 && s.mark < 60).length;
  const r3 = students.filter(s => s.mark >= 60 && s.mark < 70).length;
  const r4 = students.filter(s => s.mark >= 70 && s.mark < 80).length;
  const r5 = students.filter(s => s.mark >= 80 && s.mark < 90).length;
  const r6 = students.filter(s => s.mark >= 90 && s.mark <= 100).length;

  const barData = {
    labels: ['< 50 (Fail)', '50-60', '60-70', '70-80', '80-90', '90-100'],
    datasets: [
      {
        label: 'Number of Students',
        data: [r1, r2, r3, r4, r5, r6],
        backgroundColor: '#2563EB',
      },
    ],
  };

  const pieData = {
    labels: ['Pass', 'Fail', 'Absent'],
    datasets: [
      {
        data: [statPass, statFail, statAbsent],
        backgroundColor: ['#10B981', '#EF4444', '#64748B'],
      },
    ],
  };

  const downloadPDF = () => {
    const doc: any = new jsPDF();
    const dept = localStorage.getItem('VOICEMARK_DEPT') || '104021';
    
    doc.setFontSize(20);
    doc.text("VoiceMark Analytics Report", 14, 22);
    doc.setFontSize(12);
    doc.text(`Department: ${dept}`, 14, 32);
    doc.text(`Total Students: ${students.length}`, 14, 40);
    doc.text(`Passed: ${statPass}`, 14, 48);
    doc.text(`Failed: ${statFail}`, 14, 56);
    doc.text(`Absent: ${statAbsent}`, 14, 64);

    const tableData = students.map(s => [s.regNo, s.mark, s.mark === 'AB' ? 'Absent' : s.mark >= 50 ? 'Pass' : 'Fail']);
    (doc as any).autoTable({
      startY: 75,
      head: [['Register Number', 'Mark', 'Result']],
      body: tableData,
    });

    doc.save(`Analytics_Report_${dept}.pdf`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <Breadcrumb />
      <main className="flex-1 w-full max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Analytics & Reporting</h1>
          <button 
            onClick={downloadPDF}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg font-medium text-sm hover:bg-slate-900 transition"
          >
            Download PDF Report
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-slate-500 font-mono">Processing Data...</div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Pass Rate</p>
                <h2 className="text-2xl font-bold text-success mt-1">{statWrote > 0 ? Math.round((statPass / statWrote) * 100) : 0}%</h2>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Failures</p>
                <h2 className="text-2xl font-bold text-danger mt-1">{statFail}</h2>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Absentees</p>
                <h2 className="text-2xl font-bold text-secondary mt-1">{statAbsent}</h2>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Entries</p>
                <h2 className="text-2xl font-bold text-primary mt-1">{students.length}</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="col-span-1 lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-6">Grade Range Distribution</h2>
                <div className="h-[350px] w-full relative">
                  <Bar options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} data={barData} />
                </div>
              </div>

              <div className="col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-6">Pass / Fail Ratio</h2>
                <div className="h-[350px] w-full relative flex justify-center pb-4">
                  <Pie options={{ maintainAspectRatio: false }} data={pieData} />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Analytics;
