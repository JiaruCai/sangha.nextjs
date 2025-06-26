import Footer from '../career/Footer';
import NavBar from '../download/NavBar';
import TeamBlog from './TeamBlog';
import Seo from '../components/Seo';

export default function Page() {
  return( 
    <>
      <NavBar />
      <TeamBlog />
      <Seo title="JoinSangha Teams Blog" description="Stories in the JoinSangha team diary. Latest best practices, news, and trends, directly from the team's writers." />
    </>
  )
} 