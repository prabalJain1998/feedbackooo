import { useState } from "react";
import Popup from "./Popup";
import Button from "./Button";
import { signIn, useSession } from "next-auth/react";
import axios from "axios";
import Timer from "./Timer";

const FeedbackItem = ({onOpen, feedback, votes, onVoteChange, votesCount}) => {
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const {data:session} = useSession();
  const [voteLoading, setVoteLoading] = useState(false);

  const isLoggedIn = !!session?.user?.email;

  function haveIVoted(){
    const email = session?.user?.email;

    const data = votes.filter((a) => {
      return (a.feedbackId == feedback._id && a.userEmail == email);
    })

    return data.length > 0 ? true : false;
  }

  const isAlreadyVoted= haveIVoted();
  
  const handleVoteButtonClicked = (e) =>{
    e.stopPropagation();
    e.preventDefault();

    if(!isLoggedIn){
      localStorage.setItem('VOTE_AFTER_LOGIN', feedback._id);
      setShowLoginPopup(true);
    }else{
      setVoteLoading(true);
      axios.post('/api/votes', {feedbackId:feedback._id}).then(async(res) =>{
        await onVoteChange();
        setVoteLoading(false);
      })
    }
  }
  
  async function handleLogin(e){
    e.stopPropagation();
    e.preventDefault();
    signIn('google');
  }


  if(feedback._id == 'xxxxxxxxxx'){
   return (<Popup title={"Sorry for Rate limiting :("} setShow={()=>{}}>
      <p className="m-2 p-2 items-center">This project is hosted as a test project
      <Timer remainingTime={feedback?.remaining} onComplete={()=>{window.location.reload();}} />
      </p>  
    </Popup>)
  }

  
  return (
      <a href="" 
      onClick={(e)=>{
      e.preventDefault(); 
      onOpen();
      }} className="flex gap-8 items-center mt-2">
      <div className="flex-grow">
        <h2 className="font-bold">
          {feedback?.title?.length > 100 ? feedback.title.substring(0,100)+'...' : feedback.title}
        </h2>
        <p className="text-gray-600 text-sm">
          {feedback?.description?.length > 200 ? feedback.description.substring(0,100)+'...' : feedback.description}
        </p>
      </div>

     
      <div className="">
        {
          showLoginPopup && (
            <Popup title="Confirm the vote!" setShow={setShowLoginPopup} narrow>
              <div className="p-2 flex justify-center">
              <Button primary onClick={handleLogin}>Login with Google</Button> 
              </div>
            </Popup>
          )
        }
        <button onClick={(e) => handleVoteButtonClicked(e)} 
        disabled={voteLoading}
        className={`${voteLoading ? 'bg-green-500' : ''} ${isAlreadyVoted ? 'border-green-500 border-t-4' : ''} flex shadow-sm shadow-gray-200 border rounded-md py-1 px-4 gap-1 items-center text-gray-600`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
      </svg>
          {voteLoading ? 'Voting..' :
         
          ( votes?.length || '0')}
              
          </button>
      </div>
      
      </a>

  )
}

export default FeedbackItem