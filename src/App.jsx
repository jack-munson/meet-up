import './App.css'
import { Signin } from './routes/Signin'
import { Signup } from './routes/Signup'
import { Home } from './routes/Home'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthContext } from './context/AuthContext'
import { Protected } from './routes/Protected'

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Protected><Home/></Protected>
    },
    {
      path: "/home",
      element: <Protected><Home/></Protected>
    },
    {
      path: "/signin",
      element: <Signin></Signin>
    },
    {
      path: "/signup",
      element: <Signup></Signup>
    }
  ])

  return (
    <AuthContext>
      <RouterProvider router = {router}></RouterProvider>
    </AuthContext>
  )
}

export default App
