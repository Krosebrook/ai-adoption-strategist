import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  FileText, Code, Boxes, Rocket, Brain, 
  Users, Database, Shield, Download, BookOpen
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Import documentation content
import { README } from '../components/docs/README';
import { ARCHITECTURE } from '../components/docs/ARCHITECTURE';
import { API_DOCS } from '../components/docs/API_DOCS';
import { AI_SERVICES } from '../components/docs/AI_SERVICES';
import { PRODUCT_FEATURES } from '../components/docs/PRODUCT_FEATURES';
import { DEVELOPER_GUIDE } from '../components/docs/DEVELOPER_GUIDE';
import { DEPLOYMENT } from '../components/docs/DEPLOYMENT';
import { GOVERNANCE } from '../components/docs/GOVERNANCE';

export default function Documentation() {
  const [activeDoc, setActiveDoc] = useState('readme');

  const docs = {
    readme: { title: 'Overview', icon: BookOpen, content: README },
    architecture: { title: 'Architecture', icon: Boxes, content: ARCHITECTURE },
    developer: { title: 'Developer Guide', icon: Code, content: DEVELOPER_GUIDE },
    api: { title: 'API Documentation', icon: Database, content: API_DOCS },
    ai: { title: 'AI Services', icon: Brain, content: AI_SERVICES },
    features: { title: 'Product Features', icon: Users, content: PRODUCT_FEATURES },
    deployment: { title: 'Deployment', icon: Rocket, content: DEPLOYMENT },
    governance: { title: 'AI Governance', icon: Shield, content: GOVERNANCE }
  };

  const handleDownload = () => {
    const allDocs = Object.entries(docs).map(([key, doc]) => {
      return `# ${doc.title}\n\n${doc.content}\n\n---\n\n`;
    }).join('\n');

    const blob = new Blob([allDocs], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'INT-Inc-AI-Platform-Documentation.md';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: 'var(--color-text)' }}>
              <FileText className="h-8 w-8" style={{ color: 'var(--color-primary)' }} />
              Technical Documentation
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Complete documentation for developers, product managers, and AI service teams
            </p>
          </div>
          <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Download All Docs
          </Button>
        </div>

        {/* Documentation Navigator */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(docs).map(([key, doc]) => {
                const Icon = doc.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveDoc(key)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      activeDoc === key
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-slate-200 hover:border-orange-300'
                    }`}
                  >
                    <Icon className={`h-6 w-6 mb-2 ${
                      activeDoc === key ? 'text-orange-600' : 'text-slate-600'
                    }`} />
                    <p className="text-sm font-medium">{doc.title}</p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Documentation Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(docs[activeDoc].icon, { className: "h-5 w-5" })}
              {docs[activeDoc].title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold mb-4 text-slate-900">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-semibold mt-8 mb-4 text-slate-800">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-700">{children}</h3>
                  ),
                  code: ({ inline, children }) => (
                    inline ? (
                      <code className="px-1.5 py-0.5 rounded bg-slate-100 text-sm text-slate-800">
                        {children}
                      </code>
                    ) : (
                      <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto">
                        <code>{children}</code>
                      </pre>
                    )
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-2 my-4">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-2 my-4">{children}</ol>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4">
                      <table className="min-w-full border border-slate-300">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border border-slate-300 px-4 py-2 bg-slate-100 font-semibold">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-slate-300 px-4 py-2">{children}</td>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-orange-500 pl-4 italic my-4 text-slate-600">
                      {children}
                    </blockquote>
                  )
                }}
              >
                {docs[activeDoc].content}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}