import express, { Request, Response } from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { createServer } from 'http'
import { Server } from 'socket.io'
import 'dotenv/config' // Load environment variables
import prisma from './db'
import { SocketEvents } from '../shared/socket-events'

import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
})
const port = process.env.PORT || 3000

app.use(cors())
app.use(bodyParser.json())

// Serve static files from the Vue app build output
app.use(express.static(path.join(__dirname, '../dist')))

interface OrderItemRequest {
  item_id: number
  quantity: number
  toppings?: unknown[]
}

interface CreateOrderRequest {
  student_name: string
  student_class: string
  student_phone: string
  items: OrderItemRequest[]
}

// Get Menu (Categories + Items)
app.get('/api/menu', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        items: {
          include: {
            // @ts-ignore
            toppings: true,
          },
        },
      },
    })
    const toppings = await prisma.topping.findMany()

    res.json({ menu: categories, toppings })
  } catch (err: unknown) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
})

// Create Order
app.post('/api/orders', async (req: Request, res: Response) => {
  const { student_name, student_class, student_phone, items } = req.body as CreateOrderRequest

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'No items in order' })
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      let total = 0
      const itemIds = items.map((i) => i.item_id)
      const dbItems = await tx.item.findMany({
        where: { id: { in: itemIds } },
      })

      for (const item of items) {
        const dbItem = dbItems.find((i) => i.id === item.item_id)
        if (dbItem) {
          if (dbItem.stock !== null) {
            if (dbItem.stock < item.quantity) {
              throw new Error(`Not enough stock for item: ${dbItem.name_en || dbItem.name_he}`)
            }
            // Decrement stock
            await tx.item.update({
              where: { id: dbItem.id },
              data: { stock: dbItem.stock - item.quantity },
            })
          }
          total += dbItem.price * item.quantity
        }
      }

      const order = await tx.order.create({
        data: {
          student_name,
          student_class,
          student_phone,
          total_price: total,
          items: {
            create: items.map((item) => ({
              itemId: item.item_id,
              quantity: item.quantity,
              toppings: JSON.stringify(item.toppings || []),
            })),
          },
        },
      })

      return order
    })

    io.emit(SocketEvents.ORDERS_UPDATED)
    io.emit(SocketEvents.MENU_UPDATED)

    res.json({ success: true, orderId: result.id })
  } catch (err: unknown) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create order' })
  }
})

// Get Orders (Admin)
app.get('/api/orders', async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        items: {
          include: {
            item: true,
          },
        },
      },
    })

    // Flatten structure for frontend compatibility if needed, or adjust frontend
    // Current frontend expects order.items with name_he, etc.
    // Prisma returns order.items[].item.name_he

    const mappedOrders = orders.map((order) => ({
      ...order,
      items: order.items.map((oi) => ({
        ...oi,
        name_he: oi.item.name_he,
        name_en: oi.item.name_en,
        price: oi.item.price,
      })),
    }))

    res.json(mappedOrders)
  } catch (err: unknown) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
})

// Update Order Status
app.patch('/api/orders/:id/status', async (req: Request, res: Response) => {
  const { status } = req.body
  const { id } = req.params
  try {
    await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
    })
    io.emit(SocketEvents.ORDERS_UPDATED)
    res.json({ success: true })
  } catch (err: unknown) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
})

// Update Menu Item
app.patch('/api/items/:id', async (req: Request, res: Response) => {
  const { price, name_he, name_en, has_toppings, toppings, max_toppings, stock, is_hidden } =
    req.body
  const { id } = req.params

  try {
    const data: any = {}
    if (price !== undefined) data.price = price
    if (name_he !== undefined) data.name_he = name_he
    if (name_en !== undefined) data.name_en = name_en
    if (has_toppings !== undefined) data.has_toppings = !!has_toppings
    if (max_toppings !== undefined) data.max_toppings = parseInt(max_toppings)
    if (stock !== undefined) data.stock = stock === null ? null : parseInt(stock)
    if (is_hidden !== undefined) data.is_hidden = !!is_hidden

    if (toppings) {
      data.toppings = {
        set: toppings.map((tid: number) => ({ id: tid })),
      }
    }

    if (Object.keys(data).length === 0) {
      return res.json({ success: true, message: 'No changes' })
    }

    await prisma.item.update({
      where: { id: parseInt(id) },
      data,
    })
    io.emit(SocketEvents.MENU_UPDATED)
    res.json({ success: true })
  } catch (err: unknown) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
})

