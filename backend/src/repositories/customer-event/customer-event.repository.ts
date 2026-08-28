import CustomerEventModel, { CustomerEventType, ICustomerEvent } from "../../models/customer-event.model";

export class CustomerEventRepository {
  async log(data: {
    phone: string;
    restaurantId: string;
    type: CustomerEventType;
    customerId?: string;
    payload?: Record<string, unknown>;
  }): Promise<ICustomerEvent> {
    const event = new CustomerEventModel(data);
    return event.save();
  }

  async wasRecentlySentCampaign(phone: string, restaurantId: string, withinDays = 7): Promise<boolean> {
    const cutoff = new Date(Date.now() - withinDays * 24 * 60 * 60 * 1000);
    const event = await CustomerEventModel.findOne({
      phone,
      restaurantId,
      type: "campaign_sent",
      createdAt: { $gte: cutoff },
    }).lean();
    return Boolean(event);
  }
}
