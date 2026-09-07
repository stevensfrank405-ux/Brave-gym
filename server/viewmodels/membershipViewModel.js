import { MembershipTierModel } from "../models/MembershipTier.js";
import { MembershipOrderModel } from "../models/MembershipOrder.js";
import { UserModel } from "../models/User.js";
import { NotificationModel } from "../models/Notification.js";

export class MembershipViewModel {
  static async getTiers() {
    return MembershipTierModel.findAll();
  }

  static async createTier(data) {
    if (!data.name || data.price === undefined) {
      throw new Error("Tier name and price are required");
    }
    return MembershipTierModel.create(data);
  }

  static async deleteTier(id) {
    return MembershipTierModel.delete(id);
  }

  static async getOrders() {
    const transactions = await MembershipOrderModel.findAll();
    return transactions;
  }

  static async purchasePlan({ userId, plan, userMeta }) {
    if (!plan || !plan.name) {
      throw new Error("Plan details required");
    }

    // 1. Keep user in Pending verification with requested membership
    let updatedUser = null;
    if (userId) {
      updatedUser = await UserModel.update(userId, {
        membership: plan.name,
        status: "Pending",
        renewalDate: "Pending Admin Approval"
      });
    }

    const athleteName = userMeta?.name || updatedUser?.name || "Athlete";

    // 2. Record transaction with Pending status
    const transaction = await MembershipOrderModel.create({
      userId: userId || null,
      member: athleteName,
      plan: plan.name,
      amount: `$${plan.price}`,
      status: "Pending",
      date: "Today"
    });

    // 3. Notify Admin in real-time
    const allUsers = await UserModel.findAll();
    const adminUser = allUsers.find((u) => u.role === "admin");
    if (adminUser) {
      await NotificationModel.create({
        userId: adminUser.id,
        title: "New Membership Order Placed",
        message: `${athleteName} has requested ${plan.name} ($${plan.price}). Review and confirm in Admin Orders.`,
        type: "admin_response"
      });
    }

    // 4. Notify Athlete in real-time
    if (userId) {
      await NotificationModel.create({
        userId,
        title: "Order Received - Pending HQ Verification",
        message: `Your request for ${plan.name} is received. HQ will review and activate your access shortly.`,
        type: "admin_response"
      });
    }

    return {
      success: true,
      user: updatedUser,
      transaction
    };
  }

  static async approveOrder({ orderId, userId, planName }) {
    if (!orderId) {
      throw new Error("Order ID is required");
    }

    // 1. Update Transaction
    await MembershipOrderModel.updateStatus(orderId, "Confirmed");

    // 2. Activate User
    let updatedUser = null;
    if (userId) {
      const updates = {
        status: "Active",
        renewalDate: "30 Days Active"
      };
      if (planName) {
        updates.membership = planName;
      }
      updatedUser = await UserModel.update(userId, updates);

      // 3. Send Confirmed Notification to Athlete
      await NotificationModel.create({
        userId,
        title: "Membership Confirmed & Activated! 🥊",
        message: `Brave HQ Admin has verified and confirmed your membership. All training sessions and arena facilities are now unlocked!`,
        type: "admin_response"
      });
    }

    return {
      success: true,
      user: updatedUser
    };
  }

  static async rejectOrder({ orderId, userId, reason }) {
    if (!orderId) {
      throw new Error("Order ID is required");
    }

    await MembershipOrderModel.updateStatus(orderId, "Declined");

    if (userId) {
      await UserModel.update(userId, {
        status: "Pending",
        renewalDate: "Order Declined"
      });

      await NotificationModel.create({
        userId,
        title: "Membership Order Update",
        message: reason || "Your membership request could not be approved. Please connect with HQ via Negotiation Chat to resolve.",
        type: "admin_response"
      });
    }

    return { success: true };
  }
}
