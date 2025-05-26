import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Briefcase, Home } from "lucide-react";

export default function ImmigrationServices() {
  const services = [
    {
      icon: GraduationCap,
      title: "Student Visa",
      description: "UK Student visa application",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: Briefcase,
      title: "Work Permit",
      description: "Employment visa assistance",
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      icon: Home,
      title: "Family Visa",
      description: "Reunite with family members",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">
          Immigration Services
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${service.bgColor}`}>
                    <IconComponent className={`h-5 w-5 ${service.color}`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{service.title}</h4>
                    <p className="text-sm text-gray-500">{service.description}</p>
                  </div>
                </div>
              </div>
            );
          })}

          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            View All Services
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
