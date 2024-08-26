import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function PageTitle({ children }: Props) {
  return (
    <h1 className="text-3xl font-bold leading-9 tracking-tight text-blue-900 dark:text-blue-100 sm:text-2xl sm:leading-10 md:text-4xl md:leading-12">
      {children}
    </h1>
  )
}
