import NavBar from '../download/NavBar';
import TeamBlog from './TeamBlog';
import { generateSeoMetadata } from '../components/Seo';

export const metadata = generateSeoMetadata({
  title: "JoinSangha Teams Blog",
  description: "Stories in the JoinSangha team diary. Latest best practices, news, and trends, directly from the team's writers.",
  url: "https://joinsangha.com/team-blog"
})

export default function Page() {
  return( 
    <>
      <NavBar />
      <TeamBlog />
    </>
  )
} 