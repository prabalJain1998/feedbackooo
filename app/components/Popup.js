import Button from "./Button"

const Popup = ({setShow, children, title, narrow, component}) => {
    function close(e){
        e.preventDefault();
        e.stopPropagation();
        setShow(false);
    }
  
  return (
    <div className="fixed inset-0 bg-white md:bg-black md:bg-opacity-80 flex md:items-center overflow-y-scroll" onClick={close}>

        <button onClick={close} className="hidden md:block fixed top-4 right-4 text-white">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
</svg>

        </button>
        <div className="w-full max-h-screen">
        <div className={`bg-white ${narrow ? `md:max-w-md`: `md:max-w-2xl`} md:my-3 md:mx-auto rounded-md overflow-hidden`} onClick={(e) => e.stopPropagation()}>
            <div className="relative min-h-[40px] md:min-h-0">
                <button onClick={close} className="absolute top-4 left-8 md:hidden">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
</svg>
                
                </button>  
                {
                    !!title &&    <h2 className="py-4 text-center border-b">
                    {title}
                    </h2>
                }


                {
                  component && component()
                }
            </div>
            
            {children}
            
        </div>
        </div>
    </div>
  )
}

export default Popup;