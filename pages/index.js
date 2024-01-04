import { Icon } from '@iconify/react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React, {useEffect, useState} from 'react';
import { useRouter } from 'next/router';
import useWeb3 from '../src/hooks/useWeb3';
import useNotification from '../src/hooks/useNotification';

function index() {

  /**
 * import variables from web3 context
 */
  const {
    connectMetaMask,
    walletAddress,
    isConnecting,
    isConnected,
    disconnectMetaMask
  } = useWeb3();

  const { showNotification } = useNotification();

  const _renderConnectButtonText = () => {
    if(isConnecting) {
      return "connecting..."
      // return <Box display="flex" alignItems="center" height={26}><Icon icon="eos-icons:three-dots-loading" width={50} color="white" /></Box>
    }else if(walletAddress) {
      // return _truncateText(walletAddress)
      return "DISCONNECT WALLET"
    } else {
      return "CONNECT WALLET"
    }
  }

  const handleDisconnectClick = () => {
    disconnectMetaMask();
    showNotification("DisConnected", "success");
  }

  const handleConnectWallet = async() => {
    if (isConnected) { 
      handleDisconnectClick();     
      return;
    }
    
    try {
      await connectMetaMask();
      showNotification("Connect success", "success");
    } catch (e) {
      showNotification("Connect failed", "error");
      console.log(e)
    }
  };


  const router = useRouter();

  return (
    <Grid container paddingX={{ xs:3, md: 10 }} sx={{backgroundColor: 'rgb(11, 0, 26)', minHeight:'100vh'}}>
      <Grid container alignItems='center' justifyContent='space-between' gap={{ xs:3, md:0 }}>
        <Box sx={{cursor:'pinter'}} textAlign='center' width={{ xs:'100%', md:'auto' }}>
          <img src='/images/BlockumDAOLogo.png' width={270} alt=""/>
        </Box>
        <Box display='flex' flexDirection={{ xs:'column', md:'row' }} gap={{ xs:3, md:0 }} width={{xs:'100%', md:'auto'}} maxWidth={{ xs: 'auto', md: 500 }} flexGrow={1} justifyContent='space-around'>
          <Box sx={{cursor:'pointer'}} onClick={() => router.push("/home")} textAlign='center' width={{ xs:'100%', md:'auto' }} xs={12} fontSize='1.5rem' fontWeight={900} color='white'>HOME</Box>
          <Box sx={{cursor:'pointer'}} textAlign='center' width={{ xs:'100%', md:'auto' }} xs={12} fontSize='1.5rem' fontWeight={900} color='white'>ABOUT US</Box>
          <Box sx={{cursor:'pointer'}} textAlign='center' width={{ xs:'100%', md:'auto' }} xs={12} fontSize='1.5rem' fontWeight={900} color='white'>FAQ</Box>
        </Box>
        <Box sx={{cursor:'pinter'}} textAlign='center' width={{ xs:'100%', md:'auto' }} xs={12} color='white'>
          <button
            style={{
              width: "100%",
              background: 'none',
              padding: '5px 10px',
              color: '#2C4ACC',
              border: '#2C4ACC solid 3px',
              borderRadius: '50px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
            }}
            onClick={handleConnectWallet}
          >
            { _renderConnectButtonText() }
          </button>
        </Box>
      </Grid>

      <Box display='flex' mt={10} flexDirection='column'>
          <Typography fontSize={64} color='white' fontWeight={800} lineHeight={1.2}> 
            Community <br />
            <span style={{ color: '#2C4ACC' }}>for Fostering</span> <br />
            Global <i style={{ color: '#2C4ACC' }}>Innovation</i>
          </Typography>
          <Typography fontSize='1.5rem' color='white' fontWeight={800}>
            The largest community for Fostering Startups and <br /> promising
            business opportunities in the world!
          </Typography>
          <br />
          <button
            style={{
              background: 'linear-gradient(to right, #3156CE , #67D9E6)',
              padding: '10px 20px',
              color: 'white',
              border: 'none',
              borderRadius: '50px',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginTop: '30px',
              maxWidth: '200px'
            }}
          >
            Become a Member
          </button>
      </Box>
    </Grid>
  );
}

export default index;
