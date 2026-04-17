import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; // We'd typically import this, but since we are bare-bones, we'll construct basic PDF or use autoTable if available.

// Since we can't easily install jspdf-autotable plugin in this restricted environment without node, 
// we will just construct a simple PDF layout.

export interface StudentMark {
  regNo: string;
  mark: number | string;
  total: number;
}

export const exportToExcel = (data: StudentMark[], filename: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Marks");
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const exportToPDF = (data: StudentMark[], filename: string, departmentCode: string) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text("Faculty Voice-Based Mark Entry Report", 14, 20);
  
  doc.setFontSize(12);
  doc.text(`Department Code: ${departmentCode}`, 14, 30);
  doc.text(`Date generated: ${new Date().toLocaleDateString()}`, 14, 38);
  
  let yPos = 50;
  
  // Table Header
  doc.setFont("helvetica", "bold");
  doc.text("Register No", 14, yPos);
  doc.text("Mark", 100, yPos);
  doc.text("Total", 150, yPos);
  
  doc.setLineWidth(0.5);
  doc.line(14, yPos + 2, 190, yPos + 2);
  
  yPos += 10;
  doc.setFont("helvetica", "normal");
  
  // Table rows
  data.forEach(student => {
    if(yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(student.regNo.toString(), 14, yPos);
    doc.text(student.mark.toString(), 100, yPos);
    doc.text(student.total.toString(), 150, yPos);
    yPos += 10;
  });
  
  // HOD Signature block
  yPos += 20;
  if(yPos > 270) { doc.addPage(); yPos = 40; }
  
  doc.line(140, yPos, 190, yPos);
  doc.text("HOD Signature", 145, yPos + 8);
  
  doc.save(`${filename}.pdf`);
};
