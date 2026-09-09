import { MembershipOrderModel } from "../models/MembershipOrder.js";
import { UserModel } from "../models/User.js";
import { BookingModel } from "../models/Booking.js";
import { ClassModel } from "../models/Class.js";
import { WorkoutLogModel } from "../models/WorkoutLog.js";

export class AdminViewModel {
  static async getStats() {
    const transactions = await MembershipOrderModel.findAll();
    const users = await UserModel.findAll();
    const classes = await ClassModel.findAll();
    const bookings = await BookingModel.findAll();
    const workoutLogs = await WorkoutLogModel.findAll();

    const athleteUsers = (users || []).filter(
      (u) => u.role !== "admin" && u.id !== "usr-admin"
    );
    const athleteUserIds = new Set(athleteUsers.map(u => u.id));
    
    // Filter out orders that belong to admin users
    const athleteTransactions = (transactions || []).filter(tx => 
      athleteUserIds.has(tx.userId) || 
      athleteUsers.some(u => u.name?.toLowerCase() === tx.member?.toLowerCase())
    );

    const monthlyRevenue = athleteTransactions.reduce((sum, tx) => {
      // Only count confirmed/paid transactions towards settled revenue
      if (tx.status === "Declined") return sum;
      const num = parseFloat(String(tx.amount).replace(/[^0-9.-]+/g, "")) || 0;
      return sum + num;
    }, 0);

    const activeMembers = athleteUsers.length;
    const totalSpots = (classes || []).reduce((sum, c) => sum + (c.total || 0), 0);
    const bookedSpots = (classes || []).reduce((sum, c) => sum + ((c.total || 0) - (c.spotsLeft || 0)), 0);
    const todayOccupancy = totalSpots > 0 ? Math.round((bookedSpots / totalSpots) * 100) : 0;

    const safeUsers = athleteUsers.map((u) => {
      const { passwordHash, ...safe } = u;
      return safe;
    });

    return {
      monthlyRevenue,
      activeMembers,
      todayOccupancy,
      newSignupsThisWeek: activeMembers,
      recentTransactions: athleteTransactions.slice().reverse(),
      allUsersRoster: safeUsers,
      allWorkoutLogs: workoutLogs || [],
      adminBookings: bookings || []
    };
  }
}
