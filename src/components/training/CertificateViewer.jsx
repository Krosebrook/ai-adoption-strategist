import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, Download, Share2, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function CertificateViewer() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ['certificates', user?.email],
    queryFn: () => base44.entities.TrainingCertificate.filter({ 
      user_email: user.email 
    }, '-issue_date', 50),
    enabled: !!user,
    initialData: []
  });

  if (certificates.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Certificates Yet</h3>
          <p className="text-gray-600">
            Complete training modules to earn certificates
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {certificates.map(cert => (
        <Card key={cert.id} className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-amber-600" />
                <div>
                  <CardTitle className="text-xl">{cert.module_title}</CardTitle>
                  <div className="text-sm text-gray-600 mt-1">
                    Certificate #{cert.certificate_number}
                  </div>
                </div>
              </div>
              <Badge className={
                cert.status === 'active' ? 'bg-green-600' : 
                cert.status === 'expired' ? 'bg-yellow-600' : 
                'bg-gray-600'
              }>
                {cert.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-500">Issued To</div>
                <div className="font-medium">{cert.user_name}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Issue Date</div>
                <div className="font-medium">
                  {format(new Date(cert.issue_date), 'MMM d, yyyy')}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Score Achieved</div>
                <div className="font-semibold text-green-700">{cert.score_achieved}%</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Verification Code</div>
                <div className="font-mono text-xs">{cert.verification_code}</div>
              </div>
            </div>

            {cert.skills_mastered && cert.skills_mastered.length > 0 && (
              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-2">Skills Mastered</div>
                <div className="flex flex-wrap gap-1">
                  {cert.skills_mastered.map((skill, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}