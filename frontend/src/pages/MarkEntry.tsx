import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Breadcrumb from '../components/Breadcrumb';
import { useVoiceEntry } from '../hooks/useVoice';
import { StudentMark, exportToExcel, exportToPDF } from '../services/export';
import { Mic, MicOff, Save, Download, FileAudio, Activity } from 'lucide-react';

const MarkEntry = () => {
  const [departmentCode, setDepartmentCode] = useState(() => localStorage.getItem('VOICEMARK_DEPT') || '104021');
  const [students, setStudents] = useState<StudentMark[]>(() => JSON.parse(localStorage.getItem('VOICEMARK_STUDENTS') || '[]'));
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [isFastMode, setIsFastMode] = useState(false);
  const [sortToast, setSortToast] = useState(false);
  
  const { listenForInput, speak, interimText, WebSpeechRecognition } = useVoiceEntry();

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 10)); 
  };

  useEffect(() => {
    localStorage.setItem('VOICEMARK_STUDENTS', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('VOICEMARK_DEPT', departmentCode);
  }, [departmentCode]);

  const wordToNumMap: Record<string, number> = {
    'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9,
    'ten': 10, 'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15, 'sixteen': 16,
    'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50,
    'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90, 'hundred': 100
  };

  const parseNumbers = (text: string): string => {
    if (!text) return '';
    let cleanText = text.toLowerCase().replace(/[^a-z0-9 ]/g, '');
    if (cleanText.includes('absent')) return 'AB';
    
    const parts = cleanText.split(' ');
    let result = '';
    parts.forEach(p => {
      if (/[0-9]+/.test(p)) result += p.replace(/\D/g, '');
      else if (wordToNumMap[p] !== undefined) result += wordToNumMap[p].toString();
    });
    
    return result || cleanText.replace(/\D/g, '');
  };

  const runDictationCycle = async () => {
    if (!isSessionActive) return;

    try {
      const prompt1 = isFastMode ? "Reg?" : "Tell me reg.no";
      addLog(`System: "${prompt1}"`);
      await speak(prompt1);
      
      const regInput = await listenForInput();
      if (!isSessionActive) return;

      const digits = parseNumbers(regInput);
      if (!digits) {
        addLog('System: "Retry reg"');
        await speak("Retry");
        setTimeout(runDictationCycle, 200);
        return;
      }

      const fullRegNo = `${departmentCode}${digits.padStart(2, '0')}`;
      addLog(`You: "${regInput}" -> ${fullRegNo}`);
      
      const prompt2 = isFastMode ? "Mark?" : "Tell me mark";
      addLog(`System: "${prompt2}"`);
      await speak(prompt2);
      
      const markInput = await listenForInput();
      if (!isSessionActive) return;

      const parsedMarkStr = parseNumbers(markInput);
      if (!parsedMarkStr) {
        addLog('System: "Retry mark"');
        await speak("Retry");
        setTimeout(runDictationCycle, 200);
        return;
      }

      let finalMarkValue: string | number = 'AB';
      if (parsedMarkStr !== 'AB') {
        finalMarkValue = parseInt(parsedMarkStr) * multiplier;
      }

      addLog(`You: "${markInput}" -> ${finalMarkValue}`);
      await speak(`${digits}, ok`);

      setStudents(prev => {
        const arr = [...prev];
        const ex = arr.findIndex(s => s.regNo === fullRegNo);
        const entry = { regNo: fullRegNo, mark: finalMarkValue, total: 100 };
        if (ex >= 0) arr[ex] = entry;
        else arr.unshift(entry);
        return arr;
      });

      setTimeout(runDictationCycle, 300);

    } catch (e) {
      console.error(e);
      addLog('Error during voice capture');
    }
  };

  useEffect(() => {
    if (isSessionActive) runDictationCycle();
  }, [isSessionActive, multiplier]); 
  
  const toggleSession = () => {
    if (!WebSpeechRecognition) {
      alert("Speech Recognition not supported.");
      return;
    }
    const nextState = !isSessionActive;
    if (isSessionActive) {
      window.speechSynthesis.cancel();
      speak("Stopped.");
    }
    setIsSessionActive(nextState);
    addLog(nextState ? 'Started.' : 'Stopped.');
  };

  const handleSort = () => {
    setStudents(prev => {
      const sorted = [...prev].sort((a, b) => {
        const lastTwoA = parseInt(a.regNo.slice(-2), 10);
        const lastTwoB = parseInt(b.regNo.slice(-2), 10);
        return lastTwoA - lastTwoB;
      });
      return sorted;
    });
    setSortToast(true);
    setTimeout(() => setSortToast(false), 3000);
  };

  const handleExportExcel = () => {
    if (students.length === 0) return alert('No data');
    exportToExcel(students, `Marks_${departmentCode}`);
  };

  const handleExportPDF = () => {
    if (students.length === 0) return alert('No data');
    exportToPDF(students, `Marks_${departmentCode}`, departmentCode);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <Breadcrumb />
      <main className="flex-1 w-full max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <FileAudio size={22} className="text-blue-600" /> Session Controls
            </h2>

            <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg text-primary border border-blue-100">
              <input 
                type="checkbox" 
                id="fastMode" 
                checked={isFastMode} 
                onChange={e => setIsFastMode(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="fastMode" className="text-sm font-bold cursor-pointer uppercase tracking-tight">Fast Optimization Mode</label>
            </div>
            
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 mb-2">Department Code</label>
              <input 
                value={departmentCode} 
                onChange={e => setDepartmentCode(e.target.value)} 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Multiplier Tools</label>
              <div className="flex gap-2">
                {[1, 2, 4].map(val => (
                  <button 
                    key={val}
                    className={`flex-1 py-2 border font-medium rounded-lg transition-colors ${multiplier === val ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                    onClick={() => setMultiplier(val)}
                  >
                    x{val}
                  </button>
                ))}
              </div>
            </div>

            <button 
              className={`w-full flex items-center justify-center gap-2 font-bold py-4 rounded-xl transition-all shadow-sm ${isSessionActive ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
              onClick={toggleSession}
            >
              {isSessionActive ? <><MicOff size={20} /> Stop Session</> : <><Mic size={20} /> Start Voice Entry</>}
            </button>
            <div className="flex gap-2 w-full mt-4">
              <button onClick={() => { if(confirm("New file? All current marks will be cleared.")) setStudents([]); }} className="flex-1 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">New File</button>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl shadow-inner border border-slate-800 p-6 h-80 flex flex-col">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-slate-400 font-medium text-sm flex items-center gap-2 uppercase tracking-wider">
                <Activity size={16} /> Process Log
              </h3>
              {isSessionActive && <div className="text-red-500 animate-pulse text-[10px] items-center flex gap-1"><div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div> LISTENING</div>}
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 font-mono text-sm">
              {interimText && <div className="text-yellow-300 italic text-xs bg-slate-800 p-2 rounded">Hearing: "{interimText}"...</div>}
              {logs.map((log, i) => (
                <div key={i} className={`${log.startsWith('You:') ? 'text-sky-400' : log.startsWith('System:') ? 'text-slate-500' : 'text-slate-300'}`}>
                   {log}
                </div>
              ))}
              {logs.length === 0 && !interimText && <div className="text-slate-600 italic">Waiting...</div>}
            </div>
          </div>
        </div>

        <div className="col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[700px]">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-800">Excel Preview Table</h2>
              {sortToast && (
                <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-100 animate-pulse">Sorted ↑</span>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={handleSort} className="flex items-center gap-2 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-bold hover:bg-amber-600 transition">
                Sort ↑
              </button>
              <button onClick={handleExportExcel} className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition">
                <Save size={14}/> Excel
              </button>
              <button onClick={handleExportPDF} className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition">
                <Download size={14}/> PDF
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-0">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white shadow-sm ring-1 ring-slate-200">
                <tr className="text-xs uppercase text-slate-500 tracking-wider">
                  <th className="px-6 py-4 font-medium">Register Number</th>
                  <th className="px-6 py-4 font-medium text-center">Spoken Mark</th>
                  <th className="px-6 py-4 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => (
                  <tr key={student.regNo} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 text-slate-800 font-mono font-medium">{student.regNo}</td>
                    <td className="px-6 py-4 text-slate-500 text-center">{student.mark}</td>
                    <td className={`px-6 py-4 font-bold ${student.mark === 'AB' ? 'text-red-500' : 'text-slate-800'}`}>
                      {student.mark === 'AB' ? 'AB' : student.mark}
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-16 text-center text-slate-400 italic">
                      No entries registered.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MarkEntry;
