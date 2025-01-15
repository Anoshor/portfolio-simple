import Hero from './sections/Hero'
import Navbar from './sections/Navbar'

const App = () => {
  return (
    <main className='max-w-7xl mx-auto'>
      {/* <h1 className='text-2xl text-white underline'>Hello, Anoshor</h1> */}
      <Navbar/>
      <Hero />
    </main>
  )
}

export default App