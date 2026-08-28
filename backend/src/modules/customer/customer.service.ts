import { CustomerRepository } from "../../repositories/customer/customer.repository";
import { CustomerEventRepository } from "../../repositories/customer-event/customer-event.repository";
import { ICustomer } from "../../models/customer.model";

export class CustomerService {
  constructor(
    private customerRepo = new CustomerRepository(),
    private events = new CustomerEventRepository()
  ) {}

  async findOrCreate(phone: string, restaurantId: string) {
    return this.customerRepo.findOrCreate(phone, restaurantId);
  }

  async updateProfile(
    phone: string,
    restaurantId: string,
    data: Parameters<CustomerRepository["updateProfile"]>[2]
  ) {
    const customer = await this.customerRepo.updateProfile(phone, restaurantId, data);
    if (customer) {
      await this.events.log({
        phone,
        restaurantId,
        type: "preference_updated",
        payload: data as Record<string, unknown>,
      });
    }
    return customer;
  }

  async recordOrder(
    phone: string,
    restaurantId: string,
    orderId: string,
    items: { name: string; quantity: number }[],
    totalAmount = 0
  ) {
    const customer = await this.customerRepo.recordOrder(phone, restaurantId, orderId, items, totalAmount);
    if (customer) {
      await this.events.log({
        phone,
        restaurantId,
        type: "order_placed",
        payload: { orderId, items, totalAmount },
      });
    }
    return customer;
  }

  async optOutMarketing(phone: string, restaurantId: string) {
    await this.customerRepo.setMarketingOptIn(phone, restaurantId, false);
    await this.events.log({ phone, restaurantId, type: "opted_out" });
  }

  toAgentContext(customer: ICustomer, isNew: boolean) {
    return {
      phone: customer.phone,
      name: customer.name,
      preferences: customer.preferences,
      isReturning: !isNew,
      totalOrders: customer.totalOrders,
    };
  }
}
