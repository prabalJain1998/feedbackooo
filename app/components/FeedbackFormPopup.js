import { useEffect, useState } from "react";
import Button from "./Button"
import Popup from "./Popup"
import axios from 'axios'
import { feedbackRoutes} from "../utils/constants";
import Image from "next/image";
import AttachFilesButton from "./AttachFilesButton";
import { signIn, useSession } from "next-auth/react";


const FeedbackFormPopup = ({setShow, onCreate, feedbackFromData, editMode}) => {
  const [title, setTitle] = useState(feedbackFromData?.title || '');
  const [description, setDescription] = useState(feedbackFromData?.description || '');
  const [uploads, setUploads] = useState(feedbackFromData?.uploads || []);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);


  useEffect(() =>{
    if(!!title && !! description){
      setIsDisabled(false);
    }else{
      setIsDisabled(true);
    }
  },[title, description])

  const {data:session} = useSession();
  const isLoggedIn = session?.user?.email;

  const handleCreatePostButtonClicked = (e) =>{
    e.preventDefault();
    if(!isLoggedIn){
      localStorage.setItem('FEEDBACK_AFTER_LOGIN', JSON.stringify({title, description, uploads}));
      setShowLoginPopup(true);
    }else{
      if(!editMode){
      axios.post(feedbackRoutes.POST, {title, description, uploads})
      .then((res) =>{
        setShow(false);
        onCreate();
      });
      }else{
        axios.put(`/api/feedback?feedbackId=`+feedbackFromData?._id, {title, description, uploads}).then((res) =>{
          setShow(false);
          onCreate({
            _id:feedbackFromData?._id,
            title, description, uploads
          });
        }).catch((err)=>{
          // console.log(err);
        })
      }
    }
  }

  async function handleLogin(e){
    e.stopPropagation();
    e.preventDefault();
    signIn('google');
  }


  const handleRemoveAttachment = (e, link) =>{
    e.preventDefault();
    setUploads(uploads.filter((a) => a != link));
  }

  if(showLoginPopup){
    return (
      <Popup title="Confirm!" setShow={setShowLoginPopup} narrow>
      <div className="p-2 flex justify-center">
      <Button primary onClick={handleLogin}>Login with Google</Button> 
      </div>
      </Popup>
    )
  }
 
  return (
    <div>
      <Popup setShow={setShow} title={"Make a Suggestion"}>
        <form className="p-4">
                <label className="block mt-4 mb-1">Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md p-2" type="text" placeholder="a short descriptive title.." />
                <label className="block mt-4 mb-1">Details</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} 
                className="w-full text-slate-600 bg-slate-100 border border-transparent hover:border-slate-200 appearance-none rounded px-3.5 py-2.5 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                 placeholder="Please include any details"></textarea>
                {
                  uploads?.length > 0 && (
                    <div>
                {uploads?.length > 0 && <label className="block mt-4 mb-1">Files</label>}
                <div className="flex gap-4 flex-wrap">
                  {
                   uploads?.map((link) => (
                    <a href={link} target="_blank" className="h-16 relative" key={link}>
                                           
                      <button
                      onClick={(e) => handleRemoveAttachment(e, link)}
                      className="bg-red-600 text-white text-xs -right-2 -top-2 absolute shadow-md shadow-gray-500 rounded-md p-1 z-50">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                      </button>
                     {
                      (link.endsWith('.png') || link.endsWith('.jpg')) ? (
                        <Image className="rounded-md h-16 cursor-pointer" src={link} alt="image" width={100} height={16}/>
                      ) : (
                        <div className="bg-red-300 p-2 h-16 rounded-md flex items-center text-sm opacity-35"> 
                         
                          {
                            link?.split("/")[3].substring(13)
                          }
                        </div>
                      )
                     }
                    </a>
                   ))
                   
                  }
                </div>
                      
                    </div>
                  )
                }
                  
            
                <div className="gap-2 mt-2 flex justify-end">
                      
                <AttachFilesButton onNewFiles={files => setUploads([...uploads, ...files])} />
                <Button primary onClick={handleCreatePostButtonClicked} disabled={isDisabled}>{ editMode ? "Edit Post":"Create post"}</Button>
                </div>
            </form>

        

      </Popup> 
    </div>
  )
}

export default FeedbackFormPopup