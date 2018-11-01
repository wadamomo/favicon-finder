import React from 'react'

const Favicon = ({ url }) => {
  if (!url) return null;
  return (
    <div>
      <img src={url} alt="favicon"/>
    </div>
  )
}

export default Favicon;