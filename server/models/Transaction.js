import { JsonStore } from "./JsonStore.js";
import { v4 as uuidv4 } from "uuid";

const defaultTransactions = [
  {
    id: "tx-1",
    userId: "usr-athlete-1",
    member: "Darius Sterling",
    plan: "Black Tier",
    amount: "$189",
    status: "Paid",
    date: "Today",
    createdAt: new Date().toISOString()
  },
  {
    id: "tx-2",
    userId: "usr-athlete-2",
    member: "Marcus Vance",
    plan: "Obsidian Private",
    amount: "$349",
    status: "Paid",
    date: "Yesterday",
    createdAt: new Date().toISOString()
  }
];

export const transactionStore = new JsonStore("transactions", defaultTransactions);

export class TransactionModel {
  static findAll() {
    return transactionStore.findAll();
  }

  static create(data) {
    const newTx = {
      id: data.id || `tx-${uuidv4().slice(0, 8)}`,
      userId: data.userId || null,
      member: data.member || "Athlete",
      plan: data.plan || "Membership Tier",
      amount: String(data.amount).startsWith("$") ? data.amount : `$${data.amount}`,
      status: data.status || "Paid",
      date: data.date || "Today",
      createdAt: new Date().toISOString()
    };
    transactionStore.insert(newTx);
    return newTx;
  }
}
