import Onigiri from './Onigiri'

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="animate-bounce">
        <Onigiri mood="loading" size={60} />
      </div>
      <p className="text-xs text-[#999999] mt-3 animate-pulse">Loading...</p>
    </div>
  )
}

export default LoadingSpinner
