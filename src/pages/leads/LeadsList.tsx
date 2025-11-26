import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Plus,
  Phone,
  Mail,
  MessageCircle,
  Eye,
  Edit,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getLeads } from '@/api/leads';
import { Lead } from '@/types';
import { useState } from 'react';

export default function LeadsList() {
  const navigate = useNavigate();
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: getLeads,
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Leads</h1>
            <p className="text-muted-foreground mt-2">
              Manage your client requirements
            </p>
          </div>
          <Button onClick={() => navigate('/leads/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Lead
          </Button>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Loading leads...
            </CardContent>
          </Card>
        ) : leads.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No leads found</p>
              <Button onClick={() => navigate('/leads/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Lead
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {leads.map((lead: Lead) => (
              <LeadCard key={lead.id} lead={lead} navigate={navigate} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

/* -------------------------------------------------------
   LEAD CARD COMPONENT WITH TWISTY + COLLAPSE DESCRIPTION
--------------------------------------------------------- */

function LeadCard({ lead, navigate }: { lead: Lead; navigate: any }) {
  const [openDesc, setOpenDesc] = useState(false);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">

            {/* 🔹 Line 1 — Name + Mobile + Icons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-foreground">
                  {lead.name}
                </h3>
                <span className="text-muted-foreground">{lead.mobile}</span>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" asChild>
                  <a href={`tel:${lead.mobile}`}>
                    <Phone className="h-4 w-4" />
                  </a>
                </Button>

                {lead.whatsapp && (
                  <Button size="sm" variant="ghost" asChild>
                    <a
                      href={`https://wa.me/${lead.whatsapp.replace(
                        /[^0-9]/g,
                        ''
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  </Button>
                )}

                {lead.email && (
                  <Button size="sm" variant="ghost" asChild>
                    <a href={`mailto:${lead.email}`}>
                      <Mail className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* 🔹 Line 2 — Tech, Platform, LeadSource + Twisty on RIGHT */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="font-medium">{lead.technology}</span>
                {lead.platform && <span>• {lead.platform}</span>}
                <span>• {lead.leadSource}</span>
              </div>

              {/* 🔽 Expand / Collapse Button */}
              <button
                onClick={() => setOpenDesc(!openDesc)}
                className="text-gray-600 hover:text-black transition ml-3"
              >
                {openDesc ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
              </button>
            </div>

            {/* 🔹 Status Badges */}
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                {lead.leadStatus}
              </span>
              <span className="px-2 py-1 text-xs rounded-full bg-secondary text-secondary-foreground">
                {lead.followupStatus}
              </span>
              <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">
                {lead.budget}
              </span>
            </div>

            {/* 🔽 Description Collapse Area */}
            {openDesc && (
              <div className="mt-3 p-3 bg-gray-50 border rounded-md text-sm text-gray-700 whitespace-pre-line">
                {lead.description || 'No description provided.'}
              </div>
            )}
          </div>

          {/* 🔹 Right-Side Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/leads/${lead.id}`)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
            <Button size="sm" onClick={() => navigate(`/leads/${lead.id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}