import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Crown, Video, Sparkles, Users, Star, Clock, MessageCircle, 
  Calendar, TrendingUp, Award, Heart, ThumbsUp, Eye, Share2,
  Zap, Target, Trophy, Gift, BookOpen, MapPin
} from "lucide-react";

// Animation variants for smooth transitions
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const cardHover = {
  initial: { scale: 1, y: 0 },
  hover: { 
    scale: 1.02, 
    y: -5,
    transition: { type: "spring", stiffness: 400, damping: 25 }
  }
};

const iconFloat = {
  initial: { y: 0 },
  animate: { 
    y: [-2, 2, -2],
    transition: { 
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export default function Community() {
  const { user } = useAuth();
  const [userEngagement, setUserEngagement] = useState({
    posts: 12,
    helpedUsers: 8,
    badgesEarned: 5,
    streakDays: 7
  });

  // Sample data with rich content
  const quickActions = [
    { 
      icon: Crown, 
      title: "Find a Mentor", 
      description: "Connect with verified immigration experts",
      color: "from-purple-500 to-pink-500",
      badge: "Popular",
      tooltip: "Browse 85+ verified mentors across 12 countries"
    },
    { 
      icon: Video, 
      title: "Join Live Events", 
      description: "Attend workshops and Q&A sessions",
      color: "from-blue-500 to-cyan-500",
      badge: "Live Now",
      tooltip: "2 live sessions happening right now"
    },
    { 
      icon: Sparkles, 
      title: "Premium Insights", 
      description: "Access exclusive guides and tips",
      color: "from-green-500 to-emerald-500",
      badge: "New",
      tooltip: "Updated weekly with latest immigration policies"
    },
    { 
      icon: Users, 
      title: "Community Hub", 
      description: "Connect with fellow immigrants",
      color: "from-orange-500 to-red-500",
      badge: "Active",
      tooltip: "15,000+ active members from 85+ countries"
    }
  ];

  const mentors = [
    {
      id: 1,
      name: "Sarah Mitchell",
      expertise: "UK Student Visas",
      bio: "Former UK Border Agency officer with 8+ years helping international students",
      profileImage: "/api/placeholder/64/64",
      rating: "4.9",
      hourlyRate: "75",
      isOnline: true,
      totalClients: 156,
      successRate: 98,
      specialties: ["Student Visa", "Work Permits", "Family Reunification"]
    },
    {
      id: 2,
      name: "Dr. James Wilson",
      expertise: "Canadian Express Entry",
      bio: "Immigration lawyer specializing in skilled worker programs",
      profileImage: "/api/placeholder/64/64",
      rating: "4.8",
      hourlyRate: "120",
      isOnline: false,
      totalClients: 203,
      successRate: 96,
      specialties: ["Express Entry", "Provincial Nomination", "Family Class"]
    },
    {
      id: 3,
      name: "Maria Rodriguez",
      expertise: "EU Blue Card",
      bio: "Certified immigration consultant for European skilled migration",
      profileImage: "/api/placeholder/64/64",
      rating: "4.9",
      hourlyRate: "85",
      isOnline: true,
      totalClients: 89,
      successRate: 97,
      specialties: ["EU Blue Card", "Schengen Visa", "Investment Visa"]
    }
  ];

  const liveEvents = [
    {
      id: 1,
      title: "UK Student Visa Masterclass",
      instructor: "Sarah Mitchell",
      time: "Live Now",
      attendees: 234,
      isLive: true,
      category: "Student Visas",
      duration: "45 min"
    },
    {
      id: 2,
      title: "Canadian Express Entry Workshop",
      instructor: "Dr. James Wilson",
      time: "Today 6:00 PM GMT",
      attendees: 156,
      isLive: false,
      category: "Skilled Migration",
      duration: "60 min"
    }
  ];

  const insights = [
    {
      id: 1,
      title: "2024 UK Immigration Policy Changes",
      views: 2340,
      likes: 156,
      comments: 23,
      trending: true,
      readTime: "5 min",
      category: "Policy Updates"
    },
    {
      id: 2,
      title: "Student Visa Application Timeline",
      views: 1890,
      likes: 203,
      comments: 45,
      trending: false,
      readTime: "8 min",
      category: "Guidelines"
    },
    {
      id: 3,
      title: "Common Visa Interview Questions",
      views: 3120,
      likes: 287,
      comments: 67,
      trending: true,
      readTime: "12 min",
      category: "Tips & Tricks"
    }
  ];

  // Interactive engagement badges
  const engagementBadges = [
    { 
      icon: Award, 
      title: "Helper", 
      description: "Helped 5+ community members",
      earned: userEngagement.helpedUsers >= 5,
      color: "text-yellow-600"
    },
    { 
      icon: Zap, 
      title: "Active Contributor", 
      description: "Posted 10+ helpful responses",
      earned: userEngagement.posts >= 10,
      color: "text-blue-600"
    },
    { 
      icon: Target, 
      title: "Streak Master", 
      description: "7-day activity streak",
      earned: userEngagement.streakDays >= 7,
      color: "text-green-600"
    },
    { 
      icon: Trophy, 
      title: "Expert", 
      description: "Achieved expert status",
      earned: userEngagement.badgesEarned >= 5,
      color: "text-purple-600"
    }
  ];

  return (
    <TooltipProvider>
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransition}
        transition={{ duration: 0.6 }}
      >
        <main className="container mx-auto px-4 py-8">
          {/* Personalized Welcome Widget */}
          <motion.section 
            className="mb-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">
                      Welcome back, {user?.firstName || 'Explorer'}! 
                    </h1>
                    <p className="text-blue-100">
                      You've helped {userEngagement.helpedUsers} people this month. Keep up the amazing work!
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {engagementBadges.slice(0, 2).map((badge, index) => (
                      <Tooltip key={index}>
                        <TooltipTrigger>
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className={`p-2 rounded-full ${badge.earned ? 'bg-white/20' : 'bg-white/10'}`}
                          >
                            <badge.icon className={`h-5 w-5 ${badge.earned ? 'text-yellow-300' : 'text-white/60'}`} />
                          </motion.div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-medium">{badge.title}</p>
                          <p className="text-sm text-gray-600">{badge.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
                
                {/* Achievement Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-blue-100 mb-2">
                    <span>Community Impact Level</span>
                    <span>{Math.min(userEngagement.posts + userEngagement.helpedUsers, 25)}/25</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <motion.div 
                      className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((userEngagement.posts + userEngagement.helpedUsers) / 25 * 100, 100)}%` }}
                      transition={{ delay: 0.5, duration: 1 }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Community Stats */}
          <motion.section 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-center mb-8">
              <motion.h2 
                className="text-3xl font-bold text-gray-900 mb-4"
                variants={iconFloat}
                animate="animate"
              >
                Join Our Thriving Community
              </motion.h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                {[
                  { number: "15,000+", label: "Active Members", icon: Users },
                  { number: "500+", label: "Success Stories", icon: Trophy },
                  { number: "85+", label: "Countries", icon: MapPin },
                  { number: "98%", label: "Success Rate", icon: TrendingUp }
                ].map((stat, index) => (
                  <motion.div 
                    key={index}
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <div className="text-2xl font-bold text-blue-600">{stat.number}</div>
                    <div className="text-sm text-gray-600 flex items-center justify-center">
                      <stat.icon className="h-4 w-4 mr-1" />
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Quick Actions with Enhanced Animations */}
          <motion.section 
            className="mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <motion.div
                      variants={cardHover}
                      initial="initial"
                      whileHover="hover"
                      className="cursor-pointer"
                    >
                      <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white">
                        <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-5`} />
                        <CardContent className="p-6 relative">
                          <div className="flex items-center justify-between mb-4">
                            <motion.div 
                              className={`p-3 rounded-full bg-gradient-to-br ${action.color}`}
                              whileHover={{ rotate: 5 }}
                              transition={{ type: "spring", stiffness: 400 }}
                            >
                              <action.icon className="h-6 w-6 text-white" />
                            </motion.div>
                            <Badge variant="secondary" className="text-xs">
                              {action.badge}
                            </Badge>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {action.title}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {action.description}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{action.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </motion.section>

          {/* Expert Mentors with Enhanced Features */}
          <motion.section 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Crown className="mr-3 text-purple-600" />
                Expert Mentors
              </h2>
              <Button variant="outline">View All Mentors</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.map((mentor, index) => (
                <motion.div
                  key={mentor.id}
                  variants={cardHover}
                  initial="initial"
                  whileHover="hover"
                  className="cursor-pointer"
                >
                  <Card className="hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="relative">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={mentor.profileImage} alt={mentor.name} />
                            <AvatarFallback>{mentor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          {mentor.isOnline && (
                            <motion.div 
                              className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{mentor.name}</h3>
                          <p className="text-purple-600 font-medium">{mentor.expertise}</p>
                          <div className="flex items-center mt-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">{mentor.rating}</span>
                            <span className="text-gray-400 mx-1">•</span>
                            <span className="text-sm text-gray-600">{mentor.totalClients} clients</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4 text-sm">{mentor.bio}</p>
                      
                      {/* Specialties */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {mentor.specialties.slice(0, 2).map((specialty, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                        {mentor.specialties.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{mentor.specialties.length - 2} more
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500 flex items-center">
                          <Clock className="inline h-4 w-4 mr-1" />
                          £{mentor.hourlyRate}/hour
                        </div>
                        <div className="flex gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="sm" variant="outline">
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Send Message</TooltipContent>
                          </Tooltip>
                          <Button size="sm">Book Call</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Live Events with Real-time Indicators */}
          <motion.section 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Video className="mr-3 text-blue-600" />
                Live Events & Workshops
              </h2>
              <Button variant="outline">View Schedule</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {liveEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  variants={cardHover}
                  initial="initial"
                  whileHover="hover"
                >
                  <Card className="hover:shadow-lg transition-shadow relative overflow-hidden">
                    {event.isLive && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-pink-500">
                        <motion.div
                          className="h-full bg-white opacity-50"
                          animate={{ x: [-100, 300] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          style={{ width: "100px" }}
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                            {event.isLive && (
                              <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              >
                                <Badge className="bg-red-500 text-white">Live Now</Badge>
                              </motion.div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">by {event.instructor}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {event.time}
                            </span>
                            <span className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {event.attendees} attendees
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {event.duration}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{event.category}</Badge>
                        <Button size="sm" className={event.isLive ? "bg-red-500 hover:bg-red-600" : ""}>
                          {event.isLive ? "Join Now" : "Register"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Premium Insights with Engagement Metrics */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Sparkles className="mr-3 text-green-600" />
                Premium Insights
              </h2>
              <Button variant="outline">Browse All</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {insights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  variants={cardHover}
                  initial="initial"
                  whileHover="hover"
                >
                  <Card className="hover:shadow-lg transition-shadow relative">
                    {insight.trending && (
                      <div className="absolute top-4 right-4">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Trending
                          </Badge>
                        </motion.div>
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="mb-4">
                        <Badge variant="outline" className="mb-3">
                          {insight.category}
                        </Badge>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {insight.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {insight.views.toLocaleString()}
                          </span>
                          <span className="flex items-center">
                            <Heart className="h-4 w-4 mr-1" />
                            {insight.likes}
                          </span>
                          <span className="flex items-center">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            {insight.comments}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 flex items-center">
                          <BookOpen className="h-4 w-4 mr-1" />
                          {insight.readTime} read
                        </span>
                        <div className="flex gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Share2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Share Article</TooltipContent>
                          </Tooltip>
                          <Button size="sm">Read More</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Engagement Badges Section */}
          <motion.section 
            className="mt-12 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-0">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Your Community Achievements</h3>
                  <p className="text-gray-600">Unlock badges by contributing to the community</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {engagementBadges.map((badge, index) => (
                    <motion.div 
                      key={index}
                      className={`text-center p-4 rounded-lg transition-all ${
                        badge.earned 
                          ? 'bg-white shadow-md border-2 border-blue-200' 
                          : 'bg-gray-50 opacity-60'
                      }`}
                      whileHover={{ scale: badge.earned ? 1.05 : 1 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                    >
                      <div className={`mx-auto mb-2 p-3 rounded-full ${
                        badge.earned ? 'bg-gradient-to-br from-blue-500 to-purple-500' : 'bg-gray-300'
                      }`}>
                        <badge.icon className={`h-6 w-6 ${badge.earned ? 'text-white' : 'text-gray-500'}`} />
                      </div>
                      <h4 className={`font-medium text-sm ${badge.earned ? 'text-gray-900' : 'text-gray-500'}`}>
                        {badge.title}
                      </h4>
                      <p className={`text-xs mt-1 ${badge.earned ? 'text-gray-600' : 'text-gray-400'}`}>
                        {badge.description}
                      </p>
                      {badge.earned && (
                        <motion.div 
                          className="mt-2"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.5 }}
                        >
                          <Badge className="bg-green-500 text-white text-xs">Earned!</Badge>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.section>
        </main>
      </motion.div>
    </TooltipProvider>
  );
}