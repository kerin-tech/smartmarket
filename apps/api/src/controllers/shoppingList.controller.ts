import { Request, Response } from 'express';
import * as shoppingListService from '../services/shoppingList.service';

export const create = async (req: Request, res: Response) => {
  try {
    const { name, frequency, productIds } = req.body;

    if (!name || !productIds?.length) {
      return res.status(400).json({ error: 'Nombre y productos son requeridos' });
    }

    const list = await shoppingListService.createList(req.user!.id, {
      name,
      frequency,
      productIds
    });

    res.status(201).json(list);
  } catch (error) {
    console.error('Error creating shopping list:', error);
    res.status(500).json({ error: 'Error al crear la lista' });
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const lists = await shoppingListService.getUserLists(req.user!.id);
    res.json(lists);
  } catch (error) {
    console.error('Error fetching shopping lists:', error);
    res.status(500).json({ error: 'Error al obtener las listas' });
  }
};

export const getOptimized = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const list = await shoppingListService.getOptimizedList(id, req.user!.id);

    if (!list) {
      return res.status(404).json({ error: 'Lista no encontrada' });
    }

    res.json(list);
  } catch (error) {
    console.error('Error fetching optimized list:', error);
    res.status(500).json({ error: 'Error al obtener la lista' });
  }
};

export const toggleItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const item = await shoppingListService.toggleItem(itemId, req.user!.id);

    if (!item) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    res.json(item);
  } catch (error) {
    console.error('Error toggling item:', error);
    res.status(500).json({ error: 'Error al actualizar el item' });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await shoppingListService.deleteList(id, req.user!.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting shopping list:', error);
    res.status(500).json({ error: 'Error al eliminar la lista' });
  }
};

export const duplicate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const list = await shoppingListService.duplicateList(id, req.user!.id, name);

    if (!list) {
      return res.status(404).json({ error: 'Lista no encontrada' });
    }

    res.status(201).json(list);
  } catch (error) {
    console.error('Error duplicating shopping list:', error);
    res.status(500).json({ error: 'Error al duplicar la lista' });
  }
};

export const resetChecks = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const list = await shoppingListService.resetChecks(id, req.user!.id);

    if (!list) {
      return res.status(404).json({ error: 'Lista no encontrada' });
    }

    res.json(list);
  } catch (error) {
    console.error('Error resetting checks:', error);
    res.status(500).json({ error: 'Error al resetear la lista' });
  }
};

export const addProducts = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { productIds } = req.body;

    if (!productIds?.length) {
      return res.status(400).json({ error: 'Productos son requeridos' });
    }

    const list = await shoppingListService.addProducts(id, req.user!.id, productIds);

    if (!list) {
      return res.status(404).json({ error: 'Lista no encontrada' });
    }

    res.json(list);
  } catch (error) {
    console.error('Error adding products:', error);
    res.status(500).json({ error: 'Error al agregar productos' });
  }
};