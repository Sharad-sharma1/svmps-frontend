import { createHashRouter, RouterProvider } from 'react-router-dom'  // changed from createBrowserRouter
import Home from '../views/home/Home'
import Addarea from '../views/addarea/AddArea'
import Addvillage from '../views/addvillage/AddVillage'
import Navbar from '../navbar/Index'
import Login from '../login/Login'
import Showuser from '../views/showuserdata/ShowUser'
import Printuser from '../views/printdata/PrintData'
import Adduser from '../views/adduserdata/AddUser'
import CreateReceipt from '../views/createreceipt/CreateReceipt'

const router = createHashRouter(
  [
    {
      path: "/home",
      element:
        <div>
          <Navbar />
          <Home />
        </div>
    },
    {
      path: "/area",
      element:
        <div>
          <Navbar />
          <Addarea />
        </div>
    },
    {
      path: "/village",
      element:
        <div>
          <Navbar />
          <Addvillage />
        </div>
    },
    {
      path: "/user",
      element:
        <div>
          <Navbar />
          <Adduser />
        </div>
    },
    {
      path: "/showuser",
      element:
        <div>
          <Navbar />
          <Showuser />
        </div>
    },
    {
      path: "/receipts",
      element:
        <div>
          <Navbar />
          <Printuser />
        </div>
    },
    {
      path: "/create-receipt",
      element:
        <div>
          <Navbar />
          <CreateReceipt />
        </div>
    },
    {
      path: "/",
      element:
        <div>
          <Login />
        </div>
    }
  ]
)

const Routerall = () => {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  )
}

export default Routerall
