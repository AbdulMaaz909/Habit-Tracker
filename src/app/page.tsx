// /pages/index.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Trophy,
  Calendar,
  CheckCircle,
  AlertCircle,
  BarChart2,
  Droplets,
  Moon,
  Smartphone,
  Award,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  Settings,
  X,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// More comprehensive habit data with icons and colors
const habits = [
  {
    name: "Sleep",
    unit: "hrs",
    goal: 8,
    icon: <Moon className="text-indigo-500" />,
    color: "indigo",
    description: "Aim for 8 hours of quality sleep",
    tips: [
      "Avoid screens before bed",
      "Keep a consistent sleep schedule",
      "Make your bedroom cool and dark",
    ],
  },
  {
    name: "Water",
    unit: "L",
    goal: 2,
    icon: <Droplets className="text-cyan-500" />,
    color: "cyan",
    description: "Stay hydrated with 2L daily",
    tips: [
      "Carry a water bottle",
      "Drink a glass with each meal",
      "Set reminders throughout the day",
    ],
  },
  {
    name: "Screen Time",
    unit: "hrs",
    goal: 3,
    icon: <Smartphone className="text-violet-500" />,
    color: "violet",
    description: "Limit screen usage to 3 hours",
    tips: ["Use app blockers", "Take regular breaks", "Enable grayscale mode"],
  },
];

// Days of the week for chart labels
const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Sample weekly data
const mockWeeklyData: Record<string, number[]> = {
  Sleep: [7, 8, 6, 7.5, 8, 9, 7],
  Water: [1.5, 2, 1.8, 2.2, 2, 1.9, 2],
  "Screen Time": [4, 3.5, 3, 2.8, 3.2, 2.5, 3],
};

// Get month name based on index
const getMonthName = (index: number): string => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[index];
};

