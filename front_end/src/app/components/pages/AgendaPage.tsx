import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Link as LinkIcon, FileText, Plus, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { useAuth } from '@/app/context/AuthContext';
import api from '@/services/api';

export const AgendaPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [agendas, setAgendas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAgendas = async () => {
      try {
        setIsLoading(true);
        const response = await api.agendas.getAll();
        setAgendas(response.data || []);
      } catch (error) {
        console.error('Failed to fetch agendas:', error);
        setAgendas([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAgendas();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading agendas...</p>
        </div>
      </div>
    );
  }

  const today = new Date();
  const upcomingEvents = agendas.filter((a: any) => new Date(a.date) >= today);
  const pastEvents = agendas.filter((a: any) => new Date(a.date) < today);

  const EventCard = ({ event, isPast }: { event: any; isPast: boolean }) => (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Date Badge */}
          <div className="flex-shrink-0">
            {(() => {
              // Robust date formatting for ISO or string dates
              let dateObj: Date;
              if (event.date instanceof Date) {
                dateObj = event.date;
              } else {
                dateObj = new Date(event.date);
              }
              const month = dateObj.toLocaleString('default', { month: 'short' });
              const day = dateObj.getDate();
              return (
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex flex-col items-center justify-center text-white">
                  <span className="text-2xl font-bold">{day}</span>
                  <span className="text-xs">{month}</span>
                </div>
              );
            })()}
          </div>

          {/* Event Details */}
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{event.topic}</h3>
                <p className="text-gray-600 text-sm">{event.description}</p>
              </div>
              {!isPast && (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                  Upcoming
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4 text-blue-600" />
                <span>{event.speaker}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4 text-blue-600" />
                <span>{event.attendees} registered</span>
              </div>
            </div>

            {/* Resources */}
            {event.resources && event.resources.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <LinkIcon className="w-4 h-4" />
                  Resources:
                </span>
                {event.resources.map((resource: any, index: number) => (
                  <Badge key={index} variant="outline" className="cursor-pointer hover:bg-gray-100">
                    <FileText className="w-3 h-3 mr-1" />
                    {resource.url ? (
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="underline text-blue-700">
                        {resource.title || resource.url}
                      </a>
                    ) : (
                      resource.title || resource.url || 'Resource'
                    )}
                  </Badge>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              {!isPast ? (
                <>
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                    Register
                  </Button>
                  <Button variant="outline">
                    Add to Calendar
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline">
                    View Recording
                  </Button>
                  <Button variant="outline">
                    Download Resources
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            Session Agenda
          </h1>
          <p className="text-gray-600 mt-1">View and manage club sessions and events</p>
        </div>
        {(user?.role === 'teacher' || user?.role === 'admin') && (
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        )}
      </div>

      {/* Calendar View Toggle */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4 mt-6">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} isPast={false} />
            ))
          ) : (
            <Card className="shadow-md">
              <CardContent className="p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No upcoming events scheduled</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4 mt-6">
          {pastEvents.length > 0 ? (
            pastEvents.map((event) => (
              <EventCard key={event.id} event={event} isPast={true} />
            ))
          ) : (
            <Card className="shadow-md">
              <CardContent className="p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No past events</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
