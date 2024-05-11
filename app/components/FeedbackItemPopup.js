import axios from "axios";
import Button from "./Button";
import FeedbackItemPopupComments from "./FeedbackItemPopupComments";
import Popup from "./Popup";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import FeedbackFormPopup from "./FeedbackFormPopup";

const FeedbackItemPopup = ({_id, createdAt, updatedAt, title, setShow, description, votes, onVoteChange, uploads, userEmail, onCreate}) => {
  const [voteLoading, setVoteLoading] = useState(false);
  const {data:session} = useSession();
  const [editMode, setEditMode] = useState(false);



  function handleFeedbackItemUpvoteClick(e){
    e.preventDefault();
    setVoteLoading(true);
    axios.post('/api/votes', {feedbackId:_id}).then(async(res) =>{
      await onVoteChange();
      setVoteLoading(false);
    }).catch((err) =>{
      console.log("Some error while voting..");
      setVoteLoading(false);
    })
  }

  function handleFeedbackEditClick(e){
    e.preventDefault();
    setEditMode(true);
  }

  function haveIVoted(){
    const email = session?.user?.email;
    const data = votes.filter((a) => {
      return (a.feedbackId == _id && a.userEmail == email);
    })
    return data.length > 0 ? true : false;
  }

  const isAlreadyVoted= haveIVoted();

  if(editMode){
    return (
      <FeedbackFormPopup
      feedbackFromData ={{
        _id,
        title,
        description,
        uploads
      }}
      editMode={editMode}
      setShow={()=>{setEditMode(false)}}
      onCreate={setShow}
      />
    )
  }

  return (
    <div className="">
        <Popup setShow={setShow} title={'Details'}>
           <div className="p-5 pt-2">
            <h2 className="text-lg font-bold">{title}
            {isAlreadyVoted && <span className="text-blue-400 p-1 items-center font-normal text-2xl">🗸</span>}
            </h2>
            <p className="text-gray-700 mt-2">{description}</p>
            {uploads?.length > 0 && <p className="text-sm font-bold mt-2">Attachments :</p>}
            <div className="gap-2 flex flex-wrap py-2">
            {
                   uploads?.map((link) => (
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
           </div>


           <div className="border-b flex justify-end m-2 py-2 px-2">
           { createdAt && updatedAt && (createdAt != updatedAt) && <p className="px-2 py-1 text-gray-400">edited</p>}
           { session?.user?.email === userEmail && <Button onClick={handleFeedbackEditClick}>
              <p className="px-2">Edit</p>
            </Button>}
            <Button primary onClick={handleFeedbackItemUpvoteClick}>
                <span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
           </svg></span>
               { voteLoading ? "Voting..." : <span>Upvotes ({votes.length})</span> }
                </Button>
           </div>

           <div>
            <FeedbackItemPopupComments feedbackId={_id} />
           </div>
        </Popup>
    </div>
  )
}

export default FeedbackItemPopup;