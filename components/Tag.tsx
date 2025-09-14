import Link from 'next/link'
import { slug } from 'github-slugger'
interface Props {
  text: string
}

const Tag = ({ text }: Props) => {
  return (
    <Link
      href={`/tags/${slug(text)}`}
      className="hover:bg-primary-100 hover:text-primary-700 dark:hover:bg-primary-900 dark:hover:text-primary-300 mr-2 mb-2 inline-block rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600 transition-colors duration-200 dark:bg-gray-800 dark:text-gray-300"
    >
      {text.split(' ').join('-')}
    </Link>
  )
}

export default Tag
