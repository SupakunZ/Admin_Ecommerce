import React, { useEffect, useState } from 'react'
import cross_icon from '../../assets/cross_icon.png'
import './listproduct.css'

const ListProduct = () => {

  const [allproducts, setAllproducts] = useState([])

  const fectInfo = async () => {
    await fetch('http://localhost:4000/allproducts')
      .then(resq => resq.json())
      .then(data => {
        setAllproducts(data)
        console.log(allproducts)
        console.log(data)

      })
  }

  const remove_product = async (id) => {
    try {
      await fetch('http://localhost:4000/removeproduct', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: id })
      })
      await fectInfo()
    } catch (error) {
      alert('Delete Faild')
    }
  }

  useEffect(() => {
    fectInfo()
  }, [])

  // console.log(allproducts)

  return (
    <>
      <div className='list-product flex flex-col items-center w-full h-[740px] p-[10px_50px] m-[30px] rounded-[6px] bg-white'>
        <h1>All Products List</h1>
        <div className="listproduct-format-main grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] text-[15px] font-medium gap-[10px] w-full py-[20px] text-[#454545]">
          <p>Produsts</p>
          <p>Title</p>
          <p>Old Price</p>
          <p>New Price</p>
          <p>Category</p>
          <p>Remove</p>
        </div>
        <div className="listproduct-allproducts w-full overflow-y-auto">
          <hr />
          {allproducts.map((product, index) => {
            return <><div key={index} className="listproduct-format-main listproduct-format grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] text-[15px] font-medium gap-[10px] w-full py-[20px] text-[#454545] items-center">
              <img src={product.image} alt="" className="listproduct-product-icon h-[80px] m-auto" />
              <p>{product.name}</p>
              <p>${product.old_price}</p>
              <p>${product.new_price}</p>
              <p>{product.category}</p>
              <img onClick={(e) => remove_product(product.id)} className='listproduct-remove-icon cursor-pointer m-auto' src={cross_icon} alt="" />
            </div>
              <hr />
            </>
          })}
        </div>
      </div>
    </>
  )
}

export default ListProduct