export default function HabitTracker() {
  const [today, setToday] = useState<{ [key: string]: number }>({
    Sleep: 0,
    Water: 0,
    "Screen Time": 0,
  });
  const [streaks, setStreaks] = useState<{ [key: string]: number }>({
    Sleep: 0,
    Water: 0,
    "Screen Time": 0,
  });
  const [showReminder, setShowReminder] = useState<boolean>(false);
  const [reminderHabit, setReminderHabit] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("daily");
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
  const [showTips, setShowTips] = useState<boolean>(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [achievements, setAchievements] = useState<{ [key: string]: boolean }>({
    "7DayStreak": false,
    PerfectDay: false,
    HydrationMaster: false,
  });
  const [showAchievementModal, setShowAchievementModal] =
    useState<boolean>(false);
  const [recentAchievement, setRecentAchievement] = useState<string>("");

  // Calculate streaks and check for reminders on component mount
  useEffect(() => {
    const newStreaks: { [key: string]: number } = {};
    const missedHabits: string[] = [];

    habits.forEach(({ name, goal }) => {
      const data = mockWeeklyData[name];
      let streak = 0;

      // Calculate streak
      for (let i = data.length - 1; i >= 0; i--) {
        if (data[i] >= goal) streak++;
        else break;
      }
      newStreaks[name] = streak;

      // Check if yesterday's habit was missed
      const yesterday = data[data.length - 1];
      if (yesterday < goal) {
        missedHabits.push(name);
      }
    });

    setStreaks(newStreaks);

    // Show reminder for first missed habit
    if (missedHabits.length > 0) {
      setReminderHabit(missedHabits[0]);
      setShowReminder(true);
    }

    // Initialize today's values with some data
    setToday({
      Sleep: 0,
      Water: 0.5,
      "Screen Time": 1,
    });

    // Check for achievements
    checkAchievements(newStreaks);
  }, []);

  const handleChange = (habit: string, value: number) => {
    setToday((prev) => {
      const newToday = { ...prev, [habit]: value };

      // Check for "Perfect Day" achievement
      const allComplete = habits.every((h) => newToday[h.name] >= h.goal);
      if (allComplete && !achievements["PerfectDay"]) {
        unlockAchievement("PerfectDay");
      }

      // Check for "Hydration Master" achievement
      if (habit === "Water" && value >= 3 && !achievements["HydrationMaster"]) {
        unlockAchievement("HydrationMaster");
      }

      return newToday;
    });
  };

  const checkAchievements = (streakData: { [key: string]: number }) => {
    // Check for 7-day streak achievement
    if (streakData["Sleep"] >= 7 && !achievements["7DayStreak"]) {
      unlockAchievement("7DayStreak");
    }
  };

  const unlockAchievement = (achievement: string) => {
    setAchievements((prev) => ({ ...prev, [achievement]: true }));
    setRecentAchievement(achievement);
    setShowAchievementModal(true);

    // Hide modal after 3 seconds
    setTimeout(() => {
      setShowAchievementModal(false);
    }, 3000);
  };

  // Calculate weekly averages
  const getWeeklyAverage = (habitName: string) => {
    const data = mockWeeklyData[habitName];
    return (data.reduce((sum, val) => sum + val, 0) / 7).toFixed(1);
  };

  // Get trend (up, down, or stable)
  const getTrend = (habitName: string) => {
    const data = mockWeeklyData[habitName];
    const firstHalf = data.slice(0, 3).reduce((sum, val) => sum + val, 0) / 3;
    const secondHalf = data.slice(4, 7).reduce((sum, val) => sum + val, 0) / 3;

    if (secondHalf > firstHalf + 0.2) return "up";
    if (secondHalf < firstHalf - 0.2) return "down";
    return "stable";
  };

  // Calculate completion percentage
  const getCompletionRate = (habitName: string) => {
    const data = mockWeeklyData[habitName];
    const habit = habits.find((h) => h.name === habitName);
    if (!habit) return 0;
    const daysCompleted = data.filter((val) => val >= habit.goal).length;
    return Math.round((daysCompleted / 7) * 100);
  };

  // Dismiss reminder
  const dismissReminder = () => {
    setShowReminder(false);
  };
  interface Achievement {
    title: string;
    description: string;
  }
  // Get achievement name and description
  const getAchievementDetails = (key: string) => {
    const achievementDetails: Record<string, Achievement> = {
      "7DayStreak": {
        title: "7-Day Streak Master",
        description: "Maintained a habit for 7 consecutive days!",
      },
      PerfectDay: {
        title: "Perfect Day",
        description: "Completed all your habits in a single day!",
      },
      HydrationMaster: {
        title: "Hydration Master",
        description: "Drank more than 3L of water in a day!",
      },
    };

    return (
      achievementDetails[key] || {
        title: "Achievement Unlocked",
        description: "You've reached a milestone!",
      }
    );
  };
  
  type ColorKey = "indigo" | "cyan" | "violet";
  interface ColorStyles {
    bg: string;
    bgLight: string;
    text: string;
    textDark: string;
    border: string;
    hover: string;
  }
  
  const getColorClass = (color: string, type: string): string => {
    // Ensure color is a valid ColorKey
    const validColorKeys: ColorKey[] = ["indigo", "cyan", "violet"];
    
    // Check if the color is valid
    if (!validColorKeys.includes(color as ColorKey)) {
      console.error("Invalid color key");
      return ""; // Return empty if invalid
    }
  
    // Ensure type is one of the valid keys in ColorStyles
    const validTypes: (keyof ColorStyles)[] = ["bg", "bgLight", "text", "textDark", "border", "hover"];
    
    if (!validTypes.includes(type as keyof ColorStyles)) {
      console.error("Invalid type key");
      return ""; // Return empty if invalid
    }
  
    // Color map with styles
    const colorMap: Record<ColorKey, ColorStyles> = {
      "indigo": {
        bg: "bg-indigo-500",
        bgLight: "bg-indigo-100",
        text: "text-indigo-500",
        textDark: "text-indigo-700",
        border: "border-indigo-500",
        hover: "hover:bg-indigo-600"
      },
      "cyan": {
        bg: "bg-cyan-500",
        bgLight: "bg-cyan-100",
        text: "text-cyan-500",
        textDark: "text-cyan-700",
        border: "border-cyan-500",
        hover: "hover:bg-cyan-600"
      },
      "violet": {
        bg: "bg-violet-500",
        bgLight: "bg-violet-100",
        text: "text-violet-500",
        textDark: "text-violet-700",
        border: "border-violet-500",
        hover: "hover:bg-violet-600"
      }
    };
  
    // Return the corresponding class or an empty string if not found
    return colorMap[color as ColorKey]?.[type as keyof ColorStyles] || "";
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 p-4 sm:p-8 font-sans">
      {/* Header with Date */}
      <header className="mb-8">
        <div className="flex items-center justify-center mb-4">
          <Calendar className="text-blue-500 w-6 h-6 mr-2" />
          <h2 className="text-lg font-medium text-gray-600">
            {daysOfWeek[currentDate.getDay()]}, {currentDate.getDate()}{" "}
            {getMonthName(currentDate.getMonth())} {currentDate.getFullYear()}
          </h2>
        </div>
        <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Habit Tracker
        </h1>
        <p className="text-gray-500 text-center max-w-lg mx-auto">
          Track your daily habits, analyze trends, and build consistent routines
        </p>
      </header>

      {/* Reminder Alert */}
      <AnimatePresence>
        {showReminder && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded shadow-md flex justify-between items-center"
          >
            <div className="flex items-center">
              <Bell className="text-amber-500 mr-3" />
              <div>
                <h3 className="font-medium text-amber-700">Reminder!</h3>
                <p className="text-amber-600">
                  You didn't meet your {reminderHabit} goal yesterday. Let's get
                  back on track today!
                </p>
              </div>
            </div>
            <button
              onClick={dismissReminder}
              className="text-amber-700 hover:text-amber-900 font-medium rounded-full p-1 hover:bg-amber-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement Modal */}
      <AnimatePresence>
        {showAchievementModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed md:top-[10rem] md:left-[33rem] transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-yellow-400 to-amber-500 text-white p-6 sm:p-8 rounded-xl shadow-xl z-50 w-[90%] sm:max-w-md"
          >
            <div className="text-center">
              <Award className="w-16 h-16 mx-auto mb-3 text-yellow-100" />
              <h3 className="text-2xl sm:text-3xl font-bold mb-2">
                {getAchievementDetails(recentAchievement).title}
              </h3>
              <p className="text-yellow-100 mb-4 text-sm sm:text-base">
                {getAchievementDetails(recentAchievement).description}
              </p>
              <div className="flex justify-center">
                <div className="bg-yellow-300 text-yellow-800 px-4 py-2 rounded-full font-bold text-sm sm:text-base">
                  Achievement Unlocked! 🎉
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-md shadow-sm bg-white p-1">
          <button
            onClick={() => setActiveTab("daily")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "daily"
                ? "bg-blue-500 text-white shadow-md"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <CheckCircle className="inline w-4 h-4 mr-1" /> Daily Check-in
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "analytics"
                ? "bg-blue-500 text-white shadow-md"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <BarChart2 className="inline w-4 h-4 mr-1" /> Analytics
          </button>
        </div>
      </div>

      {/* Achievements Row */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
          <Award className="w-4 h-4 mr-1 text-blue-500" /> Your Achievements
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
          {Object.entries(achievements).map(([key, unlocked]) => (
            <div
              key={key}
              className={`flex-shrink-0 snap-start rounded-lg p-3 ${
                unlocked
                  ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-white"
                  : "bg-gray-200 text-gray-400"
              } min-w-32 relative overflow-hidden`}
            >
              <div className="flex items-center">
                <Award
                  className={`w-5 h-5 mr-2 ${
                    unlocked ? "text-yellow-100" : "text-gray-400"
                  }`}
                />
                <div>
                  <h4 className="font-medium text-sm">
                    {getAchievementDetails(key).title}
                  </h4>
                  {unlocked && (
                    <p className="text-xs text-yellow-100">Unlocked!</p>
                  )}
                  {!unlocked && <p className="text-xs">Locked</p>}
                </div>
              </div>
              {!unlocked && (
                <div className="absolute inset-0 bg-gray-200 bg-opacity-50 backdrop-blur-sm" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Daily Check-in View */}
      {activeTab === "daily" && (
        <div className="grid gap-6 md:grid-cols-3">
          {habits.map(
            ({ name, unit, goal, icon, color, description, tips }) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow p-6 space-y-5 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div
                      className={`p-2 rounded-lg ${getColorClass(
                        color,
                        "bgLight"
                      )} mr-3`}
                    >
                      {icon}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{name}</h2>
                      <p className="text-sm text-gray-500">{description}</p>
                    </div>
                  </div>
                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedHabit(name);
                      setShowTips(!showTips);
                    }}
                  >
                    <Info className="w-5 h-5 text-gray-400 hover:text-blue-500 transition-colors" />
                  </div>
                </div>

                {/* Tips Popup */}
                <AnimatePresence>
                  {showTips && selectedHabit === name && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-gray-50 rounded-lg p-3 mb-2"
                    >
                      <h4 className="font-medium text-sm mb-2 text-gray-700">
                        Tips to improve your {name.toLowerCase()}:
                      </h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {tips.map((tip, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-green-500 mr-1">•</span> {tip}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Progress Bar */}
                <div className="relative pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span
                        className={`text-xs font-semibold inline-block ${getColorClass(
                          color,
                          "text"
                        )}`}
                      >
                        Progress: {Math.round((today[name] / goal) * 100)}%
                      </span>
                    </div>
                    <div
                      className={`text-xs font-semibold inline-block ${getColorClass(
                        color,
                        "text"
                      )}`}
                    >
                      {today[name]}/{goal} {unit}
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min((today[name] / goal) * 100, 100)}%`,
                      }}
                      transition={{ duration: 0.5 }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getColorClass(
                        color,
                        "bg"
                      )}`}
                    ></motion.div>
                  </div>
                </div>

                {/* Slider with Custom Controls */}
                <div className="space-y-1">
                  <div className="relative">
                    <input
                      type="range"
                      min={0}
                      max={goal * 2}
                      step={name === "Water" ? 0.1 : 0.5}
                      value={today[name]}
                      onChange={(e) =>
                        handleChange(name, parseFloat(e.target.value))
                      }
                      className={`w-full accent-${color}-500 h-2 rounded-lg appearance-none cursor-pointer`}
                    />
                    <div className="absolute -bottom-1 left-0 right-0 flex justify-between">
                      {[0, goal, goal * 2].map((val, i) => (
                        <div
                          key={i}
                          className="w-1 h-3 bg-gray-300 rounded-full"
                          style={{ left: `${(val / (goal * 2)) * 100}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>

                  {/* Value Controls */}
                  <div className="flex justify-between items-center">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0{unit}</span>
                      <span className="mx-auto">
                        {goal}
                        {unit}
                      </span>
                      <span>
                        {goal * 2}
                        {unit}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          handleChange(
                            name,
                            Math.max(
                              0,
                              today[name] - (name === "Water" ? 0.1 : 0.5)
                            )
                          )
                        }
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${getColorClass(
                          color,
                          "bgLight"
                        )} ${getColorClass(color, "text")}`}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() =>
                          handleChange(
                            name,
                            Math.min(
                              goal * 2,
                              today[name] + (name === "Water" ? 0.1 : 0.5)
                            )
                          )
                        }
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${getColorClass(
                          color,
                          "bgLight"
                        )} ${getColorClass(color, "text")}`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Streak & Status */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-amber-500">
                    <Trophy className="w-4 h-4 mr-1" />
                    <span className="font-medium text-sm">
                      {streaks[name]} day streak
                    </span>
                  </div>
                  <motion.div
                    animate={{
                      scale: today[name] >= goal ? [1, 1.1, 1] : 1,
                      transition: { duration: 0.3 },
                    }}
                    className={`text-sm font-medium flex items-center ${
                      today[name] >= goal ? "text-green-500" : "text-gray-400"
                    }`}
                  >
                    {today[name] >= goal ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1" /> Complete
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 mr-1" /> In progress
                      </>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            )
          )}
        </div>
      )}

      {/* Analytics View */}
      {activeTab === "analytics" && (
        <div className="space-y-8">
          {habits.map(({ name, unit, goal, icon, color }) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow p-6 transition-all hover:shadow-lg"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <div
                    className={`p-2 rounded-lg ${getColorClass(
                      color,
                      "bgLight"
                    )} mr-3`}
                  >
                    {icon}
                  </div>
                  <h2 className="text-xl font-bold">{name}</h2>
                </div>
                <div className="flex space-x-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Avg</p>
                    <p className={`font-bold ${getColorClass(color, "text")}`}>
                      {getWeeklyAverage(name)}
                      {unit}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Completion</p>
                    <p className="font-bold text-green-600">
                      {getCompletionRate(name)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Trend</p>
                    <p
                      className={`font-bold flex items-center ${
                        getTrend(name) === "up"
                          ? "text-green-600"
                          : getTrend(name) === "down"
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {getTrend(name) === "up" ? (
                        <ArrowUp className="w-4 h-4" />
                      ) : getTrend(name) === "down" ? (
                        <ArrowDown className="w-4 h-4" />
                      ) : (
                        <Minus className="w-4 h-4" />
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Weekly Chart with Animation */}
              <div className="relative">
                <div className="flex items-end space-x-2 h-40 mb-2">
                  {mockWeeklyData[name].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div className="relative w-full">
                        {/* Goal line */}
                        <div
                          className="absolute w-full border-t border-dashed border-gray-300"
                          style={{ bottom: `${(goal / (goal * 2)) * 100}%` }}
                        />

                        {/* Bar */}
                        <div className="flex justify-center">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(val / (goal * 2)) * 100}%` }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className={`w-full max-w-md rounded-t-lg ${
                              val >= goal
                                ? getColorClass(color, "bg")
                                : "bg-gray-300"
                            }`}
                            style={{ minHeight: "4px" }}
                          >
                            {/* Value popup on hover */}
                            <div className="opacity-0 hover:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 bg-gray-800 text-white px-2 py-1 text-xs rounded pointer-events-none transition-opacity">
                              {val}
                              {unit}
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* X-axis Labels */}
                <div className="flex space-x-2">
                  {daysOfWeek.map((day, i) => (
                    <div key={day} className="flex-1 text-center">
                      <span
                        className={`text-xs ${
                          i === new Date().getDay()
                            ? `font-bold ${getColorClass(color, "text")}`
                            : "text-gray-500"
                        }`}
                      >
                        {day}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Goal indicator */}
                <div className="mt-2 text-xs text-gray-500 flex items-center">
                  <span className="inline-block w-3 h-0 border-t border-dashed border-gray-300 mr-1"></span>
                  Goal: {goal}
                  {unit}
                </div>
              </div>

              {/* Additional Stats */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-500 mb-3">
                  Performance Insights
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Best Day</p>
                    <p className="font-medium">
                      {
                        daysOfWeek[
                          mockWeeklyData[name].indexOf(
                            Math.max(...mockWeeklyData[name])
                          )
                        ]
                      }
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Consistency</p>
                    <p className="font-medium">
                      {Math.round(
                        100 -
                          ((Math.max(...mockWeeklyData[name]) -
                            Math.min(...mockWeeklyData[name])) /
                            goal) *
                            50
                      )}
                      %
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">
                      Days Above Goal
                    </p>
                    <p className="font-medium">
                      {mockWeeklyData[name].filter((v) => v >= goal).length}/7
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add new habit button with animation */}
      <motion.div
        className="fixed bottom-8 right-8"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-full shadow-lg">
          <span className="text-2xl">+</span>
        </button>
      </motion.div>

      {/* Settings button */}
      <motion.div
        className="fixed bottom-8 left-8"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <button className="bg-white text-gray-600 p-4 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
}
