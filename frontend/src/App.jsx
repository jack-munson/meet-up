import './App.css'
import { Signin } from './routes/Signin'
import { Signup } from './routes/Signup'
import { Home } from './routes/Home'
import { Front } from './routes/Front'
import { Profile } from './routes/Profile'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthContext } from './context/AuthContext'
import { Protected } from './routes/Protected'
import { MeetingPage } from './routes/MeetingPage'
import { Invite } from './routes/Invite'
import { Feedback } from './routes/Feedback'
import { Privacy } from './routes/Privacy'

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
    },
    {
      path: "/meeting/:meetingId",
      element: <Protected><MeetingPage/></Protected>,
    },
    {
      path: "/invite/:token",
      element: <Invite/>
    },
    {
      path: "/privacy",
      element: <Privacy/>
    },
    {
      path: "/feedback",
      element: <Feedback/>
    }
  ])

  return (
    <AuthContext>
      <RouterProvider router = {router}></RouterProvider>
    </AuthContext>
  )
}

export default App
