import { LoadingAnimation } from "@vcassist/ui"
import { useEffect, useState } from "react"

export function LoadingPage() {
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => {
      setShowAnimation(true)
    }, 1000)
    return () => clearTimeout(id)
  }, [])

  if (showAnimation) {
    return <LoadingAnimation />
  }
  return <></>
}
