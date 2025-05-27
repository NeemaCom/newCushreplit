import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GripVertical, 
  Settings, 
  Plus, 
  Eye, 
  EyeOff,
  Wallet,
  TrendingUp,
  Home,
  Brain,
  FileText,
  Shield,
  Calendar,
  PieChart,
  CreditCard,
  MapPin,
  Bell,
  Users
} from 'lucide-react';

interface DashboardWidget {
  id: string;
  title: string;
  type: 'wallet' | 'chart' | 'list' | 'status' | 'ai' | 'calendar' | 'map';
  size: 'small' | 'medium' | 'large';
  icon: any;
  visible: boolean;
  position: number;
  data?: any;
}

interface DragDropDashboardProps {
  userPreferences?: any;
  onLayoutChange?: (widgets: DashboardWidget[]) => void;
}

const defaultWidgets: DashboardWidget[] = [
  {
    id: 'wallet_overview',
    title: 'Wallet Overview',
    type: 'wallet',
    size: 'medium',
    icon: Wallet,
    visible: true,
    position: 0,
    data: {
      balance: '$5,847.23',
      currency: 'USD',
      change: '+2.3%',
      accounts: 3
    }
  },
  {
    id: 'exchange_rates',
    title: 'Exchange Rates',
    type: 'chart',
    size: 'medium',
    icon: TrendingUp,
    visible: true,
    position: 1,
    data: {
      pairs: [
        { from: 'USD', to: 'GBP', rate: 0.82, change: '+0.5%' },
        { from: 'USD', to: 'NGN', rate: 1640, change: '-1.2%' },
        { from: 'GBP', to: 'NGN', rate: 2000, change: '-0.8%' }
      ]
    }
  },
  {
    id: 'housing_matches',
    title: 'Housing Matches',
    type: 'list',
    size: 'large',
    icon: Home,
    visible: true,
    position: 2,
    data: {
      matches: [
        { location: 'Manchester, UK', type: '2-bed apartment', price: '£850/month', score: 95 },
        { location: 'London, UK', type: '1-bed studio', price: '£1,200/month', score: 88 },
        { location: 'Birmingham, UK', type: '2-bed house', price: '£750/month', score: 82 }
      ]
    }
  },
  {
    id: 'ai_insights',
    title: 'AI Insights',
    type: 'ai',
    size: 'medium',
    icon: Brain,
    visible: true,
    position: 3,
    data: {
      insights: [
        'Your student visa application is 85% complete',
        'Consider transferring funds to GBP while rates are favorable',
        'New housing options in Manchester match your preferences'
      ]
    }
  },
  {
    id: 'application_status',
    title: 'Application Status',
    type: 'status',
    size: 'small',
    icon: FileText,
    visible: true,
    position: 4,
    data: {
      total: 3,
      pending: 1,
      approved: 2,
      current: 'Student Visa - Under Review'
    }
  },
  {
    id: 'security_status',
    title: 'Security Status',
    type: 'status',
    size: 'small',
    icon: Shield,
    visible: true,
    position: 5,
    data: {
      score: 95,
      mfa: true,
      lastLogin: '2 hours ago',
      threats: 0
    }
  },
  {
    id: 'upcoming_deadlines',
    title: 'Upcoming Deadlines',
    type: 'calendar',
    size: 'medium',
    icon: Calendar,
    visible: true,
    position: 6,
    data: {
      deadlines: [
        { task: 'Submit financial proof', date: '2025-06-15', days: 19 },
        { task: 'Medical examination', date: '2025-06-25', days: 29 },
        { task: 'Visa interview', date: '2025-07-10', days: 44 }
      ]
    }
  },
  {
    id: 'document_checklist',
    title: 'Document Checklist',
    type: 'list',
    size: 'medium',
    icon: FileText,
    visible: false,
    position: 7,
    data: {
      documents: [
        { name: 'Passport', status: 'complete' },
        { name: 'Financial statements', status: 'pending' },
        { name: 'Academic transcripts', status: 'complete' },
        { name: 'Medical certificate', status: 'missing' }
      ]
    }
  }
];

