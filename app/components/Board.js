'use client';
import FeedbackItem from "./FeedbackItem";
import FeedbackFormPopup from "./FeedbackFormPopup";
import Button from "./Button";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import FeedbackItemPopup from "./FeedbackItemPopup";
import {debounce} from 'lodash';

export default function Board(){
    const [showFeedBackForm, setShowFeedbackPopupForm] = useState(false);
    const [showFeedBackItem, setShowFeedbackPopupItem] = useState(null);
    const [feedbacks, setFeedbacks] = useState([]);
    const [votes, setVotes] = useState([]);
    const [sort, setSort] = useState('latest');
    const searchRef = useRef('');
    const [searchPhrase, setSearchPhrase] = useState('');
    const [showNoFeedback,setShowNoFeedbacks] = useState(false);
    const [isRateLimited, setIsRateLimited] = useState(false);
    
    const loadedRows = useRef(0);
    const sortRef = useRef('latest');
    const fetchingFeedbacks=useRef(false);
    const fetchingVotes=useRef(false);
    const existingFeedbackRef = useRef([]);
    const scrollExhausted = useRef(false);

    
    const {data:session} = useSession();
  
    useEffect(() =>{
      if(feedbacks?.length > 0){
      fetchVotes(); 
      }
    }, [feedbacks])

    useEffect(()=>{
     fetchFeedBack();     
    },[])

    const handleOnSearchText = async () =>{
      const res = await axios.get(`/api/feedback?sort=${sortRef.current}&loadedRows=${loadedRows.current}&search=${searchRef.current}`);
      setFeedbacks(res.data);
    }


    useEffect(()=>{
      if(feedbacks?.length == 0){
        setShowNoFeedbacks(true);
      }else{
        setShowNoFeedbacks(false);
      }
    }, [feedbacks])

    useEffect(()=>{
    feedbacks.map((a) =>{
        if(a?.id == 'xxxxxxxxxx'){
           setIsRateLimited(true);
        }
    })
    }, [feedbacks])

    


    const fetchVotes = async () => {
      if(isRateLimited) return;
      if(feedbacks?.length == 1 && feedbacks[0]?._id == 'xxxxxxxxxx') return;
      if(fetchingVotes.current) return;
      fetchingVotes.current = true;
      const ids = feedbacks.map((a) => a._id).join(',');
      const res = await axios.get('/api/votes?feedbackIds='+ids);
      setVotes(res.data);
      fetchingVotes.current = false;
    }

    const fetchFeedBack = async(append=false) =>{
      if(isRateLimited) return;
      try {
        if(fetchingFeedbacks.current) return;

        fetchingFeedbacks.current = true;
        const res = await axios.get(`/api/feedback?sort=${sortRef.current}&loadedRows=${loadedRows.current}&search=${searchRef.current}`);
        fetchingFeedbacks.current = false;
        

        if(res.data.length == 0){ 
          scrollExhausted.current = true;
          return;
        }

        loadedRows.current += (res.data.length);

        if(append){
          setFeedbacks([...existingFeedbackRef.current, ...res.data]);
          existingFeedbackRef.current = [...existingFeedbackRef.current, ...res.data];
        }else{
          setFeedbacks(res.data);
          existingFeedbackRef.current = res.data;
        }

        }
      catch(err){
          existingFeedbackRef.current = [];
          fetchingFeedbacks.current = false;
      }
    }

    const debounceFeedbackRef = useRef(debounce(handleOnSearchText, 200));
    

    const openFeedbackModelForm = () =>{
      setShowFeedbackPopupForm(true);
    }

    const openFeedbackPopupItem = (feedback) =>{
      setShowFeedbackPopupItem(feedback);
    }

    function handleScroll(){
      const html = window.document.querySelector('html');
      const howMuchScrolled = html.scrollTop;
      const howmuchToScroll = html.scrollHeight;
      const leftToScroll = howmuchToScroll - howMuchScrolled - html.clientHeight;
      if(leftToScroll <= 100){
        fetchFeedBack(true)
      }
    }

    useEffect(()=>{
      window.addEventListener('scroll', handleScroll);
      return ()=>{
        window.removeEventListener('scroll', handleScroll);
      }
    }, []);


    useEffect(()=>{
        if(session?.user?.email){
            const feedbackId = localStorage.getItem("VOTE_AFTER_LOGIN");

            if(feedbackId){
                const doVote = async()=>{
                    const res = await axios.post('/api/votes', {feedbackId});
                    localStorage.removeItem("VOTE_AFTER_LOGIN");
                    fetchVotes();
                }
                doVote();
            }

            const formData = localStorage.getItem("FEEDBACK_AFTER_LOGIN");
            if(formData){
                const doFeedbackForm = async()=>{
                    localStorage.removeItem("FEEDBACK_AFTER_LOGIN");
                    fetchFeedBack();
                }
                doFeedbackForm();
            }

            const commentData = JSON.parse(localStorage.getItem("COMMENT_AFTER_LOGIN"));
            if(commentData){
              const doComment = async()=>{
                const res = await axios.post('/api/comment', {...commentData});
                localStorage.removeItem("COMMENT_AFTER_LOGIN");
              }
              doComment();
            }
        }
    }, [session?.user?.email])

    async function onCreate(){
      const res = await axios.get(`/api/feedback?sort=${sortRef.current}`);
      if(res.data.length == 0) return;
      setFeedbacks(res.data);
    }

    useEffect(() =>{
      loadedRows.current = 0;
      fetchFeedBack();
    },[sort]);

    useEffect(() =>{
      if(searchPhrase != ''){
      loadedRows.current = 0;
      debounceFeedbackRef.current();
      }else{
        fetchFeedBack();
      }
    },[searchPhrase]);


    return (
        <main className="bg-white md:max-w-2xl mx-auto md:shadow-lg md:rounded-lg md:mt-8">
          
        <div className="bg-gradient-to-r from-cyan-200 to-slate-300 p-8">
          <h1 className="font-bold text-xl">Welcome to Feedbackooooo!!!</h1>
          <p className="text-opacity-90 text-slate-700">Start a feedback thread...</p>
        </div>
    
        <div className="bg-gray-100 px-8 py-2  justify-between flex border-b">
          <div className="flex items-center">
            <select value={sort} onChange={(e) => {
              sortRef.current = e.target.value;
              setSort(e.target.value);
            }} className="bg-transparent text-center cursor-pointer text-gray-500 py-2 border-none focus:outline-none">
              <option value="latest">Latest</option>
              <option value="mostVoted">Most vote</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>

          <div>
              <input type="text" 
              className="w-full text-slate-600 bg-slate-100 border border-transparent hover:border-slate-200 appearance-none rounded px-3.5 py-1 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" 
              value={searchRef.current} onChange={(e) => {
                searchRef.current = e.target.value;
                setSearchPhrase(e.target.value);
              }} placeholder="Search" />
          </div>

          <div>
          <Button onClick={openFeedbackModelForm} className="bg-blue-800 py-1 px-2 text-white rounded-md"> Make a Suggestion</Button>
          </div>
        </div>
        <div className="px-8 py-2">
          {
            showNoFeedback && <p className="text-gray-300 text-2xl text-center items-center">No threads.. 😔</p>
          }
          {
            feedbacks?.map((fb) =>(
               <FeedbackItem 
               votesCount={fb?.votesCountCached}
               key={fb._id}
               onVoteChange={fetchVotes}
               votes={votes?.filter((a) => a.feedbackId?.toString() === fb._id.toString())}
               feedback={fb} onOpen={()=>{
                openFeedbackPopupItem(fb);
               }} />
            ))
          }
        </div>
    
        {
          showFeedBackForm && (
            <div>
              <FeedbackFormPopup setShow={setShowFeedbackPopupForm} onCreate={onCreate} />
            </div>
          )
        }
    
       {
          showFeedBackItem && (
            <div>
              <FeedbackItemPopup
              onVoteChange={fetchVotes}
              votes={votes?.filter((a) => a.feedbackId?.toString() === showFeedBackItem._id?.toString())}
              createdAt={showFeedBackItem?.createdAt}
              updatedAt={showFeedBackItem?.updatedAt}
              {...showFeedBackItem} setShow={setShowFeedbackPopupItem} 
              />
            </div>
          )
        }
        
       </main>    
    )
}