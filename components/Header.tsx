'use client';
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Logo from "@/public/images/Logo.jpg";
import { Button, Dropdown, Flex, MenuProps, Tooltip } from "antd";
import { CheckCircleFilled, GoogleOutlined, HeartFilled, HeartOutlined, HeartTwoTone, HomeOutlined, MessageOutlined, StarOutlined } from "@ant-design/icons"
import SearchProperties from "./SearchProperties";
import { usePathname ,useRouter } from "next/navigation";
import {ClientSafeProvider,getProviders,LiteralUnion, useSession,signIn,signOut} from "next-auth/react";




export default function Header(): React.ReactElement {
  const pathname = usePathname()
  const router=useRouter()
  const {data: session}=useSession()
  const [providers ,setProviders]=useState<Record<
  LiteralUnion<string>,
  ClientSafeProvider> 
  | null >(null)

  console.log(session)

  useEffect(()=>{
   const setAuthProviders= async ()=> {
    const res= await getProviders()
    setProviders(res)
   }
   setAuthProviders()
  },[session])
 
  const items: MenuProps["items"] =[
    {
      key:"profile",
      label:"Profile",
      onClick:() => {
        router.push("profile")
      }
    },
    {
      key:"saved-properties",
      label:"Saved-Properties",
      onClick:() => {
        router.push("saved-properties")
      }
    },
    {
      key:"logout",
      label:"logout",
      danger: true,
      onClick:() => {
        signOut()
      }
    }
  ]

  return (
    <nav className="nav">
      <div className="flex-between">
        <div className="flex-align-center " style={{ display: "flex", alignItems: "center", gap: "px" }}>
           <Link href="/">
           <Image src={Logo} alt="Logo" width={100} className="pointer rounded" />
           </Link>
          <span className="heading">Dream Homes</span>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <Link href="/properties">
            <Button ghost>Properties</Button>
          </Link>

        </div >
      {!session && providers && (
  <Button
    icon={<GoogleOutlined />}
    onClick={() =>
      signIn(providers.google.id, {
        prompt: "select_account"
      })
    }
  >
    Login or Register
  </Button>
)}
      
       {session && (

        <Flex align="center" gap={22}>

          <Tooltip title="Sold Properties">

          <CheckCircleFilled className="header-icons"
          onClick={()=> router.push("/sold-properties")}/>
          </Tooltip>

          <Tooltip title="Saved Properties">
          <HeartFilled className="header-icons"
          onClick={()=> router.push("/saved-properties")}/>
          </Tooltip>
          <Tooltip title="Message">
          <MessageOutlined className="header-icons"
          onClick={()=> router.push("/message")}/>
          </Tooltip>
      
        <Dropdown menu={{items}} trigger={["click"]}>
         <Image src={session?.user?.image as string }
          width={40} height={40} 
          alt={session?.user?.name || "user"}
          className="profile-img"/>
        </Dropdown>
        </Flex>
       )}
      </div>

      &nbsp;
      <hr />
      {(pathname === "/" || pathname.startsWith("/search-results")) && ( 
        <div className="hero">
        <h1 className="hero-title">
          Finding Your <span className="color-sec">Pertfect Home</span>
        </h1>
        <p className="hero-subtitle">
          Search for your Pertfect home in the best location around the world
        </p>
        <SearchProperties />
        <Flex justify="center" gap={8}>
          <Link href={"/properties"}>
            <Button>Browse Properties</Button>
          </Link>
          <Link href="/properties/add">  {/* or wherever you want "List" to go */}
            <Button>List Properties</Button>
          </Link>
          
        </Flex>
      </div>
     )}
    </nav>

  );
}
