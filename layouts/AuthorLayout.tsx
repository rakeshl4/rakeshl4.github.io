import { ReactNode } from 'react'
import type { Authors } from 'contentlayer/generated'
import SocialIcon from '@/components/social-icons'
import Image from '@/components/Image'

interface Props {
  children: ReactNode
  content: Omit<Authors, '_id' | '_raw' | 'body'>
}

export default function AuthorLayout({ children, content }: Props) {
  const { name, avatar, occupation, company, email, twitter, bluesky, linkedin, github } = content

  return (
    <>
      {/* Background pattern elements */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* Circles - all blue now */}
        <div className="animate-blob absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-200 opacity-20 mix-blend-multiply blur-3xl filter dark:bg-blue-900 dark:opacity-10 dark:mix-blend-soft-light"></div>
        <div className="animate-blob animation-delay-2000 absolute top-3/4 right-1/4 h-96 w-96 rounded-full bg-blue-100 opacity-20 mix-blend-multiply blur-3xl filter dark:bg-blue-800 dark:opacity-10 dark:mix-blend-soft-light"></div>
        <div className="animate-blob animation-delay-4000 absolute bottom-1/4 left-1/2 h-96 w-96 rounded-full bg-blue-300 opacity-20 mix-blend-multiply blur-3xl filter dark:bg-blue-700 dark:opacity-10 dark:mix-blend-soft-light"></div>
        {/* Grid pattern */}
        <div className="bg-grid-pattern-light dark:bg-grid-pattern-dark bg-grid-pattern absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"></div>
        {/* Dots pattern */}
        <div className="bg-dots-pattern-light dark:bg-dots-pattern-dark bg-dots-pattern absolute top-0 right-0 left-0 h-screen opacity-[0.02] dark:opacity-[0.025]"></div>
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* About header removed */}
        <div className="items-start space-y-8 pt-8 xl:grid xl:grid-cols-12 xl:space-y-0 xl:gap-x-8">
          {/* Profile Card */}
          <div className="relative flex transform flex-col items-center justify-center overflow-hidden bg-white/80 p-6 pt-8 text-center shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl xl:col-span-3 dark:bg-gray-900/80">
            {/* Card decorative elements */}
            <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-blue-100 opacity-20 dark:bg-blue-900"></div>
            <div className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-blue-200 opacity-20 dark:bg-blue-700"></div>
            <div className="relative flex w-full justify-center">
              {avatar && (
                <Image
                  src={avatar}
                  alt="avatar"
                  width={128}
                  height={128}
                  className="h-32 w-32 object-cover shadow-lg"
                />
              )}
            </div>
            <h3 className="w-full pt-4 pb-1 text-center text-xl leading-8 font-bold tracking-tight text-black dark:text-white">
              {name}
            </h3>
            <div className="w-full text-center text-sm font-medium text-gray-700 dark:text-gray-300">
              {occupation}
            </div>
            <div className="w-full text-center text-sm text-gray-500 dark:text-gray-400">
              {company}
            </div>
            <div className="flex w-full items-center justify-center space-x-3 pt-6">
              {email && <SocialIcon kind="mail" href={`mailto:${email}`} size={5} />}
              {github && <SocialIcon kind="github" href={github} size={5} />}
              {linkedin && <SocialIcon kind="linkedin" href={linkedin} size={5} />}
              {twitter && <SocialIcon kind="x" href={twitter} size={5} />}
              {bluesky && <SocialIcon kind="bluesky" href={bluesky} size={5} />}
            </div>
          </div>
          {/* Content */}
          <div className="prose dark:prose-invert relative max-w-none overflow-hidden bg-white/80 p-8 pt-8 pb-8 shadow-xl backdrop-blur-sm xl:col-span-9 dark:bg-gray-900/80">
            {/* Content decorative elements */}
            <div className="absolute top-1/4 -right-12 h-24 w-24 rounded-full bg-blue-100 opacity-10 dark:bg-blue-900"></div>
            <div className="absolute top-3/4 -left-12 h-24 w-24 rounded-full bg-blue-200 opacity-10 dark:bg-blue-700"></div>
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
