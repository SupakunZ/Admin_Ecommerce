import React from 'react'
import Sidebar from '../../components/navbar/sidebar/Sidebar'
import { Route, Routes } from 'react-router-dom'
import AddProduct from '../../components/addProduct/AddProduct'
import ListProduct from '../../components/listProduct/ListProduct'
import './admin.css'

const Admin = () => {
  return (
    <>
      <div className='admin flex'>
        <Sidebar />
        <Routes>
          <Route path='/addproduct' element={<AddProduct />} />
          <Route path='/listproduct' element={<ListProduct />} />
        </Routes>
      </div>
    </>
  )
}

export default Admin