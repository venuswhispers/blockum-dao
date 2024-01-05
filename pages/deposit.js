import { Icon } from '@iconify/react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import React from 'react'
import TextField from '../src/components/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { useRouter } from 'next/router';
import useWeb3 from '../src/hooks/useWeb3';
import useNotification from '../src/hooks/useNotification';
import axios from 'axios';
import useSpinner from '../src/hooks/useSpinner';
import { useDispatch, useSelector } from 'react-redux';

import { ADD_DEPOSIT } from '../src/redux/action/type';

const Deposit = () => {

  const {
    _web3,
    connectMetaMask,
    walletAddress,
    isMember,
    BlockumVaultContract,
    LPTokenContract,
    FGOLTokenContract,
    FGOLDistributionContract,
    addressOfBlockumVault,
    addressOfFGOLDistribution,
    updateWallet,
    lpTokenEth,
    lpDepositedTokenEth,
    isConnected,
    _init

  } = useWeb3();

  const { showNotification } = useNotification();
  const { openSpin, closeSpin } = useSpinner();
  const dispatch = useDispatch();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const [value, setValue] = React.useState(0);
  const [isValidate, setIsValidate] = React.useState(false);

  const [isBegin, setIsBegin] = React.useState(false);

  const { deposits, distributes } = useSelector((state) => state.history);

  /**
   * set the max LP token values
   * @returns 
   */
  const setMaxLPToken = () => {
    if(!lpTokenEth) return;
    setValue(lpTokenEth);
  }

  /**
   * deposit LP tokens
   */
  const handleDeposit = async() => {
    
    setIsValidate(true);

    if(Number(value) === 0) {
      return showNotification("Input amount of LP token", "error");
    }

    try {

      setIsLoading(true);
      openSpin(`Depositing ${value} LP tokens`);

      const depositValueWei = _web3.utils.toWei(value, 'ether');
      await LPTokenContract.methods
        .approve(addressOfBlockumVault, depositValueWei)
        .send({ from: walletAddress });
      
      showNotification("Deposit Approved.", "success");
      
      const res = await BlockumVaultContract.methods.deposit(depositValueWei).send({
        from: walletAddress,
      });

      console.log("tx", res)
      
      showNotification("Deposit Success.", "success");

      const response = await axios.post('/blockum-vault/deposit', {
        walletAddress: walletAddress,
        amount: value,
        created: new Date(),
        type: true,
        transactionHash: res.transactionHash,
        blockHash: res.blockHash,
        transactionIndex: res.transactionIndex
      });

      dispatch({
        type: ADD_DEPOSIT,
        payload: response.data,
      });

      await updateWallet();
      router.push("/home");
    } catch (error) {
      console.log(error);
      showNotification("Deposit failed.", "error");
    } finally {
      setValue(0);
      setIsLoading(false);
      closeSpin();
    }
  }

  const _gotoURL = (url) => {
    // window.open(url, '_blank');
    // window.open(url);
    router.push(url)
  }

  
  const _initialize = async() => {
    try {
      await _init();
    } catch ( err ) {
      console.log(err)
    }
  }

  React.useEffect(() => {

    if ( !isBegin && !isConnected && deposits.length === 0 ) {
      console.log("...................")
      _initialize();
    }

    setIsBegin(true);
  }, [isConnected]);

  return (
    <Box backgroundColor='#041431' position='fixed' top={0} left={0} right={0} bottom={0} sx={{overflowY:'auto'}}>
      <Box px={{ xs:3, sm:10 }} position='relative' backgroundColor='#1C1C39' maxWidth={550} pt={10} minHeight='100vh' pb={4} margin='auto'>
        <Box position='absolute' top={15} right={15} sx={{cursor:'pointer', '&:hover':{opacity:0.7}}}><Icon onClick={() => router.push("/home")} icon="mingcute:close-fill" width={30} color="white" /></Box>
        <Grid item container justifyContent='center' gap={1}>
          <img src='/icons/logo.png' width={50}/>
          <Typography color='white' fontSize={25} fontWeight={600}>BLOCKUM</Typography>
        </Grid>
        
        <Typography width='100%' color='white' fontSize={20} mt={6}>DEPOSIT LP TOKEN:</Typography>

        <Box width='100%' textAlign='right' mb='3px'>
          <Button onClick={setMaxLPToken} variant="contained" sx={{borderRadius:5, height:25, fontSize:'12px!important', backgroundColor:'#041431!important'}} size='small'>MAX</Button>
        </Box>
        <Box width='100%'>
          <TextField
            error={true}
            label="amount"
            fullWidth
            id="margin-none"
            type="number"
            value={value.toString()}
            onChange={e => setValue(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start" sx={{'& p':{color:'white!important'}}}>LP</InputAdornment>,
            }}
            helperText={(Number(value) === 0 && isValidate) ? "Input amount of LP token.": ''}
          />
        </Box>
        <Typography width='100%' color='white' fontSize={14} textAlign='right'>
          Assets: LP {lpTokenEth && Number(lpTokenEth).toFixed(2)}
        </Typography>
        <Box width='100%' mt={2}>
          <Button onClick={handleDeposit} fullWidth variant="contained" sx={{borderRadius:5, fontSize:'17px!important', backgroundColor:'#041431!important'}} size='small'>DEPOSIT</Button>
        </Box>
        <Box width='100%' mt={2} border='1px solid white' borderRadius={3} padding={2}>
          <Typography color='white' fontSize='0.8rem'>Deposit LP tokens to become a member of the Blockum DAO Community.</Typography>
          <Typography color='white' fontSize='0.8rem' my={3}>Benefits when becoming a member:</Typography>
          <Typography color='white' fontSize='0.8rem'>
            *Launch a proposal for development to the community;<br/>
            *Vote on ongoing proposals;<br/>
            *Participate in profit distributions from all Startups and promising businesses fostered by Blockum DAO and GoldOfir</Typography>
        </Box>
        <Typography width='100%' color='white' fontSize='1rem' my={1} textAlign='center'>
          To get LP you need to stake FGOL:
        </Typography>
        <Grid container justifyContent='space-between' gap={1}>
          <Button onClick={() => _gotoURL('https://app.1inch.io/#/137/simple/swap/amWETH/FGOL')} variant="contained" sx={{borderRadius:5, fontSize:'17px!important', backgroundColor:'#2683F6!important', width:{xs:'100%', sm:'170px'}}} size='small'>BUY FGOL</Button>
          <Button onClick={() => _gotoURL('https://www.sushi.com/pool/137:0xcc2873f0e4f56f3ca8bc3d6d3cd0b1328816ce5f')} variant="contained" sx={{borderRadius:5, fontSize:'17px!important', backgroundColor:'#041431!important', width:{xs:'100%', sm:'170px'}}} size='small'>STAKING FGOL</Button>
        </Grid>
      </Box>
      
    </Box>
  )
}

export default Deposit;