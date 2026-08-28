import CustomerModel, { ICustomer, ICustomerLastOrderItem } from "../../models/customer.model";

export class CustomerRepository {
  async findByPhoneAndRestaurant(phone: string, restaurantId: string): Promise<ICustomer | null> {
    return CustomerModel.findOne({ phone, restaurantId }).lean();
  }

  async findOrCreate(phone: string, restaurantId: string): Promise<{ customer: ICustomer; isNew: boolean }> {
    const existing = await CustomerModel.findOne({ phone, restaurantId });
    if (existing) {
      existing.lastSeenAt = new Date();
      await existing.save();
      return { customer: existing, isNew: false };
    }

    const customer = await CustomerModel.create({
      phone,
      restaurantId,
      lastSeenAt: new Date(),
      marketingOptIn: true,
      tags: [],
      lastOrderItems: [],
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0,
    });

    return { customer, isNew: true };
  }

  async updateProfile(
    phone: string,
    restaurantId: string,
    data: {
      name?: string;
      dietary?: string[];
      favorites?: string[];
      spiceLevel?: string;
      language?: string;
      conversationSummary?: string;
    }
  ): Promise<ICustomer | null> {
    const customer = await CustomerModel.findOne({ phone, restaurantId });
    if (!customer) return null;

    if (data.name) customer.name = data.name;
    if (data.conversationSummary) {
      customer.conversationSummary = data.conversationSummary;
      customer.summaryUpdatedAt = new Date();
    }

    if (data.dietary || data.favorites || data.spiceLevel || data.language) {
      const prefs: NonNullable<ICustomer["preferences"]> = {
        dietary: data.dietary ?? customer.preferences?.dietary ?? [],
        favorites: data.favorites ?? customer.preferences?.favorites ?? [],
      };
      const spiceLevel = data.spiceLevel ?? customer.preferences?.spiceLevel;
      const language = data.language ?? customer.preferences?.language;
      if (spiceLevel) prefs.spiceLevel = spiceLevel;
      if (language) prefs.language = language;
      customer.preferences = prefs;
    }

    customer.lastSeenAt = new Date();
    await customer.save();
    return customer.toObject();
  }

  async recordOrder(
    phone: string,
    restaurantId: string,
    orderId: string,
    items: ICustomerLastOrderItem[],
    totalAmount = 0
  ): Promise<ICustomer | null> {
    const customer = await CustomerModel.findOne({ phone, restaurantId });
    if (!customer) return null;

    customer.orderHistory.push(orderId as unknown as import("mongoose").Types.ObjectId);
    customer.lastOrderAt = new Date();
    customer.lastOrderItems = items;
    customer.totalOrders += 1;
    customer.totalSpent += totalAmount;
    customer.averageOrderValue = customer.totalSpent / customer.totalOrders;

    if (customer.totalOrders >= 5 && !customer.tags.includes("vip")) {
      customer.tags.push("vip");
    }

    customer.lastSeenAt = new Date();
    await customer.save();
    return customer.toObject();
  }

  async setMarketingOptIn(phone: string, restaurantId: string, optIn: boolean): Promise<void> {
    await CustomerModel.findOneAndUpdate({ phone, restaurantId }, { $set: { marketingOptIn: optIn } });
  }

  async updateLastCampaignAt(phone: string, restaurantId: string): Promise<void> {
    await CustomerModel.findOneAndUpdate(
      { phone, restaurantId },
      { $set: { lastCampaignAt: new Date() } }
    );
  }

  async findBySegment(
    restaurantId: string,
    segment: {
      type: string;
      itemName?: string;
      minOrders?: number;
      inactiveDays?: number;
    }
  ): Promise<ICustomer[]> {
    const filter: Record<string, unknown> = { restaurantId, marketingOptIn: true };
    const now = Date.now();

    switch (segment.type) {
      case "ordered_before":
        filter.totalOrders = { $gte: 1 };
        break;
      case "inactive_7d":
        filter.lastOrderAt = { $lt: new Date(now - 7 * 24 * 60 * 60 * 1000) };
        filter.totalOrders = { $gte: 1 };
        break;
      case "inactive_30d":
        filter.lastOrderAt = { $lt: new Date(now - 30 * 24 * 60 * 60 * 1000) };
        filter.totalOrders = { $gte: 1 };
        break;
      case "vip":
        filter.totalOrders = { $gte: segment.minOrders ?? 5 };
        break;
      case "never_ordered":
        filter.totalOrders = 0;
        break;
      case "ordered_item":
        if (segment.itemName) {
          filter["lastOrderItems.name"] = new RegExp(segment.itemName, "i");
        }
        break;
      default:
        filter.totalOrders = { $gte: 1 };
    }

    return CustomerModel.find(filter).lean();
  }

  async addOrderToHistory(phone: string, restaurantId: string, orderId: string): Promise<void> {
    await CustomerModel.findOneAndUpdate(
      { phone, restaurantId },
      { $push: { orderHistory: orderId }, $set: { lastSeenAt: new Date() } }
    );
  }
}
