import Image from "next/image"

const Avatar = ({url = null}) => {
  return (
    <div>
        <div className="rounded-full  w-10 h-10">
        <Image className="rounded-full cursor-pointer" src={url} alt="user" width={30} height={30}/>
        </div>
    </div>
  )
}

export default Avatar