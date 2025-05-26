import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bot } from "lucide-react";

interface AIAssistantProps {
  onOpenChat?: () => void;
}

export default function AIAssistant({ onOpenChat }: AIAssistantProps) {
  return (
    <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-white bg-opacity-20 p-2 rounded-lg">
            <Bot className="text-white h-5 w-5" />
          </div>
          <h3 className="text-xl font-semibold">Imisi 2.0 Assistant</h3>
        </div>
        <p className="text-blue-100 mb-4">
          Get instant help with your immigration questions and financial transactions.
        </p>
        <Button 
          onClick={onOpenChat}
          variant="secondary" 
          className="bg-white text-blue-600 hover:bg-gray-100"
        >
          Chat with Imisi
        </Button>
      </CardContent>
    </Card>
  );
}
