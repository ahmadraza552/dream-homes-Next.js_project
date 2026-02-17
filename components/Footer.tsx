import React from 'react'

export default function Footer() {
    const currentYear= new Date().getFullYear()
  return (
    <footer>
      <div className='footer'>
         <div className='container'>
           
            <p className='footer-text'>
        Raza 💗 Dream Homes 🏛️ &copy;{currentYear} - All Rights Reserved
         </p>
         </div>
      </div>
    </footer>
  )
}
