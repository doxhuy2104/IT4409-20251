export default function Logo() {
    return (
        <div className="flex justify-center items-center gap-1 mb-2">
          <div className="flex justify-center items-center gap-2 mb-2">
            <img className="mx-auto mb-0 w-20 h-20" src="/logo.png" alt="FreshFood Market Logo" />
            <h1 className="text-2xl font-bold text-green-700 tracking-wide">Harvest & Home</h1>
          </div>
        </div>
    )
}