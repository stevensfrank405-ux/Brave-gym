import { MembershipTierModel } from "../models/MembershipTier.js";
import { TransactionModel } from "../models/Transaction.js";
import { UserModel } from "../models/User.js";

export class MembershipViewModel {
  static getTiers() {
    return MembershipTierModel.findAll();
  }

  static createTier(data) {
    if (!data.name || data.price === undefined) {
      throw new Error("Tier name and price are required");
    }
    return MembershipTierModel.create(data);
  }

  static deleteTier(id) {
    return MembershipTierModel.delete(id);
  }

  static async purchasePlan({ userId, plan, userMeta }) {
    if (!plan || !plan.name) {
      throw new Error("Plan details required");
    }

    // 1. Update user profile membership
    let updatedUser = null;
    if (userId) {
      updatedUser = await UserModel.update(userId, {
        membership: plan.name,
        status: "Active"
      });
    }

    // 2. Record transaction
    const transaction = TransactionModel.create({
      userId: userId || null,
      member: userMeta?.name || updatedUser?.name || "Athlete",
      plan: plan.name,
      amount: `$${plan.price}`,
      status: "Paid",
      date: "Today"
    });

    return {
      success: true,
      user: updatedUser,
      transaction
    };
  }
}
