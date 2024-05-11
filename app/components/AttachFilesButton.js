import { useState } from "react";
import { uploadRoutes } from "../utils/constants";
import axios from "axios";

const AttachFilesButton = ({onNewFiles}) => {
    const [isUploading, setIsUploading] = useState(false);

    const handleAttachFileUploadClicked = async (e) =>{
        setIsUploading(true);
        const files = [...e.target.files];
        const data = new FormData();
        for(const file of files){
          if (file.size <= 1024 * 1024) { // Limit file size to 3MB
            data.append('file', file);
           } else {
            console.log(`File ${file.name} exceeds the maximum allowed size of 1MB.`);
          }
        }
        console.log(data);
        const res = await axios.post(uploadRoutes.UPLOAD_ATTACHMENT, data);
        onNewFiles(res.data);
        setIsUploading(false);
    }
      
  return (
  
        <label className={`${isUploading ? 'text-gray-400' : '' }cursor-pointer px-2 py-1 hover:bg-gray-300 hover:rounded-md`}>
                  <span>{isUploading ? 'Uploading...' :'Attach Files' }</span>
                  <input onChange={handleAttachFileUploadClicked} multiple type="file" className="hidden" />
        </label>
 
  )
}

export default AttachFilesButton