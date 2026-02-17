import { Form, Select, Input, Space } from 'antd'
import React from 'react'

export default function SearchProperties() {
    return (

        <div className='flex-center px-1'>
            
            <Form initialValues={{ type: "RENT" }}>
                <Space.Compact>
                    <Form.Item name="type">
                        <Select
                            options={[
                                {
                                    value: "RENT", label: "For Rent"
                                },
                                {
                                    value: "SALE", label: "For Sale"
                                }
                            ]}
                            style={{ width: 120 }}
                            size='large'
                        ></Select>
                    </Form.Item >
                    <Form.Item name={"location"}>
                        <Input.Search size="large" enterButton="Search" placeholder="Search for a location..." />
                    </Form.Item>
                </Space.Compact>
            </Form>

        </div>
    )
}