// Create Menu Item
app.post('/api/items', async (req: Request, res: Response) => {
  const {
    category_id,
    name_he,
    name_en,
    price,
    has_toppings,
    toppings,
    max_toppings,
    stock,
    is_hidden,
  } = req.body
  try {
    const item = await prisma.item.create({
      data: {
        categoryId: parseInt(category_id),
        name_he,
        name_en,
        price: parseFloat(price),
        has_toppings: !!has_toppings,
        max_toppings: max_toppings ? parseInt(max_toppings) : 0,
        stock: stock ? parseInt(stock) : null,
        is_hidden: !!is_hidden,
        toppings: toppings
          ? {
              connect: toppings.map((tid: number) => ({ id: tid })),
            }
          : undefined,
      },
    })
    io.emit(SocketEvents.MENU_UPDATED)
    res.json({ success: true, id: item.id })
  } catch (err: unknown) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
})

// Create Category
app.post('/api/categories', async (req: Request, res: Response) => {
  const { name } = req.body
  try {
    const category = await prisma.category.create({
      data: { name },
    })
    io.emit(SocketEvents.MENU_UPDATED)
    res.json({ success: true, id: category.id })
  } catch (err: unknown) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
})

// Update Category
app.patch('/api/categories/:id', async (req: Request, res: Response) => {
  const { name } = req.body
  const { id } = req.params
  try {
    await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name },
    })
    io.emit(SocketEvents.MENU_UPDATED)
    res.json({ success: true })
  } catch (err: unknown) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
})

// Delete Category
app.delete('/api/categories/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const categoryId = parseInt(id)

    // Check if category has items
    const itemsCount = await prisma.item.count({
      where: { categoryId },
    })

    if (itemsCount > 0) {
      return res.status(400).json({ error: 'Cannot delete category with items' })
    }

    await prisma.category.delete({
      where: { id: categoryId },
    })
    io.emit(SocketEvents.MENU_UPDATED)
    res.json({ success: true })
  } catch (err: unknown) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
})

// Create Topping
app.post('/api/toppings', async (req: Request, res: Response) => {
  const { name_he, name_en, price } = req.body
  try {
    const topping = await prisma.topping.create({
      data: {
        name_he,
        name_en,
        price: parseFloat(price),
      },
    })
    io.emit(SocketEvents.MENU_UPDATED)
    res.json({ success: true, id: topping.id })
  } catch (err: unknown) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
})

// Delete Topping
app.delete('/api/toppings/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    // We can just delete the topping. The relation with Items will be handled by Prisma (cascading updates/deletes in join table usually).
    // However, explicit disconnect isn't needed for implicit many-to-many.

    await prisma.topping.delete({
      where: { id: parseInt(id) },
    })
    io.emit(SocketEvents.MENU_UPDATED)
    res.json({ success: true })
  } catch (err: unknown) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
})

// Delete Menu Item
app.delete('/api/items/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    // Delete related order items first (or handle via cascade delete in schema if configured)
    // For now, let's assume we might block delete if orders exist, or just delete the item
    // If we delete the item, past orders might break if we fetch them via relation.
    // Ideally, we should soft-delete or check constraints.
    // For this simple shop, we will just try to delete.

    // Check if item is in any order
    const orderItems = await prisma.orderItem.findFirst({
      where: { itemId: parseInt(id) },
    })

    if (orderItems) {
      return res.status(400).json({ error: 'Cannot delete item that is part of an order' })
    }

    await prisma.item.delete({
      where: { id: parseInt(id) },
    })
    io.emit(SocketEvents.MENU_UPDATED)
    res.json({ success: true })
  } catch (err: unknown) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
})

// Handle SPA routing - send all non-API requests to index.html
app.get(/.*/, (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
    return next()
  }
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

httpServer.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
