import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MoodEntry {
  date: string;
  mood: string;
  emoji: string;
  reason?: string;
  timestamp: number;
}

interface MoodTrackerProps {
  onMoodChange?: (mood: MoodEntry) => void;
}

export default function EmojiMoodTracker({ onMoodChange }: MoodTrackerProps) {
  const [currentMood, setCurrentMood] = useState<string>('');
  const [showTracker, setShowTracker] = useState(false);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [selectedReason, setSelectedReason] = useState<string>('');

  const moods = [
    { emoji: '😊', name: 'happy', label: 'Happy', color: 'text-yellow-500' },
    { emoji: '😍', name: 'excited', label: 'Excited', color: 'text-pink-500' },
    { emoji: '😌', name: 'calm', label: 'Calm', color: 'text-blue-500' },
    { emoji: '🤔', name: 'confused', label: 'Confused', color: 'text-purple-500' },
    { emoji: '😰', name: 'stressed', label: 'Stressed', color: 'text-orange-500' },
    { emoji: '😢', name: 'sad', label: 'Sad', color: 'text-gray-500' },
    { emoji: '😤', name: 'frustrated', label: 'Frustrated', color: 'text-red-500' },
    { emoji: '🤯', name: 'overwhelmed', label: 'Overwhelmed', color: 'text-red-600' }
  ];

  const reasons = {
    happy: ['Made progress on my immigration journey!', 'Got helpful advice from community', 'Transfer went smoothly', 'Understanding the process better'],
    excited: ['Big milestone achieved!', 'Found perfect housing option', 'Got visa approval news', 'Connected with amazing mentor'],
    calm: ['Everything is under control', 'Clear plan in place', 'Good support system', 'Taking it one step at a time'],
    confused: ['Too many options to choose', 'Immigration process is complex', 'Need more guidance', 'Information overload'],
    stressed: ['Tight deadlines approaching', 'Visa application pressure', 'Financial concerns', 'Documentation requirements'],
    sad: ['Feeling homesick', 'Missing family/friends', 'Application got rejected', 'Uncertainty about future'],
    frustrated: ['Slow progress', 'Bureaucratic hurdles', 'Technical difficulties', 'Waiting for responses'],
    overwhelmed: ['Too much to handle', 'Multiple deadlines', 'Complex requirements', 'Need help organizing']
  };

  useEffect(() => {
    const saved = localStorage.getItem('moodHistory');
    if (saved) {
      setMoodHistory(JSON.parse(saved));
    }

    // Auto-show mood tracker periodically
    const timer = setTimeout(() => {
      const lastMood = localStorage.getItem('lastMoodCheck');
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      
      if (!lastMood || now - parseInt(lastMood) > oneDay) {
        setShowTracker(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleMoodSelect = (mood: typeof moods[0]) => {
    setCurrentMood(mood.name);
    setSelectedReason('');
  };

  const submitMood = () => {
    const moodEntry: MoodEntry = {
      date: new Date().toISOString().split('T')[0],
      mood: currentMood,
      emoji: moods.find(m => m.name === currentMood)?.emoji || '😊',
      reason: selectedReason,
      timestamp: Date.now()
    };

    const updatedHistory = [moodEntry, ...moodHistory.slice(0, 6)];
    setMoodHistory(updatedHistory);
    localStorage.setItem('moodHistory', JSON.stringify(updatedHistory));
    localStorage.setItem('lastMoodCheck', Date.now().toString());
    
    onMoodChange?.(moodEntry);
    setShowTracker(false);
    setCurrentMood('');
    setSelectedReason('');
  };

  const getMoodMessage = (moodName: string) => {
    const messages = {
      happy: "That's wonderful! 🌟 Keep riding this positive wave!",
      excited: "Your energy is contagious! 🚀 Channel that excitement!",
      calm: "Inner peace is powerful 🧘‍♀️ You've got this!",
      confused: "It's okay to feel lost sometimes 🧭 We're here to help!",
      stressed: "Take a deep breath 🌸 One step at a time!",
      sad: "Sending you virtual hugs 🤗 Brighter days are coming!",
      frustrated: "Your feelings are valid 💪 Let's work through this!",
      overwhelmed: "You're stronger than you think 🦋 Break it down into smaller steps!"
    };
    return messages[moodName as keyof typeof messages] || "Thanks for sharing! 💝";
  };

  // Mini mood display
  const MoodDisplay = () => {
    if (moodHistory.length === 0) return null;

    const recentMoods = moodHistory.slice(0, 7);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-20 left-6 z-40"
      >
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-600 font-medium">Your week:</span>
              <div className="flex space-x-1">
                {recentMoods.map((mood, index) => (
                  <motion.span
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-lg hover:scale-125 transition-transform cursor-pointer"
                    title={`${mood.emoji} ${mood.reason || mood.mood}`}
                  >
                    {mood.emoji}
                  </motion.span>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTracker(true)}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                + Add
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <>
      <MoodDisplay />
      
      <AnimatePresence>
        {showTracker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="text-center mb-6">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-4xl mb-3"
                  >
                    🌈
                  </motion.div>
                  <h2 className="text-2xl font-bold text-gray-800">How are you feeling?</h2>
                  <p className="text-gray-600 text-sm mt-2">
                    Your emotional journey matters to us ✨
                  </p>
                </div>

                {/* Mood Selection */}
                {!currentMood && (
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    {moods.map((mood) => (
                      <motion.button
                        key={mood.name}
                        onClick={() => handleMoodSelect(mood)}
                        className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all text-center group"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="text-3xl mb-2 group-hover:animate-bounce">
                          {mood.emoji}
                        </div>
                        <div className={`text-xs font-medium ${mood.color}`}>
                          {mood.label}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Reason Selection */}
                {currentMood && !selectedReason && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">
                        {moods.find(m => m.name === currentMood)?.emoji}
                      </div>
                      <p className="text-gray-700 font-medium">
                        {getMoodMessage(currentMood)}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        What's contributing to this feeling?
                      </p>
                    </div>

                    <div className="space-y-2">
                      {reasons[currentMood as keyof typeof reasons]?.map((reason, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => setSelectedReason(reason)}
                          className="w-full p-3 text-left bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                        >
                          {reason}
                        </motion.button>
                      ))}
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: reasons[currentMood as keyof typeof reasons]?.length * 0.1 }}
                        onClick={() => setSelectedReason('Other reason')}
                        className="w-full p-3 text-left bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors text-sm text-gray-600"
                      >
                        Something else...
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Confirmation */}
                {currentMood && selectedReason && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-center space-y-4"
                  >
                    <div className="text-4xl mb-2">
                      {moods.find(m => m.name === currentMood)?.emoji}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 font-medium mb-2">
                        You're feeling {moods.find(m => m.name === currentMood)?.label.toLowerCase()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Because: {selectedReason}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">
                      Thanks for sharing! This helps us support you better 💙
                    </p>
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex justify-between mt-6">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (currentMood && !selectedReason) {
                        setCurrentMood('');
                      } else if (selectedReason) {
                        setSelectedReason('');
                      } else {
                        setShowTracker(false);
                      }
                    }}
                    className="text-gray-500"
                  >
                    {currentMood ? 'Back' : 'Skip for now'}
                  </Button>

                  {currentMood && selectedReason && (
                    <Button
                      onClick={submitMood}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                    >
                      Thanks for sharing! ✨
                    </Button>
                  )}

                  {!currentMood && (
                    <Button
                      variant="ghost"
                      onClick={() => setShowTracker(false)}
                      className="text-gray-500"
                    >
                      Close
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}