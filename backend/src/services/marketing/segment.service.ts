import { CustomerRepository } from "../../repositories/customer/customer.repository";
import { ICampaignSegment } from "../../repositories/campaign/campaign.repository";
import { ICustomer } from "../../models/customer.model";

export class SegmentService {
  constructor(private customerRepo = new CustomerRepository()) {}

  async resolve(restaurantId: string, segment: ICampaignSegment): Promise<ICustomer[]> {
    return this.customerRepo.findBySegment(restaurantId, segment);
  }

  buildTemplateParams(customer: ICustomer, promoText: string, discount?: string): string[] {
    const name = customer.name || "Customer";
    if (discount) {
      return [name, promoText, discount];
    }
    return [name, promoText];
  }
}

export const segmentService = new SegmentService();
