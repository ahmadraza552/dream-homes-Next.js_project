import React from 'react'
import { Property, Images } from '@prisma/client'
import { Card, Row, Col, Carousel, Tag } from 'antd'
import Image from "next/image"
import { EnvironmentOutlined, ExpandAltOutlined, HomeOutlined, UserOutlined } from "@ant-design/icons"
import { PropertyWithImages } from '@/db'
import Link from 'next/link'
import SaveProperty from './SaveProperty'



export default function PropertyCards({
  properties,
  layout,
}: {
  properties: PropertyWithImages[]
  layout: "horizontal" | "vertical" | null
}) {

  return (
    <>
      {layout === "vertical" ? (<Row gutter={[16, 16]} wrap>
        {properties.map((property) => (
          <Col key={property.id} xs={24} md={8}>
            <SaveProperty property={property}/>
            <Card hoverable className='p-0 mb-1 pointer'>
              <Carousel arrows style={{ height: "200px" }}>
                {property.images?.length > 0 ? (
                  property.images.map((image) => (
                    <Image
                      key={image.id}
                      src={image.url}
                      alt="property image"
                      width={500}
                      height={200}
                      style={{ objectFit: "cover" }}
                      className="image-br"
                    />
                  ))
                ) : (
                  <Image
                    src="/images/pexels.jpg"
                    alt="pexels image"
                    width={500}
                    height={200}
                    style={{ objectFit: "cover" }}
                  />
                )}
              </Carousel>
              <div className='p-1'>
                <Link href={`properties/${property.id}`} style={{
                  color:"black"
                }}>
                <PropertyContent property={property}></PropertyContent>
                </Link>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      ) : (

        properties.map((property) => (
          <Card key={property.id} hoverable className='p-0 mb-1 pointer'>
            <Row gutter={[16, 16]} wrap>
              <Col key={property.id} xs={24} md={8}>
               <SaveProperty property={property}/>
                <Carousel arrows style={{ height: "200px" }}>
                  {property.images?.length > 0 ? (
                    property.images.map((image) => (
                      <Image
                        key={image.id}
                        src={image.url}
                        alt="property image"
                        width={500}
                        height={200}
                        style={{ objectFit: "cover" }}
                        className="image-br"
                      />
                    ))
                  ) : (
                    <Image
                      src="/images/pexels.jpg"
                      alt="pexels image"
                      width={500}
                      height={200}
                      style={{ objectFit: "cover" }}
                    />
                  )}
                </Carousel>
              </Col>
              <Col xs={24} md={16} className='p-1'>
                <Link href={`/properties/${property.id}`} style={{ color: "black" }} />
                <PropertyContent property={property}></PropertyContent>
              </Col>
            </Row>
          </Card>
        ))
      )}
    </>
  )
}

function PropertyContent({ property }: {
  property: PropertyWithImages
}) {

  return (
    <>
      <div className='card-header'>
        <p className='card-header-title'>
          For {property.type.toUpperCase()}
        </p>
        <p className='card-header-price'>
          ${property.price.toLocaleString()}{property.type === "RENT" && "/month"}
        </p>
      </div>
      <Tag icon={<HomeOutlined />} color="blue">
        {property.bhk}
      </Tag>&nbsp;
      <Tag icon={<HomeOutlined />} color="blue">
        {property.propertyType}
      </Tag>&nbsp;
      <Tag icon={<ExpandAltOutlined />} color="blue">
        {property.area}sqft
      </Tag>&nbsp;
      <Tag icon={<UserOutlined />} color="blue">
        {property.preferredTenants}
      </Tag>
      <h3 className="mt-1">{property.name}</h3>
      <p className='card-desc'>
        {property.description?.slice(0, 180)}{""}
        {property.description!?.length > 180 && "..."}
      </p>
      <EnvironmentOutlined />
      {property.street},{property.city},{property.state},{""}
      {property.zipcode}
    </>

  )
}