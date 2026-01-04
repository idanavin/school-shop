import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const count = await prisma.category.count()
  if (count === 0) {
    console.log('Seeding database...')
    
    const catPizza = await prisma.category.create({ data: { name: 'Pizza' } })
    const catDrinks = await prisma.category.create({ data: { name: 'Drinks' } })
    const catSnacks = await prisma.category.create({ data: { name: 'Snacks' } })

    await prisma.item.createMany({
      data: [
        { categoryId: catPizza.id, name_he: 'משולש פיצה', name_en: 'Pizza Slice', price: 10, has_toppings: true },
        { categoryId: catDrinks.id, name_he: 'קולה', name_en: 'Cola', price: 6, has_toppings: false },
        { categoryId: catDrinks.id, name_he: 'מים', name_en: 'Water', price: 4, has_toppings: false },
        { categoryId: catSnacks.id, name_he: 'במבה', name_en: 'Bamba', price: 5, has_toppings: false },
      ]
    })

    await prisma.topping.createMany({
      data: [
        { name_he: 'זיתים', name_en: 'Olives', price: 0 },
        { name_he: 'תירס', name_en: 'Corn', price: 0 },
        { name_he: 'פטריות', name_en: 'Mushrooms', price: 0 },
      ]
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

