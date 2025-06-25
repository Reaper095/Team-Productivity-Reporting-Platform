import React, { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';

interface PDFExportButtonProps {
  data?: any;
  filename?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

const PDFExportButton: React.FC<PDFExportButtonProps> = ({
  data,
  filename = 'team-productivity-report',
  disabled = false,
  variant = 'primary'
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (disabled || isExporting) return;

    setIsExporting(true);
    
    try {
      // Simulate PDF generation - In real implementation, you'd call your backend API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a mock PDF blob (in real app, this would come from your PDF generation service)
      const pdfContent = `Team Productivity Report\n\nGenerated on: ${new Date().toLocaleString()}\n\nData: ${JSON.stringify(data, null, 2)}`;
      const blob = new Blob([pdfContent], { type: 'text/plain' }); // In real app, this would be 'application/pdf'
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.txt`; // In real app, this would be .pdf
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const baseClasses = "inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = variant === 'primary'
    ? "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500"
    : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 focus:ring-gray-500";

  return (
    <button
      onClick={handleExport}
      disabled={disabled || isExporting}
      className={`${baseClasses} ${variantClasses}`}
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </>
      )}
    </button>
  );
};

export default PDFExportButton;