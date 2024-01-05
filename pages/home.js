import React from 'react'
import { Icon } from '@iconify/react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useSelector, useDispatch } from 'react-redux';
import useWeb3 from '../src/hooks/useWeb3';
import axios from 'axios';
import useSpinner from '../src/hooks/useSpinner';
import useNotification from '../src/hooks/useNotification';

import { useRouter } from 'next/router';

import { _timestampToDateForDeposit, _timestampToDateForDistribute, _truncateText } from '../src/customUtils';

const Home = () => {

  const router = useRouter();
  const { showNotification } = useNotification();
  const { openSpin, closeSpin } = useSpinner();
  const [ showConfirmModal,  setShowConfirmModal ] = React.useState(false)

  const {
    _web3,
    lpTokenEth,
    fgolTokenEth,
    walletAddress,
    proposals,
    FGOLDistributionContract,
    BlockumDAOContract,
    currentProposalCreationFee,
    FGOLTokenContract,
    addressOfFGOLDistribution,
    lpDepositedTokenEth,
    isConnected,
    isFetchingHomeData,
    updateWallet,
    totalMemberBalance
  } = useWeb3();

  const dispatch = useDispatch();

  const { deposits, distributes } = useSelector((state) => state.history);

  React.useEffect(() => {
    console.log(deposits, distributes)
  }, [deposits])

  /**
   * convert WEI to eth
   * @param {*} wei 
   * @returns converted eth
  */
  const _weiToEth = (wei) => {
    if (!wei || wei === "") {
      return 0;
    }
    const eth = _web3.utils.fromWei(wei, 'ether');
    return eth;
  };


  /**
   * function for claim
   */
  const handleClaim = async () => {
    try {
      openSpin("Claiming FGOL tokens");
      await FGOLDistributionContract.methods.claim().send({
        from: walletAddress,
      });

      showNotification("Claim success.", "success");
      updateWallet();
    } catch (err) {
      console.log(err);

      showNotification("Claim failed.", "error");

    } finally {
      closeSpin();
    }
  };

  const handleBuyFGOLClick = () => {
    window.open('https://www.sushi.com/swap?chainId=137&token0=0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619&token1=0x700481409de3f632F61a2AC9BFd76138357714da&swapAmount=1', '_blank');
  }
  
  /**
   * open new window and go to there
   * @param {*} url 
  */
  const _gotoBlank = (url) => {
    window.open(url, '_blank');
  }



  // React.useEffect(() => {

  //   if (!isConnected || deposits.length > 0) {
  //     return;
  //   }
  //   init();
  // }, [isConnected]);

  const _renderDepositHistoryItem = (data, i) => (
    <Grid key={`deposit_history_${i}`} fontSize={{ xs: 14, sm: 15 }} mt={1} color='black' container backgroundColor='#E6E6E6' borderRadius={3} padding={1} justifyContent='space-between'>
      <Grid item>{_timestampToDateForDeposit(data.created)}</Grid>
      <Grid sx={{ cursor:'pointer' }} item flexGrow={1} pt='13px' px={1} onClick = {() => _gotoBlank(`https://goerli.etherscan.io/tx/${data.transactionHash}`)}>
        <Box borderBottom="1px dashed black"></Box></Grid>
      <Grid item>
        <Box display='flex' alignItems='center' gap={2}>
          { !data.type && '-' }LP{" "}
          { data.amount }
          { data.type ? <Icon height={18} icon="icon-park-solid:down-two" color="black" /> : <Icon height={18} icon="icon-park-solid:up-two" color="#2683f6" />}
        </Box>
      </Grid>
    </Grid>
  )

  const _renderDistributionHistoryItem = (data, i) => (
    <Grid key={`distribute_history_${i}`} fontSize={{ xs: 14, sm: 15 }} mt={1} color='black' container backgroundColor='#E6E6E6' borderRadius={3} padding={1} justifyContent='space-between'>
      <Grid item>{_timestampToDateForDistribute(data.createdAt)}</Grid>
      <Grid item flexGrow={1} px={{ xs: 1, sm: 5, md: 3 }}>
        <Grid container justifyContent='center'>
          {/* <Grid item> */}
            <a target='_blank' href={`https://goerli.etherscan.io/tx/${data.transactionHash}`} style={{color:'black'}}>
              {data.user.walletAddress.substring(0, 4) + " .... " + data.user.walletAddress.substring(data.user.walletAddress.length - 4)}
            </a>
          {/* </Grid> */}
          {/* <Grid item flexGrow={1} mx={1} mt='11px' borderTop='1px dashed black'></Grid>
          <Grid item>sdfsd</Grid> */}
        </Grid>
      </Grid>

      <Grid item>
        FGOL {data.FGOLTokenAmount}
      </Grid>
    </Grid>
  )

  return (
    <Box padding={{ xs: 1, md: 5 }}>
      <Grid container justifyContent='end'>
        <Box sx={{cursor:'pointer'}} display='flex' onClick={() => router.push("/proposals")} alignItems='center'><Typography color="#2683F6" fontWeight={600}>PROPOSALS</Typography><Icon hFlip={true} width={25} height={25} icon="ic:round-reply" color='#2683F6'/></Box>
      </Grid>
      <Grid item container sx={{ gap: { xs: 3, md: 0 } }}>
        <Grid
          item
          container
          pr={{ xs: 0, md: 10 }}
          xs={12} md={4}
        >
          <Grid
            container
            sx={{
              width: '100%',
              backgroundColor: "#2683F6",
              px: 1,
              pt: 2, pb: 1,
              borderRadius: 5
            }}
            justifyContent='space-between'
          >
            <Typography width='100%' sx={{ borderBottom: '4px dashed #041431' }} color="white" fontSize='2.5rem' textAlign='center' fontWeight={600}>BALANCE:</Typography>
            <Grid container justifyContent='center' mt={1}>
              <Grid item xs={6} textAlign='center'>
                <Typography color='white'>ALL VAULTS</Typography>
                <Typography color='white' fontSize={20}>
                  LP {" "}
                  {totalMemberBalance && Number(totalMemberBalance).toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={6} textAlign='center'>
                <Typography color='white'>IN THIS VAULTS</Typography>
                <Typography color='white' fontSize={20}>
                  LP {" "}
                  {lpDepositedTokenEth && Number(lpDepositedTokenEth).toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
            <Grid container width='100%' justifyContent='center' mt={1} alignItems='end'>
              <Button onClick={() => router.push('/withdraw')} variant="contained" sx={{ backgroundColor: '#041431', fontSize: 20, borderRadius: 5, width: { md: '175px', xs: '100%' } }} size='middle'>WITHDRAW</Button>
            </Grid>
          </Grid>

        </Grid>
        <Grid
          item
          container
          pr={{ xs: 0, md: 10 }}
          xs={12} md={4}
        >
          <Grid
            container
            sx={{
              width: '100%',
              backgroundColor: "#041431",
              px: 1,
              pt: 2, pb: 1,
              borderRadius: 5
            }}
            justifyContent='space-between'
          >
            <Box width={'100%'}>
              <Typography sx={{ borderBottom: '4px dashed #2683F6' }} color="white" fontSize='2.5rem' textAlign='center' fontWeight={600}>TO CLAIM:</Typography>
              <Typography color='white' fontSize={30} textAlign='center' py={1}>
                FGOL {" "}
                {fgolTokenEth && Number(fgolTokenEth).toFixed(2)}
              </Typography>
            </Box>
            <Grid container width='100%' justifyContent='center' mt={1} alignItems='end'>
              <Button onClick={handleClaim} variant="contained" sx={{ backgroundColor: '#2683F6', fontSize: 20, borderRadius: 5, width: { md: '175px', xs: '100%' } }} size='middle'>CLAIM</Button>
            </Grid>
          </Grid>

        </Grid>
        <Grid
          item
          container
          xs={12} md={4}
          alignItems='center'
          sx={{ mt: { xs: 3, md: 0 } }}
        >
          <Grid container rowSpacing={1} columnSpacing={2}>
            <Grid item xs={12} sm={6}>
              <Button onClick={handleBuyFGOLClick} fullWidth size='large' variant="contained" sx={{ backgroundColor: '#2683F6', fontSize: 18, fontWeight: 600, borderRadius: 5 }}>
                BUY FGOL
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button onClick={() => router.push('/deposit')} fullWidth size='large' variant="contained" sx={{ backgroundColor: '#2683F6', fontSize: 18, fontWeight: 600, borderRadius: 5 }}>
                DEPOSIT LP
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button onClick={handleBuyFGOLClick} fullWidth size='large' variant="contained" sx={{ backgroundColor: '#041431', fontSize: 18, fontWeight: 600, borderRadius: 5 }}>
                STAKING FGOL
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button onClick = {() => router.push("/distribute")} fullWidth size='large' variant="contained" sx={{ backgroundColor: '#041431', fontSize: 18, fontWeight: 600, borderRadius: 5 }}>
                DISTRIBUTE FGOL
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Grid container
        sx={{
          backgroundColor: "#041431",
          borderRadius: 5
        }}
        mt={4}
        padding={{ xs: 1, md: 3 }}
      >
        <Grid item container sm={12} md={6} sx={{ pr: { sm: 0, md: '4px' } }}>
          <Grid item alignItems='start' backgroundColor="white" borderRadius={6} p={2} maxHeight={700} className='scroller' sx={{overflowY:'scroll'}}>
            <Grid container>
              <Typography width='100%' color='black' fontSize={{ xs: 20, sm: 25 }} px={1} borderBottom='4px solid #C9C9C9'>DEPOSITS AND WITHDRAWLS:</Typography>
              <Grid container justifyContent='space-between' px={3} py={1}>
                <Typography color='#2683F6' fontSize={{ xs: 15, sm: 20 }}>Date</Typography>
                <Typography color='#2683F6' fontSize={{ xs: 15, sm: 20 }}>Amount</Typography>
              </Grid>
              {
                ( isFetchingHomeData === "DONE" || deposits.length > 0 ) ? deposits.map((item, i) => _renderDepositHistoryItem(item, i)) : (
                  isFetchingHomeData === "START" && <Box width='100%' my={2} textAlign='center'><span className="loading-icon"></span></Box>
                )
              }
            </Grid>
          </Grid>
        </Grid>
        <Grid item container sm={12} md={6} sx={{ pl: { sm: 0, md: '4px' }, mt: { xs: 1, md: 0 } }}>
          <Grid item alignItems='start' backgroundColor="white" borderRadius={6} p={2} maxHeight={700} className='scroller' sx={{overflowY:'scroll'}}>
            <Grid container>
              <Typography width='100%' color='black' fontSize={{ xs: 20, sm: 25 }} px={1} borderBottom='4px solid #C9C9C9'>DISTRIBUTION HISTORY:</Typography>
              <Grid container justifyContent='space-between' px={3} py={1}>
                <Typography color='#2683F6' fontSize={{ xs: 15, sm: 20 }}>Date</Typography>
                <Typography color='#2683F6' fontSize={{ xs: 15, sm: 20 }}>Distributor's Wallet</Typography>
                <Typography color='#2683F6' fontSize={{ xs: 15, sm: 20 }}>Amount</Typography>
              </Grid>
              {
                ( isFetchingHomeData === "DONE" || distributes.length > 0 ) ? distributes.map((item, i) => _renderDistributionHistoryItem(item, i)) : (
                  isFetchingHomeData === "START" && <Box width='100%' my={2} textAlign='center'><span className="loading-icon"></span></Box>
                )
              }
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Home;