import MenuItemModel, { IMenuItem } from "../../models/menu-item.model";

export interface CreateMenuItemInput {
  restaurantId: string;
  name: string;
  category: string;
  price?: number;
  priceLabel?: string;
  description?: string;
  imageUrl?: string;
}

export class MenuRepository {
  async upsertMany(items: CreateMenuItemInput[]): Promise<number> {
    if (items.length === 0) return 0;

    const restaurantId = items[0]!.restaurantId;
    await MenuItemModel.deleteMany({ restaurantId });

    await MenuItemModel.insertMany(
      items.map((item) => ({
        ...item,
        isAvailable: true,
      }))
    );

    return items.length;
  }

  async getCategories(restaurantId: string): Promise<string[]> {
    return MenuItemModel.distinct("category", { restaurantId, isAvailable: true });
  }

  async getByCategory(restaurantId: string, category: string): Promise<IMenuItem[]> {
    return MenuItemModel.find({
      restaurantId,
      category: new RegExp(`^${category}$`, "i"),
      isAvailable: true,
    })
      .sort({ name: 1 })
      .lean();
  }

  async getAll(restaurantId: string): Promise<IMenuItem[]> {
    return MenuItemModel.find({ restaurantId, isAvailable: true }).sort({ category: 1, name: 1 }).lean();
  }

  async getWithImages(restaurantId: string, category?: string): Promise<IMenuItem[]> {
    const filter: Record<string, unknown> = {
      restaurantId,
      isAvailable: true,
      imageUrl: { $exists: true, $ne: "" },
    };

    if (category) {
      filter.category = new RegExp(`^${category}$`, "i");
    }

    return MenuItemModel.find(filter).sort({ category: 1, name: 1 }).lean();
  }
}
