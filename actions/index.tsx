'use server'
import { db } from '@/db'
import { FilterValues } from '@/types'
import cloudinary from '@/utils/cloudinary'
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
        : (() => { throw new Error("Invalid sort order") })()

  const filterConditions: Prisma.PropertyWhereInput = {
    type: filters.type as Prisma.EnumTypeFilter,
    propertyType: filters.apartment_type as Prisma.EnumPropertyTypeFilter,
    bhk: filters.bhk ? { in: filters.bhk } as Prisma.EnumBHKFilter : undefined,
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
    return properties || []
  } catch (error) {
    console.error("Error fetching properties:", error)
    return []
  }
}

// Post a new property safely
async function postProperty(data: Property, userId: string, images: string[]) {
  try {
    const uploadedImages = await Promise.all(images.map(async (img) => {
      const res = await cloudinary.uploader.upload(img, { folder: "dream-homes" })
      return res.url
    }))

    const response = await db.property.create({
      data: {
        ...data,
        ownerId: +userId,
        images: { create: uploadedImages.map(url => ({ url })) },
      },
    })
    return response
  } catch (error) {
    console.error("Error creating property", error)
    return null
  }
}

// Edit property
async function editProperty(data: Property, propertyId: number, images: string[]) {
  try {
    const existingProperty = await db.property.findUnique({
      where: { id: propertyId },
      include: { images: true }
    })
    if (!existingProperty) throw new Error("Property not found")

    const existingUrls = existingProperty.images.map(img => img.url)
    const newImages = images.filter(img => !existingUrls.includes(img))
    const uploadedImages = await Promise.all(newImages.map(async (img) => {
      const res = await cloudinary.uploader.upload(img, { folder: "dream-homes" })
      return res.url
    }))

    const finalUrls = [...existingUrls, ...uploadedImages]

    const response = await db.property.update({
      where: { id: propertyId },
      data: {
        ...data,
        images: {
          deleteMany: {},
          create: finalUrls.map(url => ({ url })),
        },
      },
    })
    return response
  } catch (error) {
    console.error("Error editing property", error)
    return null
  }
}

// Save or unsave property
async function savedProperty(propertyId: number, email: string) {
  try {
    const user = await db.user.findUnique({
      where: { email },
      include: { savedProperties: true },
    })
    if (!user) throw new Error("User doesn't exist")

    const isSaved = user.savedProperties.some(p => p.id === propertyId)
    const updatedUser = await db.user.update({
      where: { email },
      data: {
        savedProperties: isSaved
          ? { disconnect: { id: propertyId } }
          : { connect: { id: propertyId } },
      },
    })

    return {
      status: isSaved ? "Property unsaved" : "Property saved",
      user: updatedUser,
    }
  } catch (error) {
    console.error("Error saving property", error)
    return null
  }
}

// Get user with saved properties & messages
async function getUser(userId: number) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        savedProperties: { include: { images: true } },
        receivedMessages: { include: { sender: true, receiver: true, property: true } }
      },
    })
    return user || null
  } catch (error) {
    console.error("Error fetching user", error)
    return null
  }
}

// Get property by ID
async function getPropertyById(id: number | string) {
  const numericId = typeof id === "string" ? parseInt(id) : id
  if (!numericId || isNaN(numericId)) return null

  try {
    const property = await db.property.findUnique({
      where: { id: numericId },
      include: { images: true, owner: true },
    })
    return property || null
  } catch (error) {
    console.error("Error fetching property", error)
    return null
  }
}

// Send message
async function sendMessage(message: string, senderId: string, propertyId: number, receiverId: number) {
  try {
    const response = await db.message.create({
      data: {
        message,
        senderId: +senderId,
        propertyId: +propertyId,
        receiverId: +receiverId,
      },
    })
    return response
  } catch (error) {
    console.error("Error sending message", error)
    return null
  }
}

// Get all properties owned by a user
async function getUserProperties(userId: number) {
  try {
    const res = await db.property.findMany({
      where: { ownerId: userId, isSold:true },

      include: { images: true },
    })
    return res || []
  } catch (error) {
    console.error("Failed to fetch properties", error)
    return []
  }
}

// Toggle sold status
async function togglePropertySold(propertyId: number) {
  try {
    const property = await db.property.findUnique({ where: { id: propertyId } })
    const newStatus = !property?.isSold
    await db.property.update({ where: { id: propertyId }, data: { isSold: newStatus } })
    return newStatus ? "Property marked as sold" : "Property activated"
  } catch (error) {
    console.error("Failed to update property", error)
    return null
  }
}

// Search properties
async function searchResults(type: string, location: string) {
  try {
    const res = await db.property.findMany({
      where: {
        type: type as Prisma.EnumTypeFilter,
        OR: [
          { state: { contains: location } },
          { city: { contains: location } },
          { street: { contains: location } }
        ]
      },
      include: { images: true },
    })
    return res || []
  } catch (error) {
    console.error("Failed to search properties", error)
    return []
  }
}

// Mark property as sold
async function soldProperties(id: number) {
  try {
    const property = await db.property.update({
      where: { id },
      data: { isSold: true },
    })
    return property || null
  } catch (error) {
    console.error("Failed to mark property as sold", error)
    return null
  }
}

export {
  getProperties,
  postProperty,
  savedProperty,
  getUser,
  getPropertyById,
  sendMessage,
  getUserProperties,
  togglePropertySold,
  editProperty,
  searchResults,
  soldProperties,
}