export default function DragDropDashboard({ userPreferences, onLayoutChange }: DragDropDashboardProps) {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(defaultWidgets);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    // Apply user preferences if provided
    if (userPreferences?.dashboardWidgets) {
      const updatedWidgets = widgets.map(widget => ({
        ...widget,
        visible: userPreferences.dashboardWidgets.includes(widget.id)
      }));
      setWidgets(updatedWidgets);
    }
  }, [userPreferences]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update positions
    const updatedWidgets = items.map((widget, index) => ({
      ...widget,
      position: index
    }));

    setWidgets(updatedWidgets);
    onLayoutChange?.(updatedWidgets);
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    const updatedWidgets = widgets.map(widget =>
      widget.id === widgetId ? { ...widget, visible: !widget.visible } : widget
    );
    setWidgets(updatedWidgets);
    onLayoutChange?.(updatedWidgets);
  };

  const renderWidget = (widget: DashboardWidget) => {
    const IconComponent = widget.icon;

    const getGridCols = (size: string) => {
      switch (size) {
        case 'small': return 'col-span-1';
        case 'large': return 'col-span-2';
        default: return 'col-span-1';
      }
    };

    const renderWidgetContent = () => {
      switch (widget.type) {
        case 'wallet':
          return (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold">{widget.data?.balance}</p>
                  <p className="text-sm text-gray-600">{widget.data?.accounts} accounts</p>
                </div>
                <Badge variant="secondary" className="text-green-600">
                  {widget.data?.change}
                </Badge>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-green-500 rounded-full w-3/4"></div>
              </div>
            </div>
          );

        case 'chart':
          return (
            <div className="space-y-3">
              {widget.data?.pairs?.map((pair: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium">{pair.from}/{pair.to}</span>
                  <div className="text-right">
                    <p className="font-semibold">{pair.rate}</p>
                    <p className={`text-xs ${pair.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {pair.change}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          );

        case 'list':
          if (widget.id === 'housing_matches') {
            return (
              <div className="space-y-3">
                {widget.data?.matches?.map((match: any, index: number) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{match.location}</p>
                        <p className="text-sm text-gray-600">{match.type}</p>
                        <p className="text-sm font-semibold text-blue-600">{match.price}</p>
                      </div>
                      <Badge variant="secondary">{match.score}% match</Badge>
                    </div>
                  </div>
                ))}
              </div>
            );
          }
          return (
            <div className="space-y-2">
              {widget.data?.documents?.map((doc: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{doc.name}</span>
                  <Badge variant={doc.status === 'complete' ? 'default' : 'secondary'}>
                    {doc.status}
                  </Badge>
                </div>
              ))}
            </div>
          );

        case 'ai':
          return (
            <div className="space-y-3">
              {widget.data?.insights?.map((insight: string, index: number) => (
                <div key={index} className="p-2 bg-blue-50 rounded-lg">
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
          );

        case 'status':
          if (widget.id === 'security_status') {
            return (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Security Score</span>
                  <Badge variant="default">{widget.data?.score}%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>2FA Enabled</span>
                  <Badge variant={widget.data?.mfa ? 'default' : 'destructive'}>
                    {widget.data?.mfa ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600">Last login: {widget.data?.lastLogin}</p>
              </div>
            );
          }
          return (
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-2xl font-bold">{widget.data?.total}</p>
                <p className="text-sm text-gray-600">Total Applications</p>
              </div>
              <div className="flex justify-around text-center">
                <div>
                  <p className="font-semibold text-yellow-600">{widget.data?.pending}</p>
                  <p className="text-xs">Pending</p>
                </div>
                <div>
                  <p className="font-semibold text-green-600">{widget.data?.approved}</p>
                  <p className="text-xs">Approved</p>
                </div>
              </div>
            </div>
          );

        case 'calendar':
          return (
            <div className="space-y-3">
              {widget.data?.deadlines?.map((deadline: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <p className="font-medium text-sm">{deadline.task}</p>
                    <p className="text-xs text-gray-600">{deadline.date}</p>
                  </div>
                  <Badge variant="outline">{deadline.days} days</Badge>
                </div>
              ))}
            </div>
          );

        default:
          return <p className="text-gray-500">Widget content</p>;
      }
    };

    return (
      <Card className={`${getGridCols(widget.size)} transition-all duration-200 hover:shadow-lg`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <IconComponent className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
            </div>
            {isEditMode && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleWidgetVisibility(widget.id)}
                  className="p-1"
                >
                  {widget.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
                <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {renderWidgetContent()}
        </CardContent>
      </Card>
    );
  };

  const visibleWidgets = widgets.filter(widget => widget.visible).sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Dashboard</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsEditMode(!isEditMode)}
            className="flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>{isEditMode ? 'Done Editing' : 'Customize'}</span>
          </Button>
        </div>
      </div>

      {isEditMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-blue-900">Customization Mode</h3>
          </div>
          <p className="text-sm text-blue-700">
            Drag widgets to reorder them, or use the eye icon to show/hide widgets from your dashboard.
          </p>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard" isDropDisabled={!isEditMode}>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {visibleWidgets.map((widget, index) => (
                <Draggable
                  key={widget.id}
                  draggableId={widget.id}
                  index={index}
                  isDragDisabled={!isEditMode}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`${snapshot.isDragging ? 'rotate-2 scale-105' : ''} transition-transform`}
                    >
                      {renderWidget(widget)}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {isEditMode && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 font-medium">Add New Widget</p>
              <p className="text-sm text-gray-500">Choose from available widgets to add to your dashboard</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}