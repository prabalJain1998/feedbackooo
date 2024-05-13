'use client'

import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Button from "./Button";
import { useEffect, useRef, useState } from "react";
import Popup from "./Popup";
import { NOTIFICATION } from "../utils/constants";
import Pusher from "pusher-js";
import Avatar from "./Avatar";
import axios from "axios";

const Header = () => {
  const{data:session}= useSession();
  const isLoggedIn = session?.user?.email;

  const [notification, setNotification] = useState([]);
  const notificationRef = useRef([]);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [readyToNotify, setReadyToNofity] = useState(false);

  const pusher = new Pusher(
    '4cab9b52af03f652b3f0', 
      {
          cluster:'ap2'
      }
  );

  useEffect(() => {
    // Enable pusher logging - don't include this in production
    Pusher.logToConsole = true;

    var channel = "";
    if(session?.user?.email){
      channel = pusher.subscribe(session?.user?.email);
    
      channel.bind('pusher:subscription_succeeded', function() {
        setReadyToNofity(true);
      });
    
      channel.bind(NOTIFICATION.NEW_COMMENT, function(data) {   
        notificationRef.current = [...notificationRef.current, data.message];
        setNotification(prevNotification => [...prevNotification, data?.message]);
       });

     
    
    
    }

    return () => {
      if(channel != ""){
      channel.unbind_all(); // Unbind all event handlers
      channel.unsubscribe(); // Unsubscribe from the channel
      }
    };
  }, [session]); 
  
  
  async function handleNotificationButtonClick(e){
    e.preventDefault();
    // Check if we app notifications : 
    setShowNotificationPopup(true);
  }


  function handleLogin(){
    signIn('google');
  }
  function handleLogout(){
    signOut();
  }

  useEffect(() => {
    const fetchNotifications = async () =>{
      const res = await axios.get('/api/notify')
      setNotification([...notification, ...res.data]);
    }

    fetchNotifications();
  }, [])

  function getClearButton(){
    return (
      <Button onClick={async ()=>{
        const notificationIds = [];
        notification?.map((a) =>{
          notificationIds.push(a?._id);
        })
        await axios.post('/api/notify', {notificationIds : notificationIds});
        setNotification([]);
        setShowNotificationPopup(false);
      }}>Clear Notifications</Button>
    )
  }

  if(showNotificationPopup){
    return (
      <Popup setShow={setShowNotificationPopup} title={"Notifications"} component={()=>{ return getClearButton() }}>
        {
          notification?.length > 0 ? (
            <div className="justify-center">
              {
                notification?.map((a) =>(
                  <div key={a?._id} className="flex cursor-pointer hover:bg-green-50 items-center px-2 py-2 w-full">
                    <Avatar url={a?.userImage} />
                    <p className="px-1 mb-2">{a?.text}</p>
                  </div>
                ))
              }
            </div>
          ) : (
            <div className="justify-center flex">
              <p className="p-2 text-gray-400 text-2xl">Oops ! no notifications as of now xD</p>
            </div>
          )
        }
      </Popup>
    )
  }
  
  return (
    <div className="max-w-2xl flex mx-auto mt-2 justify-end gap-2 relative">
        {readyToNotify && <span className="text-xs text-green-400 py-2 absolute left-0">online</span> }
        {
            isLoggedIn ? (
                <>
                <span className="">
                    <Image className="rounded-full cursor-pointer" src={session?.user?.image} alt="user" width={30} height={30}/>
                </span>
                 <span className="py-1  ">
                    Hello, {session?.user?.name}
                </span>

                <div>
                  <Button onClick={handleNotificationButtonClick}>

                    <div className="relative">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                     <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                     </svg>
                    {
                      (notification?.length > 0) &&
                      <p className="items-center absolute rounded-full px-1 bg-green-400 text-white -top-2 -right-2 text-xs" >{notification?.length}</p>
                    }
                  </div>

                  </Button>
                </div>
               
                <Button onClick={handleLogout}> 
                    Logout
                </Button>
                </>
            ) : (
                <>
                <Button
                onClick={handleLogin}
                className="shadow-sm border px-2 py-0"> 
                    Login
                </Button>
                </>
            )
        }

        
    </div>
  )
}

export default Header