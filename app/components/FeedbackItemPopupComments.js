import { useEffect, useState } from "react";
import Button from "./Button"
import Avatar from "./Avatar";
import CommentForm from "./CommentForm";
import axios from "axios";
import Image from "next/image";
import { useSession } from "next-auth/react";

const FeedbackItemPopupComments = ({feedbackId}) => {
   const [comments, setComments] = useState([]);

   const [editMode, setEditMode] = useState(false);
   const [editCommentId, setEditCommentId] = useState('');
   const [newComment, setNewComment] = useState('');
   const [existingComment, setExistingComment] = useState('');
   const [existingUpload, setExistingUpload] = useState([]);
   const [newUpload, setNewUpload] = useState([]);

   const {data : session} = useSession();

   const fetchComments = async () =>{
    const comments = await axios.get('/api/comment?feedbackId='+feedbackId);
    setComments(comments.data?.reverse());
   }

   useEffect(() =>{
    fetchComments();
   }, [feedbackId])

   function handleEditCommentButtonClick(e, data){
    e.preventDefault();
    e.stopPropagation();
    setEditMode(true);
    setExistingComment(data?.comment);
    setExistingUpload(data?.uploads);
    setNewComment(data?.comment);
    setEditCommentId(data?._id);
   }


   const getCommentPublishedTime = (commentDate) => {
    const now = new Date();
    const diff = now - new Date(commentDate);

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const years = Math.floor(days / 365);

    if (years > 0) {
        return `${years} year${years > 1 ? 's' : ''} ago`;
    } else if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
        return 'just now';
    }
};
  
function handleCancelEditComment(e){
  e.preventDefault();
  setNewComment('');
  setEditMode(false);
  setEditCommentId('');
  setNewUpload([]);
}

function handleSaveChangesButtonClicked(e){
  e.preventDefault();
  axios.put('/api/comment?commentId='+editCommentId, {feedbackId,
    comment:newComment, 
    }).then((a) =>{
      fetchComments();
      setEditMode(false);
}).catch(err => {
  console.log("Some Error while saving :(");
});
}

  return (
  <div className="p-3 w-full">
    <h1 className="mb-2">Comments</h1>
    <div className="max-h-40 overflow-y-scroll w-full">
      {
        comments?.map((a) =>(
        <div key={a?._id} className="py-1 flex w-full">
          <div className="flex gap-0 w-full">
            <Avatar url={a?.user?.image} />
              <div className="w-full">
                { 
                (editMode && editCommentId === a?.id) ? 
                  <textarea 
                  className="w-full text-slate-600 bg-slate-100 border border-transparent hover:border-slate-200 appearance-none rounded px-3.5 py-2.5 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" 
                  type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} /> :
                  <p>{a?.comment}</p>
                }

                <div className="gap-2 flex flex-wrap py-2">
                  {
                   a?.uploads?.map((link) => (
                    <a href={link} target="_blank" className="h-16 relative" key={link}>
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
              <div className="mt-2 text-sm text-gray-400">
                 {a?.createdAt != a?.updatedAt &&  <span> edited &middot; </span>}
                 <span>{a?.user?.name} &middot; {getCommentPublishedTime(a?.createdAt)} </span>
                 {(!editMode && a?.user?.email === session?.user?.email) &&  <button onClick={(e) => handleEditCommentButtonClick(e, a)} className="text-sm text-blue-400 px-2">Edit</button>}
                 {(editMode && editCommentId === a?.id) &&  <button onClick={(e) => {handleSaveChangesButtonClicked(e)}} className="text-sm text-blue-400 px-2">Save Changes</button>}
                 {(editMode && editCommentId === a?.id) &&  <button onClick={(e) => {handleCancelEditComment(e)}} className="text-sm text-blue-400 px-2">Cancel</button>}
              </div>
                </div>
                </div>
                </div>
            ))
        }
        </div>
        
        <div className="mt-2">
         <CommentForm fetchComments={fetchComments} feedbackId={feedbackId}/>
        </div>
    </div>
  )
}

export default FeedbackItemPopupComments