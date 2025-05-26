import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Clock, User, Plus, Search, Filter, Eye } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import Header from "@/components/header";

const insightSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  content: z.string().min(100, "Content must be at least 100 characters"),
  excerpt: z.string().min(20, "Excerpt must be at least 20 characters"),
  category: z.enum(["news", "visa-guide", "tips", "policy-update", "success-story"]),
  readTime: z.string().min(1, "Read time is required"),
  tags: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

type InsightFormData = z.infer<typeof insightSchema>;

export default function Insights() {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInsight, setSelectedInsight] = useState<any>(null);

  const { data: insights, isLoading } = useQuery({
    queryKey: ["/api/insights"],
  });

  const form = useForm<InsightFormData>({
    resolver: zodResolver(insightSchema),
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      category: "tips",
      readTime: "5",
      tags: "",
      imageUrl: "",
    },
  });

  const createInsightMutation = useMutation({
    mutationFn: async (data: InsightFormData) => {
      const insightData = {
        ...data,
        readTime: parseInt(data.readTime),
        author: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "Cush Team",
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
      };
      const response = await apiRequest("POST", "/api/insights", insightData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/insights"] });
      setShowCreateModal(false);
      form.reset();
    },
  });

  const onSubmitInsight = (data: InsightFormData) => {
    createInsightMutation.mutate(data);
  };

  // Filter insights based on category and search
  const filteredInsights = insights?.filter((insight: any) => {
    const matchesCategory = selectedCategory === "all" || insight.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      insight.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      insight.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }) || [];

  const categoryColors = {
    "news": "bg-blue-100 text-blue-800",
    "visa-guide": "bg-green-100 text-green-800",
    "tips": "bg-purple-100 text-purple-800",
    "policy-update": "bg-orange-100 text-orange-800",
    "success-story": "bg-pink-100 text-pink-800",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card-modern p-6 animate-pulse">
                <div className="h-48 bg-cush-gray-200 rounded-xl mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-cush-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-cush-gray-200 rounded"></div>
                  <div className="h-3 bg-cush-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold text-cush-gray-900 mb-3">Immigration Insights</h1>
            <p className="text-lg text-cush-gray-600">
              Expert articles, guides, and updates to help you navigate your immigration journey
            </p>
          </div>
          
          {user && (
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary hover:opacity-90 text-white font-semibold px-6 py-3 rounded-xl shadow-modern-lg hover:shadow-modern-xl transition-all duration-300">
                  <Plus className="w-5 h-5 mr-2" />
                  Write Article
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-cush-gray-900">Create New Insight Article</DialogTitle>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitInsight)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Article Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Complete Guide to UK Student Visa Requirements" {...field} className="h-12" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="excerpt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Article Excerpt</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Brief summary that will appear in the article preview..."
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Article Content</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Write your full article content here..."
                              className="min-h-[200px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="news">News</SelectItem>
                                <SelectItem value="visa-guide">Visa Guide</SelectItem>
                                <SelectItem value="tips">Tips</SelectItem>
                                <SelectItem value="policy-update">Policy Update</SelectItem>
                                <SelectItem value="success-story">Success Story</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="readTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Read Time (minutes)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="5" {...field} className="h-12" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="tags"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tags (comma separated)</FormLabel>
                            <FormControl>
                              <Input placeholder="visa, uk, student" {...field} className="h-12" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Featured Image URL (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/image.jpg" {...field} className="h-12" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full h-14 bg-gradient-primary hover:opacity-90 text-white font-bold text-lg rounded-xl"
                      disabled={createInsightMutation.isPending}
                    >
                      {createInsightMutation.isPending ? "Publishing Article..." : "Publish Article"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cush-gray-400 w-5 h-5" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 border-cush-gray-200 focus:border-cush-primary"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48 h-12 border-cush-gray-200">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="news">News</SelectItem>
              <SelectItem value="visa-guide">Visa Guides</SelectItem>
              <SelectItem value="tips">Tips</SelectItem>
              <SelectItem value="policy-update">Policy Updates</SelectItem>
              <SelectItem value="success-story">Success Stories</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredInsights.map((insight: any) => (
            <div key={insight.id} className="card-feature overflow-hidden cursor-pointer" onClick={() => setSelectedInsight(insight)}>
              {/* Article Image */}
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                {insight.imageUrl ? (
                  <img
                    src={insight.imageUrl}
                    alt={insight.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-white" />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <Badge className={`font-semibold capitalize ${categoryColors[insight.category as keyof typeof categoryColors]}`}>
                    {insight.category.replace('-', ' ')}
                  </Badge>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-cush-gray-900 mb-3 line-clamp-2 hover:text-cush-primary transition-colors">
                  {insight.title}
                </h3>
                
                <p className="text-cush-gray-700 mb-4 line-clamp-3">
                  {insight.excerpt}
                </p>

                <div className="flex items-center justify-between text-sm text-cush-gray-600 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {insight.author}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {insight.readTime} min read
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-cush-gray-500">
                    {format(new Date(insight.createdAt), "MMM d, yyyy")}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-cush-primary hover:text-cush-primary-600 hover:bg-cush-primary-50"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Read More
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredInsights.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-cush-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-12 h-12 text-cush-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-cush-gray-900 mb-2">
              {insights?.length === 0 ? "No Articles Published" : "No Articles Found"}
            </h3>
            <p className="text-cush-gray-600 mb-6">
              {insights?.length === 0 
                ? "Be the first to share valuable insights with the community." 
                : "Try adjusting your search or filter criteria."
              }
            </p>
            {user && insights?.length === 0 && (
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-primary hover:opacity-90 text-white font-semibold px-8 py-3 rounded-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Write First Article
              </Button>
            )}
          </div>
        )}

        {/* Article Detail Modal */}
        {selectedInsight && (
          <Dialog open={!!selectedInsight} onOpenChange={() => setSelectedInsight(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="space-y-4">
                  <Badge className={`w-fit font-semibold capitalize ${categoryColors[selectedInsight.category as keyof typeof categoryColors]}`}>
                    {selectedInsight.category.replace('-', ' ')}
                  </Badge>
                  <DialogTitle className="text-3xl font-bold text-cush-gray-900 leading-tight">
                    {selectedInsight.title}
                  </DialogTitle>
                  <div className="flex items-center space-x-6 text-sm text-cush-gray-600">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {selectedInsight.author}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {selectedInsight.readTime} min read
                    </div>
                    <div>
                      {format(new Date(selectedInsight.createdAt), "MMMM d, yyyy")}
                    </div>
                  </div>
                </div>
              </DialogHeader>
              
              {selectedInsight.imageUrl && (
                <div className="w-full h-64 rounded-xl overflow-hidden mb-6">
                  <img
                    src={selectedInsight.imageUrl}
                    alt={selectedInsight.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="prose max-w-none">
                <div className="text-lg text-cush-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedInsight.content}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
}