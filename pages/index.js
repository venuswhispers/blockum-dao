import { Icon } from '@iconify/react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React, {useEffect, useState} from 'react';
import { useRouter } from 'next/router';
import useWeb3 from '../src/hooks/useWeb3';
import useNotification from '../src/hooks/useNotification';
import useSpinner from '../src/hooks/useSpinner';

function index() {

  /**
 * import variables from web3 context
 */
  const {
    _web3,
    connectMetaMask,
    walletAddress,
    isConnecting,
    isConnected,
    disconnectMetaMask
  } = useWeb3();

  const {openSpin, closeSpin} = useSpinner();

  const { showNotification } = useNotification();

  const [ showConfirmModal,  setShowConfirmModal ] = React.useState(false)


  const handleSwitchToPolygon = async() => {
    const _chainId = 137;
    const _chainIdAsHex = _web3.utils.toHex(_chainId);

    if ( window.ethereum.networkVersion == _chainId ) {
      setShowConfirmModal(false);
      return showNotification("Current chain is Polygon", "success")
    }
    

    setShowConfirmModal(false);

    try {

      openSpin("Switching to Polygon")
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: _chainIdAsHex }]
      });
      showNotification("Successfully switched to Polygon", "success");
    } catch (err) {
        // This error code indicates that the chain has not been added to MetaMask
      if (err.code === 4902) {
        openSpin("Adding Polygon network")
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainName: 'Polygon Mainnet',
              chainId: _chainIdAsHex,
              nativeCurrency: { name: 'MATIC', decimals: 18, symbol: 'MATIC' },
              rpcUrls: ['https://polygon-rpc.com/']
            }
          ]
        });
        showNotification("Successfully switched to Polygon", "success");
      }
    } finally {
      closeSpin();
    }

    
  }

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


    if ( window.ethereum.networkVersion == 137 ) {
      try {
        await connectMetaMask();
        showNotification("Connect success", "success");
      } catch (e) {
        showNotification("Connect failed", "error");
        console.log(e)
      }
    } else {
      setShowConfirmModal( true )
    }
    
    
  };

  const _connectWallet = async() => {
    setShowConfirmModal(false);
    try {
      await connectMetaMask();
      showNotification("Connect success", "success");
    } catch (e) {
      showNotification("Connect failed", "error");
      console.log(e)
    }
  }


  const router = useRouter();

  const _renderSwitchConfirmModal = () => {

    return ( 
      <Box zIndex={10000} position='fixed' top={0} left={0} right={0} bottom={0} display='flex' justifyContent='center' alignItems='center'>
        <Box onClick={() => setShowConfirmModal(false)} position='fixed' top={0} left={0} right={0} bottom={0} sx={{backgroundColor: '#041431b9'}}/>
        <Box zIndex={10000000} width={400} sx={{backgroundColor:'white'}} padding={3} borderRadius={10}>
          <Box
            textAlign='center' 
            padding={1}
            borderRadius={5}
            sx={{ 
              cursor: 'pointer',
            }} 
            display='flex' alignItems='center' gap={2}
          >
            <Icon height={30} className='t-cursor-pointer hover:t-opacity-[0.6]' icon="cryptocurrency-color:matic" rotate={1} />
            <Typography>Are you agree to switch to Polygon?</Typography>
          </Box>
          <Grid container gap={1} justifyContent='center' mt={1}>
            <Button onClick={handleSwitchToPolygon} variant="contained" sx={{borderRadius:4,textTransform:'none', width:100,  backgroundColor:'#2683F6!important'}} size='small'>O K</Button>
            <Button onClick={_connectWallet}  variant="contained" sx={{borderRadius:4,textTransform:'none', width:100,  backgroundColor:'#ff22F6!important'}} size='small'>CANCEL</Button>
          </Grid>
        </Box>
      </Box>
    )
  }

  return (
    <Grid container paddingX={{ xs:3, md: 10 }} sx={{backgroundColor: 'rgb(11, 0, 26)', minHeight:'100vh'}}>
      { showConfirmModal && _renderSwitchConfirmModal() }
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
