import {PrismaClient,Prisma} from '@prisma/client'

export const db = new PrismaClient()

export type PropertyWithImages=Prisma.PropertyGetPayload<{
    include:{
        images:true

    }
}>  