import prisma from '../config/database';

interface CreateListParams {
  name: string;
  frequency?: string | null;
  productIds: string[];
}

interface BestPriceRow {
  product_id: string;
  unit_price: number;
  store_id: string;
  store_name: string;
  date: Date;
}

export const createList = async (userId: string, { name, frequency, productIds }: CreateListParams) => {
  return prisma.shoppingList.create({
    data: {
      userId,
      name,
      frequency,
      items: {
        create: productIds.map(productId => ({ productId }))
      }
    },
    include: { items: { include: { product: true } } }
  });
};

export const getUserLists = async (userId: string) => {
  return prisma.shoppingList.findMany({
    where: { userId },
    include: {
      items: { include: { product: true } }
    },
    orderBy: { updatedAt: 'desc' }
  });
};

export const getOptimizedList = async (listId: string, userId: string) => {
  const list = await prisma.shoppingList.findFirst({
    where: { id: listId, userId },
    include: {
      items: { include: { product: true } }
    }
  });

  if (!list) return null;

  const productIds = list.items.map(item => item.productId);

  const bestPrices = await prisma.$queryRaw<BestPriceRow[]>`
    SELECT DISTINCT ON (pi.product_id)
      pi.product_id,
      pi.unit_price,
      p.store_id,
      s.name as store_name,
      p.date
    FROM purchase_items pi
    JOIN purchases p ON p.id = pi.purchase_id
    JOIN stores s ON s.id = p.store_id
    WHERE pi.product_id = ANY(${productIds}::uuid[])
      AND p.user_id = ${userId}::uuid
    ORDER BY pi.product_id, pi.unit_price ASC, p.date DESC
  `;

  const priceMap = new Map<string, {
    storeId: string;
    storeName: string;
    bestPrice: number;
    lastDate: Date;
  }>();

  bestPrices.forEach(bp => {
    priceMap.set(bp.product_id, {
      storeId: bp.store_id,
      storeName: bp.store_name,
      bestPrice: Number(bp.unit_price),
      lastDate: bp.date
    });
  });

  const storeGroups: Record<string, {
    storeId: string;
    storeName: string;
    categories: Record<string, Array<{
      itemId: string;
      productId: string;
      productName: string;
      brand: string;
      checked: boolean;
      bestPrice: number | null;
      lastPurchaseDate: Date | null;
    }>>;
    total: number;
  }> = {};

  list.items.forEach(item => {
    const priceInfo = priceMap.get(item.productId) || {
      storeId: 'unknown',
      storeName: 'Sin historial',
      bestPrice: null,
      lastDate: null
    };

    const storeKey = priceInfo.storeId;
    if (!storeGroups[storeKey]) {
      storeGroups[storeKey] = {
        storeId: priceInfo.storeId,
        storeName: priceInfo.storeName,
        categories: {},
        total: 0
      };
    }

    const category = item.product.category || 'Sin categoría';
    if (!storeGroups[storeKey].categories[category]) {
      storeGroups[storeKey].categories[category] = [];
    }

    storeGroups[storeKey].categories[category].push({
      itemId: item.id,
      productId: item.productId,
      productName: item.product.name,
      brand: item.product.brand,
      checked: item.checked,
      bestPrice: priceInfo.bestPrice,
      lastPurchaseDate: priceInfo.lastDate
    });

    if (priceInfo.bestPrice) {
      storeGroups[storeKey].total += priceInfo.bestPrice;
    }
  });

  const stores = Object.values(storeGroups)
    .map(store => ({
      ...store,
      categories: Object.entries(store.categories).map(([name, products]) => ({
        name,
        products: products.sort((a, b) => a.productName.localeCompare(b.productName))
      })).sort((a, b) => a.name.localeCompare(b.name))
    }))
    .sort((a, b) => b.total - a.total);

  return {
    id: list.id,
    name: list.name,
    frequency: list.frequency,
    stores,
    grandTotal: stores.reduce((sum, s) => sum + s.total, 0)
  };
};

export const toggleItem = async (itemId: string, userId: string) => {
  const item = await prisma.shoppingListItem.findFirst({
    where: { id: itemId, list: { userId } }
  });

  if (!item) return null;

  return prisma.shoppingListItem.update({
    where: { id: itemId },
    data: { checked: !item.checked }
  });
};

export const deleteList = async (listId: string, userId: string) => {
  return prisma.shoppingList.deleteMany({
    where: { id: listId, userId }
  });
};

export const duplicateList = async (listId: string, userId: string, newName?: string) => {
  const original = await prisma.shoppingList.findFirst({
    where: { id: listId, userId },
    include: { items: true }
  });

  if (!original) return null;

  return prisma.shoppingList.create({
    data: {
      userId,
      name: newName || `${original.name} (copia)`,
      frequency: original.frequency,
      items: {
        create: original.items.map(item => ({
          productId: item.productId,
          checked: false
        }))
      }
    },
    include: { items: { include: { product: true } } }
  });
};

export const resetChecks = async (listId: string, userId: string) => {
  const list = await prisma.shoppingList.findFirst({
    where: { id: listId, userId }
  });

  if (!list) return null;

  await prisma.shoppingListItem.updateMany({
    where: { listId },
    data: { checked: false }
  });

  return getOptimizedList(listId, userId);
};

export const addProducts = async (listId: string, userId: string, productIds: string[]) => {
  const list = await prisma.shoppingList.findFirst({
    where: { id: listId, userId },
    include: { items: true }
  });

  if (!list) return null;

  // Filtrar productos que ya están en la lista
  const existingProductIds = new Set(list.items.map(item => item.productId));
  const newProductIds = productIds.filter(id => !existingProductIds.has(id));

  if (newProductIds.length > 0) {
    await prisma.shoppingListItem.createMany({
      data: newProductIds.map(productId => ({
        listId,
        productId,
        checked: false
      }))
    });
  }

  return getOptimizedList(listId, userId);
};