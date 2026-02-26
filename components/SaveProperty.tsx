'use client'
import { FloatButton, message, Tooltip } from 'antd'
import { CheckCircleFilled, CheckCircleOutlined, EditOutlined, HeartFilled, HeartOutlined } from '@ant-design/icons'
import React, { useEffect, useState } from 'react'
import { PropertyWithImages } from '@/db'
import { useSession } from 'next-auth/react'
import { savedProperty, getUser } from '@/actions'  // Make sure this matches your export
import { togglePropertySold } from "@/actions" 
import { useRouter } from 'next/navigation'
import { App } from "antd";

export default function SaveProperty({ property }: { property: PropertyWithImages }) {
  const router=useRouter()
  const { data: session } = useSession()
  const [savedProperties, setSavedProperties] = useState<PropertyWithImages[]>([])
  const { message } = App.useApp();
  const [isSold, setIsSold] = useState<boolean>(property.isSold)

  useEffect(() => {
    fetchUserProperties()
  }, [session])

  const fetchUserProperties = async () => {
    if (session?.user) {
      const user = await getUser(+session.user.id)
      if (user) {
        setSavedProperties(user.savedProperties)
      }
    }
  }

  const isPropertySaved = savedProperties.some((p) => p.id === property.id)
  const isPropertyOwner = session && + session?.user.id === property.ownerId


  const handleSaveProperty = async (propertyId: number, userId: string) => {
    if (!userId) {
      return message.info("Please sign in to save properties")
    }

    try {
      const response = await savedProperty(propertyId, userId)

      if (response?.status) {
        message.success(response.status)
      }

      fetchUserProperties()
    } catch (error) {
      message.error("Error saving property")
    }
  }

   async function handleTooglePropertySold(propertyId: number) {
  try {
    const response = await togglePropertySold(propertyId)

    if (response) {
      setIsSold((prev) => !prev)
      message.success(response)
    }

  } catch (error) {
    message.error("Error updating property")
  }
}

  return (
    
    isPropertyOwner ? (<>
    <Tooltip title="Edit Property" className='p-1'>
      <FloatButton
        icon={
          <EditOutlined />
        }
        style={{
          position: "absolute",
          padding:2,
          top: 10,
          right: 60,
          width: 45,
          height: 45,
          borderRadius: "100px", // Smart rounded square
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
        onClick={()=>router.push(`/properties/${property.id}/edit`)}

      />
      </Tooltip>

      {isSold ? (
         <Tooltip title="Active property">
        <FloatButton
          icon={
            <CheckCircleFilled />
          }
          onClick={()=> handleTooglePropertySold(property.id)}
          style={{
            position: "absolute",
            top: 10,
            right: 15,
            width: 45,
            height: 45,
            borderRadius: "100px", // Smart rounded square
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        />
        </Tooltip>
        
      ) : (
         <Tooltip title="Mark As Sold">
        <FloatButton
        onClick={()=> handleTooglePropertySold(property.id)}
          icon={
            <CheckCircleOutlined />
          }
          style={{
            position: "absolute",
            padding:2,
            top: 10,
            right: 15,
            width: 45,
            height: 45,
            borderRadius: "100px", // Smart rounded square
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        />
    </Tooltip>
      )}
    </>
    ) : (
       <Tooltip title="Saved Property">
      <FloatButton
        icon={
          isPropertySaved ? (
            <HeartFilled style={{ color: "red" }} />
          ) : (
            <HeartOutlined />
          )
        }
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          width: 45,
          height: 45,
          borderRadius: "12px", // Smart rounded square
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
        onClick={() => handleSaveProperty(property.id, session?.user.email as string)}
      /> </Tooltip>)
  )
}
