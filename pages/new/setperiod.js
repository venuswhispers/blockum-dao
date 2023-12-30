import { Icon } from '@iconify/react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import React, { useEffect } from 'react'
import TextField from '../../src/components/TextField';

import { useRouter, useSearchParams } from 'next/router';
import useWeb3 from '../../src/hooks/useWeb3';
import useNotification from '../../src/hooks/useNotification';
import axios from 'axios';
import useSpinner from '../../src/hooks/useSpinner';
import { useDispatch } from 'react-redux';


const SetPeriod = (props) => {

  const {
    walletAddress,
    BlockumDAOContract,
    updateProposalById
  } = useWeb3();

  const { showNotification } = useNotification();
  const { openSpin, closeSpin } = useSpinner();
  const dispatch = useDispatch();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const [days, setDays] = React.useState("0");
  const [hours, setHours] = React.useState("0");
  const [minutes, setMinutes] = React.useState("0");
  const [proposalId, setProposalId] = React.useState("");

  const handleDaysChange = (e) => {
    const { value } = e.target;
    if ( value < 0 || value > 10000 ) {
      return;
    } else {
      setDays( value );
    }
  }

  useEffect(() => {
    let { asPath } = router;
    let search = asPath.split("?")[1];

    if( !search ) {
      return router.push("/new/proposals");
    }
 
    const params = search.split("=");

    if ( params.length !== 2 || params[0] !== "proposalId" ) {
      return router.push("/new/proposals");
    }

    setProposalId(params[1]);
  }, [router.asPath])

  const handleHoursChange = (e) => {
    const { value } = e.target;

    if ( value < 0 || value > 23 ) {
      return;
    } else {
      setHours( value );
    }
  }

  const handleMinuteChange = (e) => {
    const { value } = e.target;
    if ( value < 0 || value > 59 ) {
      return;
    } else {
      setMinutes( value );
    }
  }

  const handleSubmit = async() => {
    if ( !days ) {
      return showNotification("Input days", "error");
    } else if ( !hours ) {
      return showNotification("Input hours", "error");
    } else if ( !minutes ) {
      return showNotification("Input minutes", "error");
    } else if ( days === "0" && hours === "0" && minutes === "0" ) {
      return showNotification("Input duration", "error");
    }

    try {

      setIsLoading(true);
      openSpin(`Setting proposal period`);

      await BlockumDAOContract.methods.setVotingParametersForProposal(
        proposalId,
        days,
        hours,
        minutes
      ).send( { from: walletAddress } );

      
      showNotification("Setting proposal period success", "success");
      closeSpin();
      updateProposalById(proposalId);
      router.push("/new/proposals");
      // await updateWallet();
    } catch (error) {
      console.log(error);
      showNotification("Period set failed", "error");
    } finally {
      setIsLoading(false);
      closeSpin();
    }

  }

  return (
    <Box backgroundColor='#041431' position='fixed' top={0} left={0} right={0} bottom={0} sx={{overflowY:'auto'}}>
      <Box px={{ xs:3, sm:10 }} position='relative' backgroundColor='#1C1C39' maxWidth={550} pt={10} minHeight='100vh' pb={4} margin='auto'>
        <Box position='absolute' top={15} right={15} sx={{cursor:'pointer', '&:hover':{opacity:0.7}}}><Icon onClick={() => router.push("/new/proposals")} icon="mingcute:close-fill" width={30} color="white" /></Box>
        <Grid item container justifyContent='center' gap={1}>
          <img src='/icons/logo.png' width={50}/>
          <Typography color='white' fontSize={25} fontWeight={600}>BLOCKUM</Typography>
        </Grid>
        
        <Box width='100%' color='white' fontSize={16} mt={6} textAlign='center'>
          See how to put together a proposal, <Typography component='span' sx={{cursor:'pointer', '&:hover':{color:'#ffffff88', textDecoration:'underline'}}}>Click here</Typography>
        </Box>
        
        <Typography width='100%' color='white' textAlign='center' fontSize={22} mt={6}>ADD PROPOSAL FOR FOMENT:</Typography>

        <Grid mt={2} container justifyContent='space-between'>
          <Grid item width='25%'>
            <TextField
              label="Days"
              name="days"
              type="number"
              fullWidth
              id="margin-none"
              value={String(days)}
              onChange={handleDaysChange}
              InputLabelProps={{
                shrink: true,
              }}
              placeholder="1"
            />
          </Grid>
          <Grid item width='25%'>
            <TextField
              label="Hours"
              name="hours"
              type="number"
              fullWidth
              id="margin-none"
              value={String(hours)}
              onChange={handleHoursChange}
              InputLabelProps={{
                shrink: true,
              }}
              placeholder="12"
            />
          </Grid>
          <Grid item width='25%'>
            <TextField
              label="Minutes"
              name="minutes"
              type="number"
              fullWidth
              id="margin-none"
              value={String(minutes)}
              onChange={handleMinuteChange}
              InputLabelProps={{
                shrink: true,
              }}
              placeholder="12"
            />
          </Grid>
        </Grid>


        <Typography color='white' fontSize={13} mt={5}>
          Tell us how long you need to convince the community that you deserve to receive funding.
        </Typography>
        <Box width='100%' mt='3px'>
          <Button onClick={handleSubmit} fullWidth variant="contained" sx={{borderRadius:5, fontSize:'17px!important', backgroundColor:'#041431!important'}} size='small'>Send</Button>
        </Box>
      </Box>
    </Box>
  )
}

export default SetPeriod;