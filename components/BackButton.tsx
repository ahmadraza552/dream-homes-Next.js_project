'use client'
import { Button } from 'antd'
import React from 'react'
import {LeftOutlined} from "@ant-design/icons"

export default function BackButton() {
  return (
    <Button icon={<LeftOutlined/>} className='mb-1 back-btn' onClick={()=> window.history.back()}>
      Back
    </Button>
  )
}
