export default function Logo() {
    return (
        <div className="flex items-center justify-center mb-4">
            <div className="flex items-center">
                <div className="bg-gradient-to-r from-[#2563EB] to-[#4F46E5] rounded-lg p-1.5 mr-1 shadow-md">
                    <div className="text-white font-bold text-lg leading-none">TT</div>
                </div>
                <div className="flex flex-col">
                    <span className="text-gray-800 font-extrabold text-xl tracking-tight">Tech<span className="text-[#2563EB] font-black">Trove</span></span>
                    <span className="text-gray-500 text-[10px] -mt-1 tracking-wider font-medium">ELECTRONICS STORE</span>
                </div>
            </div>
        </div>
    )
}