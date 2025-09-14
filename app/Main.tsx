import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import { formatDate } from 'pliny/utils/formatDate'

const MAX_DISPLAY = 5

export default function Home({ posts }) {
  return (
    <>
      {/* Hero section commented out
      <div className="mb-12 overflow-hidden rounded-lg bg-blue-100 dark:bg-blue-900/20 p-12">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 sm:text-5xl md:text-6xl">
            {siteMetadata.headerTitle}
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
            {siteMetadata.description}
          </p>
          <div className="mt-6">
            <Link 
              href="/about" 
              className="inline-flex items-center justify-center rounded bg-blue-600 px-6 py-3 text-lg font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
      */}

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {/* <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h2 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-4xl md:leading-14 dark:text-gray-100">
            Latest Posts
          </h2>
        </div> */}
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {!posts.length && 'No posts found.'}
          {posts.slice(0, MAX_DISPLAY).map((post) => {
            const { slug, date, title, summary, tags } = post
            return (
              <li key={slug} className="py-10">
                <article className="transform transition duration-500 hover:scale-[1.01]">
                  <Link href={`/posts/${slug}`} className="group block">
                    <div className="relative overflow-hidden rounded-lg bg-white p-6 shadow-md dark:bg-gray-900">
                      <div className="absolute top-0 left-0 h-1 w-full origin-left scale-x-0 transform bg-blue-600 transition-transform duration-300 group-hover:scale-x-100"></div>
                      <div className="space-y-4">
                        <div>
                          <h2 className="text-2xl leading-8 font-bold tracking-tight text-gray-900 transition duration-300 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                            {title}
                          </h2>
                          <div className="mt-3 flex items-center space-x-3">
                            <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                              <time dateTime={date}>{formatDate(date, siteMetadata.locale)}</time>
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {tags.map((tag) => (
                                <Tag key={tag} text={tag} isLink={false} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                          {summary}
                        </div>
                        <div className="pt-4 text-base font-medium">
                          <span className="text-primary-600 dark:text-primary-400 inline-flex items-center transition-transform duration-300 group-hover:translate-x-2">
                            Read more{' '}
                            <span aria-hidden="true" className="ml-1">
                              &rarr;
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              </li>
            )
          })}
        </ul>
      </div>
      {posts.length > MAX_DISPLAY && (
        <div className="flex justify-end text-base leading-6 font-medium">
          <Link
            href="/posts"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-500 dark:hover:text-primary-400 border-primary-600 dark:border-primary-500 inline-flex items-center rounded-md border px-4 py-2 text-base font-medium transition-colors duration-200"
            aria-label="All posts"
          >
            All Posts &rarr;
          </Link>
        </div>
      )}
    </>
  )
}
