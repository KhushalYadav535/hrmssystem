'use client';

import { formatDateDDMMYYYY } from '@/lib/date-format';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Loader2 } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';

export default function CertificatesPage() {
  const { currentUser } = useAuth();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const res = await apiService.getCertificates();
      if (res.success && res.data) {
        setCertificates(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error: any) {
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Certificates</h1>
          <p className="text-muted-foreground">View your completed training certificates</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : certificates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No certificates yet</p>
              <p className="text-sm">Complete trainings to earn certificates</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {certificates.map((cert: any) => (
              <Card key={cert._id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{cert.courseId?.courseName || 'Course'}</CardTitle>
                    <Badge>Completed</Badge>
                  </div>
                  <CardDescription>{cert.courseId?.courseCode}</CardDescription>
                </CardHeader>
                <CardContent>
                  {cert.completedDate && (
                    <p className="text-sm text-muted-foreground">
                      Completed on {formatDateDDMMYYYY(cert.completedDate)}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
