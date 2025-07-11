exports.getDashboard = async (req, res) => {
  try {
    // You’ll replace this with real DB queries later
    const data = {
      totalMaterials: 10,
      upcomingEvents: 3,
      goalsInProgress: 2,
      completedGoals: 5,
      recentMockTests: [
        { title: "Math Test", score: 85 },
        { title: "Physics Test", score: 92 }
      ],
      achievements: [
        { title: "Top Scorer", date: "2024-12-01" }
      ]
    };

    res.status(200).json({ success: true, dashboard: data });
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
