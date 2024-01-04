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
import { useDispatch } from 'react-redux';


import { ADD_DEPOSIT, ADD_DISTRIBUTE } from '../src/redux/action/type';


const PayPerProposal = () => {

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
    currentProposalCreationFee,
    updateWallet,
    lpTokenEth,
    lpDepositedTokenEth,
    isConnected,
    fgolTokenEth,
    fgolBalanceEth

  } = useWeb3();
  
  const { showNotification } = useNotification();
  const { openSpin, closeSpin } = useSpinner();
  const dispatch = useDispatch();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  
  const [value, setValue] = React.useState(0);
  const [isValidate, setIsValidate] = React.useState(false);

  const [isStart, setIsStart] = React.useState(true);

  /**
   * if pay is exists, navigate to /proposal
   */
  const _hasUserPaidFee = async() => {
    const value = await FGOLDistributionContract.methods.hasUserPaidFee( walletAddress ).call()
    if ( value ) {
      router.push("/proposal");
    }
    setIsStart(false);
  }

  React.useEffect(() => {
    if ( FGOLDistributionContract && walletAddress && isStart ) {
      _hasUserPaidFee();
    }
  }, [FGOLDistributionContract, walletAddress])
  

  const handleBuyFGOLClick = () => {
    window.open('https://www.sushi.com/swap?chainId=137&token0=0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619&token1=0x700481409de3f632F61a2AC9BFd76138357714da&swapAmount=1', '_blank');
  }
  /**
   * set the max LP token values
   * @returns 
   */
  const setMaxFGOLToken = () => {
    if(!fgolBalanceEth) return;
    setValue(fgolBalanceEth);
  }

  /**
   * distribute FGOL tokens
   */
  const handlePayClick = async() => {
  
    // setIsValidate(true);

    // if(Number(value) === 0) {
    //   return showNotification("Input amount of FGOL token", "error");
    // }

    try {

      setIsLoading(true);
      openSpin(`Paying for proposal`);

      const currentProposalCreationFeeWei = await _web3.utils.toWei(currentProposalCreationFee, 'ether');
      await FGOLTokenContract.methods.approve(addressOfFGOLDistribution, currentProposalCreationFeeWei).send({ from: walletAddress });

      showNotification("Payment approved", "success");

      const tx = await FGOLDistributionContract.methods.payProposalFee().send({ from: walletAddress });

      showNotification("Proposal fee successfully paid", "success");

      // window.localStorage.setItem("step", "pay");

      await updateWallet();
      router.push("/proposal");
    } catch (error) {
      console.log(error);
      showNotification("Proposal fee payment failed", "error");
    } finally {
      // setValue(0);
      setIsLoading(false);
      closeSpin();
    }
  }



  return (
    <Box backgroundColor='#041431' position='fixed' top={0} left={0} right={0} bottom={0} sx={{overflowY:'auto'}}>
      <Box px={{ xs:3, sm:10 }} position='relative' backgroundColor='#1C1C39' maxWidth={550} pt={10} minHeight='100vh' pb={4} margin='auto'>
        <Box position='absolute' top={15} right={15} sx={{cursor:'pointer', '&:hover':{opacity:0.7}}}><Icon onClick={() => router.push("/proposals")} icon="mingcute:close-fill" width={30} color="white" /></Box>
        <Grid item container justifyContent='center' gap={1}>
          <img src='/icons/logo.png' width={50}/>
          <Typography color='white' fontSize={25} fontWeight={600}>BLOCKUM</Typography>
        </Grid>
        
        <Typography width='100%' color='white' fontSize={20} mt={6}>PAY PER PROPOSAL:</Typography>

        <Box width='100%' mt={2}>
          <TextField
            label="amount"
            fullWidth
            id="margin-none"
            type="number"
            value={currentProposalCreationFee ? currentProposalCreationFee : "0"}
            // onChange={e => setValue(e.target.value)}
            disabled
            InputProps={{
              startAdornment: <InputAdornment position="start" sx={{'& p':{color:'white!important'}}}>FGOL</InputAdornment>,
            }}
            helperText={(Number(value) === 0 && isValidate) ? "Input amount of FGOL token.": ''}
          />
        </Box>
        <Typography width='100%' color='white' fontSize={14} textAlign='right'>
          Assets: FGOL {fgolBalanceEth && Number(fgolBalanceEth).toFixed(2)}
        </Typography>
        <Box width='100%' mt={1}>
          <Button onClick={handlePayClick} fullWidth variant="contained" sx={{borderRadius:5, fontSize:'17px!important', backgroundColor:'#041431!important'}} size='small'>PAY</Button>
        </Box>
        <Typography width='100%' color='white' fontSize='1rem' mt={10} textAlign='center'>
          To pay per proposal, you need to have FGOL:
        </Typography>
        <Box width='100%' textAlign='center' mt={1}>
          <Button onClick={handleBuyFGOLClick} variant="contained" sx={{borderRadius:4, px:4, fontSize:'17px!important', backgroundColor:'#2683F6!important', width:{xs:'100%', sm:'150px'}}} size='small'>BUY FGOL</Button>
        </Box>
      </Box>
    </Box>
  )
}

export default PayPerProposal;