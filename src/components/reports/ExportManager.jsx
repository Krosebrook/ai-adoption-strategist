import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, Table, FileSpreadsheet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

export default function ExportManager({ data, title, open, onOpenChange }) {
  const [format, setFormat] = useState('pdf');
  const [exporting, setExporting] = useState(false);

  const exportToPDF = () => {
    const doc = new jsPDF();
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.text(title || 'Report', 20, yPosition);
    yPosition += 15;

    // Add metadata
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, yPosition);
    yPosition += 10;

    // Add data
    doc.setFontSize(12);
    const processData = (obj, indent = 0) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      Object.entries(obj || {}).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          doc.setFont(undefined, 'bold');
          doc.text(`${' '.repeat(indent * 2)}${key}:`, 20 + indent * 5, yPosition);
          yPosition += 7;
          processData(value, indent + 1);
        } else if (Array.isArray(value)) {
          doc.setFont(undefined, 'bold');
          doc.text(`${' '.repeat(indent * 2)}${key}:`, 20 + indent * 5, yPosition);
          yPosition += 7;
          value.forEach((item, idx) => {
            doc.setFont(undefined, 'normal');
            doc.text(`${' '.repeat((indent + 1) * 2)}• ${typeof item === 'object' ? JSON.stringify(item) : item}`, 20 + (indent + 1) * 5, yPosition);
            yPosition += 6;
            if (yPosition > 270) {
              doc.addPage();
              yPosition = 20;
            }
          });
        } else {
          doc.setFont(undefined, 'normal');
          const text = `${' '.repeat(indent * 2)}${key}: ${value}`;
          doc.text(text, 20 + indent * 5, yPosition);
          yPosition += 7;
        }
      });
    };

    processData(data);
    doc.save(`${(title || 'report').replace(/\s+/g, '_')}.pdf`);
  };

  const exportToCSV = () => {
    const flattenObject = (obj, prefix = '') => {
      return Object.entries(obj || {}).reduce((acc, [key, value]) => {
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          Object.assign(acc, flattenObject(value, newKey));
        } else if (Array.isArray(value)) {
          acc[newKey] = value.join('; ');
        } else {
          acc[newKey] = value;
        }
        return acc;
      }, {});
    };

    const flatData = Array.isArray(data) ? data.map(flattenObject) : [flattenObject(data)];
    const headers = Object.keys(flatData[0]);
    const csvContent = [
      headers.join(','),
      ...flatData.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(title || 'report').replace(/\s+/g, '_')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(title || 'report').replace(/\s+/g, '_')}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      switch (format) {
        case 'pdf':
          exportToPDF();
          break;
        case 'csv':
          exportToCSV();
          break;
        case 'json':
          exportToJSON();
          break;
      }
      toast.success(`Exported as ${format.toUpperCase()}`);
      onOpenChange(false);
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Report</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Export Format</label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF Document
                  </div>
                </SelectItem>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <Table className="h-4 w-4" />
                    CSV Spreadsheet
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    JSON Data
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg text-sm">
            <strong>Preview:</strong> {title || 'Report'}.{format}
          </div>

          <Button 
            onClick={handleExport} 
            disabled={exporting}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export {format.toUpperCase()}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}