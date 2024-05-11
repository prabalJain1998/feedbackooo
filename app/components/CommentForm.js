import { useState } from "react"
import Button from "./Button"
import AttachFilesButton from "./AttachFilesButton";
import Image from "next/image";
import axios from "axios";
import { comment } from "postcss";
import { signIn, useSession } from "next-auth/react";
import Popup from "./Popup";

const CommentForm = ({feedbackId, fetchComments}) => {
    const [commentText, setCommentText] = useState('');
    const [uploads, setUploads] = useState([]);
    const [commentLoading, setCommentLoading] = useState(false);
    const [showLoginPopup, setShowLoginPopup] = useState(false);

    const {data:session} = useSession();
    const isLoggedIn = session?.user?.email;
  
    const handleRemoveAttachment = (e, link) =>{
        e.preventDefault();
        setUploads(uploads.filter((a) => a != link));
      }

   const handleCommentButtonClick = (e) =>{
    e.preventDefault();
    if(!isLoggedIn){
      localStorage.setItem('COMMENT_AFTER_LOGIN', JSON.stringify(
        {
          feedbackId,
          comment:commentText, 
          uploads
        }
      ));
      setShowLoginPopup(true);
    }else{
    setCommentLoading(true);
    e.preventDefault();   
    axios.post('/api/comment', {feedbackId,
                                comment:commentText, 
                                uploads
                                }).then((a) =>{
        setCommentLoading(false);
        setCommentText('');
        setUploads([]);
        fetchComments();
    }).catch(err => setCommentLoading(false));
  }
   }

  function handleLogin(e){
    e.stopPropagation();
    e.preventDefault();
    signIn('google');
  }

  if(showLoginPopup){
    return (
      <Popup title="Login to Comment!" setShow={setShowLoginPopup} narrow>
      <div className="p-2 flex justify-center">
      <Button primary onClick={handleLogin}>Login with Google</Button> 
      </div>
      </Popup>
    )
  }

  return (
   <>
    <form>
        <textarea className="w-full border rounded-md p-3" value={commentText} onChange={(e) => setCommentText(e.target.value)}></textarea>
        
        {
                  uploads?.length > 0 && (
                    <div>
                <label className="block mt-4 mb-2">Files</label>
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

        
        <div className="flex gap-2 justify-end">
            <AttachFilesButton onNewFiles={files => setUploads([...uploads, ...files])} />
            <Button onClick={handleCommentButtonClick} primary disabled={commentText == ''}>
            { commentLoading ? 'Commenting..' : 'Comment'}
            </Button>
        </div>
    </form>
     </>
  )
}

export default CommentForm