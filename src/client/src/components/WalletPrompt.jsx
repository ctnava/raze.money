import React from "react";
import { Spinner } from "react-bootstrap";

function WalletPrompt() {
  const style = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
    fontWeight: 'bold',
    // fontSize: '2rem'
    // backgroundColor: '#334756'
  };

  return(
      <div style={style}>
          <Spinner animation="border" style={{ display: 'flex' }} />
          <p className='mx-3 my-0' >Awaiting Metamask/ Web3 Connection...</p>
      </div>
      );
}

export default WalletPrompt;
