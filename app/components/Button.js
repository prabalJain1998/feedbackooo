'use client';

const Button = (props) => {
  return (
    <button 
    disabled={props?.disabled}
    {...props} 
    className=
    {`flex gap-2 py-1 px-2 rounded-md text-opacity-90 ${props.primary ? 'bg-blue-500 text-white' : 'text-gray-600'} ${props?.disabled ? 'bg-opacity-40 cursor-not-allowed' : ''}`} />
  
  )
}

export default Button