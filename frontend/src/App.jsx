import React from 'react'
import './App.css'
import {BrowserRouter as Router , Routes,Route} from 'react-router-dom'
import { Provider, useDispatch } from 'react-redux' 
import store from './store/store' 
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Jobs from './pages/Jobs'
import Dashboard from './pages/Dashboard'
import PostApplication from './pages/PostApplication'
import Register from './pages/Register'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const App = () => {

  return (
    <>
    <Provider store={store}> {}
      <Router>
        <Navbar />
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/jobs' element={<Jobs/>}/>
          <Route path='/dashboard' element={<Dashboard/>}/>
          <Route path="/post/application/:jobId" element={<PostApplication/>}/>
          <Route path='/register' element={<Register/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='*' element={<NotFound/>}/>
        </Routes>
        <Footer/>
        <ToastContainer position="top-right" 
         theme="dark"/>
      </Router>
    </Provider>{}
    </>
  )
}

export default App