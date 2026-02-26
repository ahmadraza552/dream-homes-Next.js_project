'use client'
import { FloatButton, message, Tooltip } from 'antd'
import { CheckCircleFilled, CheckCircleOutlined, EditOutlined, HeartFilled, HeartOutlined, ShareAltOutlined } from '@ant-design/icons'
import React, { useEffect, useState } from 'react'
import { PropertyWithImages } from '@/db'
import { useSession } from 'next-auth/react'
import { savedProperty, getUser } from '@/actions'
import { togglePropertySold } from "@/actions" 
import { useRouter } from 'next/navigation'

export default function FloatIcons({ property }: { property: PropertyWithImages }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [savedProperties, setSavedProperties] = useState<PropertyWithImages[]>([])
  const [isSold, setIsSold] = useState<boolean>(property.isSold)

  // ⚡ Use useMessage hook for dynamic messages
  const [msgApi, contextHolder] = message.useMessage()

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
  const isPropertyOwner = session && +session?.user.id === property.ownerId

  const handleSaveProperty = async (propertyId: number, userId: string) => {
    if (!userId) {
      return msgApi.info("Please sign in to save properties") // ✅ use msgApi
    }

    try {
      const response = await savedProperty(propertyId, userId)

      if (response?.status) {
        msgApi.success(response.status) // ✅ use msgApi
      }

      fetchUserProperties()
    } catch (error) {
      msgApi.error("Error saving property") // ✅ use msgApi
    }
  }

  return (
    <>
      {contextHolder} {/* ⚡ Required for messages to render */}
      {isPropertyOwner ? (
        <>
          <CopyLink />
          <Tooltip title="Edit Property" className='p-1'>
            <FloatButton
              icon={<EditOutlined />}
              style={{ bottom: 100 }}
              onClick={() => router.push(`/properties/${property.id}/edit`)}
            />
          </Tooltip>
        </>
      ) : (
        <>
          <CopyLink />
          <Tooltip title="Saved Property">
            <FloatButton
              icon={
                isPropertySaved ? <HeartFilled style={{ color: "red" }} /> : <HeartOutlined />
              }
              style={{ bottom: 100 }}
              onClick={() => handleSaveProperty(property.id, session?.user.email as string)}
            />
          </Tooltip>
        </>
      )}
    </>
  )
}

function CopyLink() {
  const [messageApi, contextHolder] = message.useMessage()

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href)
    messageApi.success("Link copied to clipboard")
  }

  return (
    <>
      {contextHolder}
      <Tooltip title="Copy Link">
        <FloatButton
          icon={<ShareAltOutlined />}
          type="primary"
          onClick={handleCopy}
        />
      </Tooltip>
    </>
  )
}