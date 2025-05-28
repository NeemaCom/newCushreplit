import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trophy, Zap, Heart, Gift, Sparkles, Sun, Moon, Cloud } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface WelcomeScreenProps {
  user: {
    firstName?: string;
    lastName?: string;
    email?: string;
    profileImageUrl?: string;
  };
  onContinue: () => void;
}

export default function PersonalizedWelcomeScreen({ user, onContinue }: WelcomeScreenProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [backgroundTheme, setBackgroundTheme] = useState('dawn');
  const [showAchievements, setShowAchievements] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) setBackgroundTheme('morning');
    else if (hour >= 12 && hour < 17) setBackgroundTheme('afternoon');
    else if (hour >= 17 && hour < 21) setBackgroundTheme('evening');
    else setBackgroundTheme('night');
  }, [currentTime]);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    const name = user.firstName || 'there';
    
    if (hour >= 5 && hour < 12) return `Good morning, ${name}! ☀️`;
    if (hour >= 12 && hour < 17) return `Good afternoon, ${name}! 🌤️`;
    if (hour >= 17 && hour < 21) return `Good evening, ${name}! 🌅`;
    return `Good night, ${name}! 🌙`;
  };

  const getBackgroundGradient = () => {
    switch (backgroundTheme) {
      case 'morning':
        return 'bg-gradient-to-br from-orange-200 via-yellow-100 to-blue-200';
      case 'afternoon':
        return 'bg-gradient-to-br from-blue-300 via-cyan-200 to-yellow-200';
      case 'evening':
        return 'bg-gradient-to-br from-purple-300 via-pink-200 to-orange-200';
      case 'night':
        return 'bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900';
      default:
        return 'bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200';
    }
  };

  const achievements = [
    { icon: <Star className="w-6 h-6" />, title: "Welcome Warrior", description: "Created your Cush account!", color: "text-yellow-500" },
    { icon: <Trophy className="w-6 h-6" />, title: "First Steps", description: "Completed profile setup", color: "text-blue-500" },
    { icon: <Zap className="w-6 h-6" />, title: "Quick Learner", description: "Finished onboarding tour", color: "text-green-500" }
  ];

  const motivationalQuotes = [
    "Your journey to new horizons starts here! 🚀",
    "Every great adventure begins with a single step 🌟",
    "You're about to unlock amazing opportunities! ✨",
    "Welcome to your immigration success story! 🎯"
  ];

  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-all duration-1000 ${getBackgroundGradient()}`}>
      {/* Floating animated elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{ y: "100vh", x: Math.random() * window.innerWidth }}
            animate={{ 
              y: "-10vh",
              x: Math.random() * window.innerWidth,
              rotate: 360
            }}
            transition={{ 
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              ease: "linear",
              delay: i * 2
            }}
          >
            <Sparkles className="w-6 h-6 text-white/30" />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-2xl w-full"
      >
        <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-2xl">
          <CardContent className="p-8 text-center">
            {/* Profile Section */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                {user.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>{user.firstName?.[0] || user.email?.[0] || '👋'}</span>
                )}
              </div>
              
              <motion.h1 
                className="text-3xl font-bold text-gray-800 mb-2"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
              >
                {getGreeting()}
              </motion.h1>
              
              <p className="text-lg text-gray-600 mb-4">{randomQuote}</p>
            </motion.div>

            {/* Time and Weather-like Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center items-center space-x-4 mb-6 text-gray-500"
            >
              <div className="flex items-center space-x-2">
                {backgroundTheme === 'morning' && <Sun className="w-5 h-5" />}
                {backgroundTheme === 'afternoon' && <Cloud className="w-5 h-5" />}
                {backgroundTheme === 'evening' && <Sun className="w-5 h-5" />}
                {backgroundTheme === 'night' && <Moon className="w-5 h-5" />}
                <span>{currentTime.toLocaleTimeString()}</span>
              </div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <span>Ready for your journey</span>
            </motion.div>

            {/* Quick Achievement Preview */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mb-6"
            >
              <div className="flex justify-center space-x-2 mb-4">
                {achievements.slice(0, 3).map((achievement, index) => (
                  <motion.div
                    key={index}
                    className={`p-3 rounded-full bg-gray-100 ${achievement.color}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {achievement.icon}
                  </motion.div>
                ))}
              </div>
              <p className="text-sm text-gray-600">
                You've earned <span className="font-semibold text-blue-600">3 achievements</span> so far!
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
              className="space-y-3"
            >
              <Button
                onClick={onContinue}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Continue to Dashboard ✨
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowAchievements(!showAchievements)}
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                {showAchievements ? 'Hide' : 'View'} Achievements 🏆
              </Button>
            </motion.div>

            {/* Achievements Dropdown */}
            <AnimatePresence>
              {showAchievements && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 space-y-2"
                >
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className={achievement.color}>
                        {achievement.icon}
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-gray-800">{achievement.title}</h4>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}