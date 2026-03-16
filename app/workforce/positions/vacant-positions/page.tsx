'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Users, MapPin, Briefcase, Loader2, Plus } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

/**
 * Vacant Positions Page
 * BR-HRMS-06: Branch-wise vacant positions for transfers and promotions
 */
export default function VacantPositionsPage() {
  const { currentUser } = useAuth();
  const [positions, setPositions] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [branchFilter, setBranchFilter] = useState<string>('all');

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    loadPositions();
  }, [branchFilter]);

  const loadBranches = async () => {
    try {
      const response = await apiService.getOrganizationUnits({ type: 'BRANCH' });
      if (response.success && response.data) {
        setBranches(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Failed to load branches');
    }
  };

  const loadPositions = async () => {
    try {
      setLoading(true);
      const params: any = { status: 'Vacant' };
      if (branchFilter !== 'all') {
        params.postingUnitId = branchFilter;
      }

      const response = await apiService.getVacantPositionsByBranch(branchFilter !== 'all' ? branchFilter : undefined);
      if (response.success && response.data) {
        // Response is grouped by branch
        const allPositions: any[] = [];
        if (Array.isArray(response.data)) {
          response.data.forEach((group: any) => {
            if (group.positions && Array.isArray(group.positions)) {
              allPositions.push(...group.positions);
            }
          });
        }
        setPositions(allPositions);
      }
    } catch (error: any) {
      toast.error('Failed to load vacant positions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Vacant Positions</h1>
            <p className="text-muted-foreground mt-2">
              View vacant positions across branches for transfers and promotions
            </p>
          </div>
        </div>

        {/* Filter */}
        <Card>
          <CardContent className="pt-6">
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch._id} value={branch._id}>
                    {branch.unitCode} - {branch.unitName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Positions List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {positions.map((position) => (
            <Card key={position._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      {position.title}
                    </CardTitle>
                    <CardDescription>{position.positionCode}</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Vacant
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {position.postingUnitId && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">
                      {typeof position.postingUnitId === 'object'
                        ? `${position.postingUnitId.unitCode} - ${position.postingUnitId.unitName}`
                        : 'Loading...'}
                    </span>
                  </div>
                )}
                {position.locationId && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {typeof position.locationId === 'object'
                        ? `${position.locationId.city}, ${position.locationId.state}`
                        : 'Loading...'}
                    </span>
                  </div>
                )}
                {position.designation && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Designation: </span>
                    <span className="font-medium">
                      {typeof position.designation === 'object' ? position.designation.name : position.designation}
                    </span>
                  </div>
                )}
                {position.department && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Department: </span>
                    <span className="font-medium">{position.department}</span>
                  </div>
                )}
                {position.minExperience !== undefined && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Min Experience: </span>
                    <span>{position.minExperience} years</span>
                  </div>
                )}
                {(position.minSalary || position.maxSalary) && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Salary: </span>
                    <span>
                      {position.minSalary && `₹${position.minSalary.toLocaleString()}`}
                      {position.minSalary && position.maxSalary && ' - '}
                      {position.maxSalary && `₹${position.maxSalary.toLocaleString()}`}
                    </span>
                  </div>
                )}
                {position.description && (
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {position.description}
                  </div>
                )}
                <div className="pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      // Navigate to employee transfer page with position pre-filled
                      window.location.href = `/workforce/transfers?positionId=${position._id}`;
                    }}
                  >
                    Fill Position
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {positions.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No vacant positions found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
