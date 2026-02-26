'use client'
import { sendMessage } from '@/actions'
import { PropertyWithImagesAndOwner } from '@/db'
import { Alert, Button, Card, Descriptions, Form, Input, message } from 'antd'
import { useSession } from 'next-auth/react'
import React from 'react'

export default function Contact({ property }: { property: PropertyWithImagesAndOwner }) {
    const [form] = Form.useForm()
    const { data: session } = useSession()

    const [messageApi, contextHolder] = message.useMessage();

    if (!session) {
        return (
            <Alert title="Please sign in to contact property owner" type="info" showIcon />
        )
    }

    const handleSendMessage = async (values: { message: string }) => {
        console.log("Form Values:", values); // ✅ log the message before sending

        try {
            const response = await sendMessage(
                values.message,
                session?.user.id,
                property.id,
                property.ownerId
            )

            console.log("Response from sendMessage:", response); // ✅ log server response

            if (response) {
                messageApi.success("Message sent to property owner");
                form.resetFields();
            }
        } catch (error) {
            console.log("Error sending message:", error); // ✅ log error
            messageApi.error("Try again later");
        }
    }

    return (
        <Card>
            {contextHolder}

            <h3 className='mb-1'>Contact Owner</h3>

            <Descriptions
                column={1}
                className='mb-2'
                items={[
                    {
                        label: "Owner",
                        children: property.owner.username,
                    },
                    {
                        label: "Email",
                        children: property.owner.email,
                    },
                ]}
            />

            <Form
                form={form}
                labelAlign="left"
                labelCol={{ span: 5 }}
                className='mt-1'
                onFinish={handleSendMessage}
            >
                <Form.Item
                    label='Message'
                    name="message"
                    rules={[{ required: true, message: "Please enter message" }]}
                >
                    <Input.TextArea />
                </Form.Item>

                <Button type='primary' htmlType='submit' block>
                    Send
                </Button>
            </Form>
        </Card>
    )
}