'use server'
import { db } from '@/db'
import { FilterValues } from '@/types'
import { Prisma, Property } from '@prisma/client'

// Get properties with filters and sorting
async function getProperties(
  filters: FilterValues,
  sortOrder: string,
  propertyCount: number
) {
  const orderBy: Prisma.PropertyOrderByWithRelationInput =
    sortOrder === "latest"
      ? { createdAt: "desc" }
      : sortOrder === "asc" || sortOrder === "desc"
      ? { price: sortOrder }
      : (() => {
          throw new Error("Invalid sort order")
        })()

  const filterConditions: Prisma.PropertyWhereInput = {
    type: filters.type as Prisma.EnumTypeFilter,
    propertyType: filters.apartment_type as Prisma.EnumPropertyTypeFilter,
    bhk: filters.bhk
      ? { in: filters.bhk } as Prisma.EnumBHKFilter
      : undefined,
    price: filters.price
      ? {
          gte: +filters.price.split("-")[0],
          lte: +filters.price.split("-")[1],
        }
      : undefined,
    area: filters.area
      ? {
          gte: +filters.area.split("-")[0],
          lte: +filters.area.split("-")[1],
        }
      : undefined,
    preferredTenants: filters.preferredTenants as Prisma.EnumPreferredTenantsFilter,
    isSold: false,
  }

  try {
    const properties = await db.property.findMany({
      include: { images: true },
      take: propertyCount,
      where: filterConditions,
      orderBy,
    })
    return properties
  } catch (error) {
    console.log("Error fetching properties:", error)
    throw error
  }
}

// Post a new property safely
async function postProperty(data: Partial<Property>, userId: string) {
  try {
    // Convert any complex objects to plain JS types
    const cleanData: any = {
      ...data,
      price: Number(data.price),
      area: Number(data.area),
      availableFrom: data.availableFrom
        ? new Date(data.availableFrom) // Accept string/Day.js/Date
        : null,
      ownerId: +userId,
    }

    const response = await db.property.create({
      data: cleanData,
    })

    return response
  } catch (error) {
    console.log("Error creating property:", error)
    throw error
  }
}

export { getProperties, postProperty }
