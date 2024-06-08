import './App.css'
import { Signin } from './routes/Signin'
import { Signup } from './routes/Signup'
import { Home } from './routes/Home'
import { Front } from './routes/Front'
import { Profile } from './routes/Profile'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthContext } from './context/AuthContext'
import { Protected } from './routes/Protected'

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Front/>
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
    },
    {
      path: "/profile",
      element: <Protected><Profile/></Protected>
    }
  ])

  return (
    <AuthContext>
      <RouterProvider router = {router}></RouterProvider>
    </AuthContext>
  )
}

export default App
