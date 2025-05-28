import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap, Crown, Gift, Target, Heart, Users, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  points: number;
  category: 'engagement' | 'milestone' | 'social' | 'learning';
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementSystemProps {
  userId: string;
  onAchievementUnlock?: (achievement: Achievement) => void;
}

export default function AchievementSystem({ userId, onAchievementUnlock }: AchievementSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [showNotification, setShowNotification] = useState<Achievement | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const achievementDefinitions: Achievement[] = [
    {
      id: 'welcome_warrior',
      title: 'Welcome Warrior',
      description: 'Successfully created your Cush account!',
      icon: <Star className="w-6 h-6" />,
      points: 100,
      category: 'milestone',
      unlocked: true,
      rarity: 'common'
    },
    {
      id: 'profile_perfectionist',
      title: 'Profile Perfectionist',
      description: 'Complete your profile with all details',
      icon: <Crown className="w-6 h-6" />,
      points: 150,
      category: 'milestone',
      unlocked: false,
      progress: 3,
      maxProgress: 5,
      rarity: 'rare'
    },
    {
      id: 'first_transaction',
      title: 'Money Mover',
      description: 'Made your first currency exchange',
      icon: <Zap className="w-6 h-6" />,
      points: 200,
      category: 'engagement',
      unlocked: false,
      rarity: 'rare'
    },
    {
      id: 'community_connector',
      title: 'Community Connector',
      description: 'Connected with 5 immigration mentors',
      icon: <Users className="w-6 h-6" />,
      points: 250,
      category: 'social',
      unlocked: false,
      progress: 2,
      maxProgress: 5,
      rarity: 'epic'
    },
    {
      id: 'documentation_master',
      title: 'Document Detective',
      description: 'Successfully submitted 3 document requests',
      icon: <Target className="w-6 h-6" />,
      points: 300,
      category: 'engagement',
      unlocked: false,
      progress: 1,
      maxProgress: 3,
      rarity: 'epic'
    },
    {
      id: 'loyalty_legend',
      title: 'Loyalty Legend',
      description: 'Used Cush platform for 30 consecutive days',
      icon: <Heart className="w-6 h-6" />,
      points: 500,
      category: 'milestone',
      unlocked: false,
      progress: 7,
      maxProgress: 30,
      rarity: 'legendary'
    },
    {
      id: 'referral_rockstar',
      title: 'Referral Rockstar',
      description: 'Referred 10 friends to join Cush',
      icon: <Gift className="w-6 h-6" />,
      points: 1000,
      category: 'social',
      unlocked: false,
      progress: 3,
      maxProgress: 10,
      rarity: 'legendary'
    }
  ];

  useEffect(() => {
    // Initialize achievements from localStorage or API
    const savedAchievements = localStorage.getItem(`achievements_${userId}`);
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    } else {
      setAchievements(achievementDefinitions);
      localStorage.setItem(`achievements_${userId}`, JSON.stringify(achievementDefinitions));
    }
    
    // Calculate total points and level
    const unlockedAchievements = achievementDefinitions.filter(a => a.unlocked);
    const points = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);
    setTotalPoints(points);
    setUserLevel(Math.floor(points / 500) + 1);
  }, [userId]);

  const unlockAchievement = (achievementId: string) => {
    setAchievements(prev => {
      const updated = prev.map(achievement => 
        achievement.id === achievementId 
          ? { ...achievement, unlocked: true }
          : achievement
      );
      
      localStorage.setItem(`achievements_${userId}`, JSON.stringify(updated));
      
      const unlockedAchievement = updated.find(a => a.id === achievementId);
      if (unlockedAchievement && !achievements.find(a => a.id === achievementId)?.unlocked) {
        setShowNotification(unlockedAchievement);
        onAchievementUnlock?.(unlockedAchievement);
        
        // Auto-hide notification after 5 seconds
        setTimeout(() => setShowNotification(null), 5000);
      }
      
      return updated;
    });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'legendary': return 'bg-gradient-to-r from-yellow-200 to-orange-200 text-orange-800 border-orange-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Achievement Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="fixed top-4 right-4 z-50"
          >
            <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg border-0">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="text-yellow-200">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Achievement Unlocked!</h3>
                    <p className="text-green-100">{showNotification.title}</p>
                    <p className="text-sm text-green-200">+{showNotification.points} points</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNotification(null)}
                    className="text-white hover:bg-white/20"
                  >
                    ✕
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Crown className="w-8 h-8 text-yellow-300" />
              </div>
              <h3 className="text-2xl font-bold">Level {userLevel}</h3>
              <p className="text-blue-100">Immigration Explorer</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Sparkles className="w-8 h-8 text-yellow-300" />
              </div>
              <h3 className="text-2xl font-bold">{totalPoints}</h3>
              <p className="text-blue-100">Total Points</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="w-8 h-8 text-yellow-300" />
              </div>
              <h3 className="text-2xl font-bold">
                {achievements.filter(a => a.unlocked).length}/{achievements.length}
              </h3>
              <p className="text-blue-100">Achievements</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {['all', 'milestone', 'engagement', 'social', 'learning'].map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`relative overflow-hidden transition-all duration-300 ${
              achievement.unlocked 
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg' 
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}>
              <CardContent className="p-4">
                {/* Rarity Badge */}
                <div className="absolute top-2 right-2">
                  <Badge className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                    {achievement.rarity}
                  </Badge>
                </div>

                {/* Achievement Icon */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                  achievement.unlocked 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-300 text-gray-500'
                }`}>
                  {achievement.icon}
                </div>

                {/* Achievement Info */}
                <h3 className={`font-bold text-lg mb-2 ${
                  achievement.unlocked ? 'text-gray-800' : 'text-gray-500'
                }`}>
                  {achievement.title}
                </h3>
                
                <p className={`text-sm mb-3 ${
                  achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {achievement.description}
                </p>

                {/* Progress Bar */}
                {achievement.maxProgress && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{achievement.progress || 0}/{achievement.maxProgress}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${((achievement.progress || 0) / achievement.maxProgress) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Points */}
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-semibold ${
                    achievement.unlocked ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {achievement.points} points
                  </span>
                  
                  {achievement.unlocked && (
                    <div className="text-green-500">
                      <Trophy className="w-5 h-5" />
                    </div>
                  )}
                </div>

                {/* Test Unlock Button (for demo) */}
                {!achievement.unlocked && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => unlockAchievement(achievement.id)}
                    className="w-full mt-3 text-xs"
                  >
                    🎮 Test Unlock
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}