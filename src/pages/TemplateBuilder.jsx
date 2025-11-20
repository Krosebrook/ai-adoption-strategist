import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Save, Trash2, GripVertical, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { BrandCard, BrandCardContent, BrandCardHeader, BrandCardTitle } from '../components/ui/BrandCard';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function TemplateBuilder() {
  const queryClient = useQueryClient();
  const [templateName, setTemplateName] = useState('');
  const [templateType, setTemplateType] = useState('custom');
  const [sections, setSections] = useState([]);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const { data: templates = [] } = useQuery({
    queryKey: ['reportTemplates'],
    queryFn: () => base44.entities.ReportTemplate.list('-created_date'),
    initialData: []
  });

  const createTemplateMutation = useMutation({
    mutationFn: (data) => base44.entities.ReportTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportTemplates'] });
      toast.success('Template saved successfully');
      resetForm();
    }
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ReportTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportTemplates'] });
      toast.success('Template updated successfully');
      resetForm();
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id) => base44.entities.ReportTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportTemplates'] });
      toast.success('Template deleted');
    }
  });

  const sectionTypes = [
    { value: 'overview', label: 'Overview' },
    { value: 'recommendations', label: 'Platform Recommendations' },
    { value: 'roi', label: 'ROI Analysis' },
    { value: 'compliance', label: 'Compliance Matrix' },
    { value: 'risks', label: 'Risk Assessment' },
    { value: 'implementation', label: 'Implementation Plan' },
    { value: 'technical_specs', label: 'Technical Specifications' },
    { value: 'ai_insights', label: 'AI-Generated Insights' },
    { value: 'custom_text', label: 'Custom Text Section' }
  ];

  const addSection = () => {
    setSections([...sections, {
      id: Date.now().toString(),
      title: '',
      type: 'overview',
      enabled: true,
      order: sections.length,
      ai_enhanced: false
    }]);
  };

  const updateSection = (id, field, value) => {
    setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeSection = (id) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSections(items.map((item, idx) => ({ ...item, order: idx })));
  };

  const saveTemplate = () => {
    if (!templateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }
    if (sections.length === 0) {
      toast.error('Please add at least one section');
      return;
    }

    const templateData = {
      name: templateName,
      type: templateType,
      sections: sections.map(s => ({
        title: s.title,
        type: s.type,
        enabled: s.enabled,
        order: s.order,
        ai_enhanced: s.ai_enhanced
      })),
      formatting: {
        include_charts: true,
        include_tables: true,
        detail_level: 'detailed'
      }
    };

    if (editingTemplate) {
      updateTemplateMutation.mutate({ id: editingTemplate.id, data: templateData });
    } else {
      createTemplateMutation.mutate(templateData);
    }
  };

  const loadTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplateType(template.type);
    setSections(template.sections.map((s, idx) => ({
      ...s,
      id: `${template.id}-${idx}`
    })));
  };

  const resetForm = () => {
    setEditingTemplate(null);
    setTemplateName('');
    setTemplateType('custom');
    setSections([]);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              Report Template Builder
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Create custom report templates with AI-enhanced sections
            </p>
          </div>
          <Link to={createPageUrl('Reports')}>
            <Button variant="outline" style={{ borderColor: 'var(--color-border)' }}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Reports
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template Builder */}
          <div className="lg:col-span-2 space-y-6">
            <BrandCard>
              <BrandCardHeader>
                <BrandCardTitle>
                  {editingTemplate ? 'Edit Template' : 'New Template'}
                </BrandCardTitle>
              </BrandCardHeader>
              <BrandCardContent className="space-y-4">
                <div>
                  <Label style={{ color: 'var(--color-text)' }}>Template Name</Label>
                  <Input
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g., Executive Summary Template"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label style={{ color: 'var(--color-text)' }}>Template Type</Label>
                  <Select value={templateType} onValueChange={setTemplateType}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="executive">Executive</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>
                    Report Sections ({sections.length})
                  </h3>
                  <Button onClick={addSection} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Section
                  </Button>
                </div>

                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="sections">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                        {sections.map((section, index) => (
                          <Draggable key={section.id} draggableId={section.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="p-4 rounded-lg border"
                                style={{
                                  ...provided.draggableProps.style,
                                  borderColor: 'var(--color-border)',
                                  background: 'var(--color-surface)'
                                }}
                              >
                                <div className="flex items-start gap-3">
                                  <div {...provided.dragHandleProps} className="pt-2 cursor-move">
                                    <GripVertical className="h-5 w-5" style={{ color: 'var(--color-text-secondary)' }} />
                                  </div>
                                  <div className="flex-1 space-y-3">
                                    <Input
                                      value={section.title}
                                      onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                                      placeholder="Section Title"
                                    />
                                    <div className="flex gap-3">
                                      <Select
                                        value={section.type}
                                        onValueChange={(value) => updateSection(section.id, 'type', value)}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {sectionTypes.map(t => (
                                            <SelectItem key={t.value} value={t.value}>
                                              {t.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <label className="flex items-center gap-2 px-3 rounded-lg border cursor-pointer" style={{ borderColor: 'var(--color-border)' }}>
                                        <input
                                          type="checkbox"
                                          checked={section.ai_enhanced}
                                          onChange={(e) => updateSection(section.id, 'ai_enhanced', e.target.checked)}
                                          className="rounded"
                                        />
                                        <span className="text-sm whitespace-nowrap" style={{ color: 'var(--color-text)' }}>
                                          AI Enhanced
                                        </span>
                                      </label>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeSection(section.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>

                {sections.length === 0 && (
                  <div className="text-center py-8 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    No sections added yet. Click "Add Section" to start building your template.
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={saveTemplate}
                    disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
                    className="text-white"
                    style={{
                      background: 'linear-gradient(135deg, var(--color-teal-500), var(--color-teal-600))',
                      border: 'none'
                    }}
                  >
                    {(createTemplateMutation.isPending || updateTemplateMutation.isPending) ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {editingTemplate ? 'Update Template' : 'Save Template'}
                  </Button>
                  {editingTemplate && (
                    <Button variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  )}
                </div>
              </BrandCardContent>
            </BrandCard>
          </div>

          {/* Saved Templates */}
          <div>
            <BrandCard>
              <BrandCardHeader>
                <BrandCardTitle>Saved Templates ({templates.length})</BrandCardTitle>
              </BrandCardHeader>
              <BrandCardContent>
                {templates.length === 0 ? (
                  <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>
                    No templates saved yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {templates.map(template => (
                      <div
                        key={template.id}
                        className="p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all"
                        style={{ borderColor: 'var(--color-border)' }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                              {template.name}
                            </h4>
                            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                              {template.type} • {template.sections?.length || 0} sections
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => loadTemplate(template)}
                            className="flex-1"
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteTemplateMutation.mutate(template.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </BrandCardContent>
            </BrandCard>
          </div>
        </div>
      </div>
    </div>
  );
}