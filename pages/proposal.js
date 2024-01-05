import { Icon } from '@iconify/react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import React from 'react'
import TextField from '../src/components/TextField';

import { useRouter } from 'next/router';
import useWeb3 from '../src/hooks/useWeb3';
import useNotification from '../src/hooks/useNotification';
import axios from 'axios';
import useSpinner from '../src/hooks/useSpinner';
import { useDispatch } from 'react-redux';

const Proposal = () => {

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
    BlockumDAOContract,
    updateWallet,
    lpTokenEth,
    lpDepositedTokenEth,
    isConnected,
    addProposal,
    _init

  } = useWeb3();

  const { showNotification } = useNotification();
  const { openSpin, closeSpin } = useSpinner();
  const dispatch = useDispatch();
  const router = useRouter();

  const [ isLoading, setIsLoading ] = React.useState(false);

  const [isValidate, setIsValidate] = React.useState(false);

  const [ title, setTitle ] = React.useState('');
  const [ description, setDescription ] = React.useState("");
  const [ presentationLink, setPresentationLink ] = React.useState("");
  const [ sector, setSector ] = React.useState("Argo");

  const [createdProposalId, setCreatedProposalId] = React.useState(); 

  const [ isBegin, setIsBegin ] = React.useState(false);

  const gotoHelp = () => {
    window.open("https://blockumdao.org/newproposal", '_blank');
  }

 /**
  * deposit LP tokens
  */
  const handleSubmit = async() => {
  
    setIsValidate(true);

    if(title.length === 0) {
      return showNotification("Input title for proposal", "error");
    } else if ( description.length === 0 ) {
      return showNotification("Input description for proposal", "error");
    } else if ( presentationLink.length === 0 ) {
      return showNotification("Input presentationLink for proposal", "error");
    }

    try {

      setIsLoading(true);
      openSpin(`Sending new proposal`);

      const tx = await BlockumDAOContract.methods.createProposal( sector, title, description, presentationLink ).send({ from: walletAddress });
      console.log("created", tx);

      showNotification("Proposal sent successfully", "success");
      closeSpin();
      const _proposalId = tx.events.ProposalCreated.returnValues.proposalId;
      await addProposal(_proposalId);
      router.push(`/setperiod?proposalId=${_proposalId}`);
      
      // await updateWallet();
      // router.push("/convince");
    } catch (error) {
      console.log(error);
      showNotification("Failed to create proposal", "error");
      closeSpin();
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * get last event for createProposal
   */
  React.useEffect(() => {
    if ( createdProposalId ) {
      closeSpin();
      router.push(`/setperiod?proposalId=${createdProposalId}`);
    }
  }, [createdProposalId]);

  
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
        <Box position='absolute' top={15} right={15} sx={{cursor:'pointer', '&:hover':{opacity:0.7}}}><Icon onClick={() => router.push("/proposals")} icon="mingcute:close-fill" width={30} color="white" /></Box>
        <Grid item container justifyContent='center' gap={1}>
          <img src='/icons/logo.png' width={50}/>
          <Typography color='white' fontSize={25} fontWeight={600}>BLOCKUM</Typography>
        </Grid>
        
        <Box width='100%' color='white' fontSize={16} mt={6} textAlign='center'>
          See how to put together a proposal, <Typography onClick={gotoHelp} component='span' sx={{cursor:'pointer', '&:hover':{color:'#ffffff88', textDecoration:'underline'}}}>Click here</Typography>
        </Box>
        
        <Typography width='100%' color='white' textAlign='center' fontSize={23} mt={6}>ADD PROPOSAL FOR FOMENT:</Typography>
        <Box width='100%' mt={1}>
          <TextField
            label="Title"
            name="title"
            multiline
            maxRows={1}
            fullWidth
            id="margin-none"
            // value={title}
            onChange={e => setTitle(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            placeholder="AI Technology Startup"
            helperText={(title.length === 0 && isValidate) ? "Input title for proposal": ''}
          />
        </Box>

        <Box width='100%' mt={3}>
          <TextField
            name="description"
            label="Description"
            fullWidth
            multiline
            minRows={5}
            id="margin-none"
            fontSize={13}
            value={description}
            onChange={(e) => {setDescription(e.target.value)}}
            placeholder="The world is changing rapidly, and technology is leading the way. In recent years, artificial intelligence has become one of the most talked-about and exciting areas of technological innovation."
            InputLabelProps={{
              shrink: true,
            }}
            helperText={(description.length === 0 && isValidate) ? "Input description for proposal": ''}
          />
        </Box>

        <Box width='100%' mt={3}>
          <TextField
            name="presentationLink"
            label="PresentationLink"
            fullWidth
            multiline
            minRows={1}
            id="margin-none"
            fontSize={13}
            value={presentationLink}
            onChange={(e) => setPresentationLink(e.target.value)}
            // helperText="Incorrect entry."
            placeholder="https://www.canva.com/design/DAF1HAwzGEc/eVWlxmcVUkvmqsgq07IBDw/view?mode=prototype"
            InputLabelProps={{
              shrink: true,
            }}
            helperText={(presentationLink.length === 0 && isValidate) ? "Input presentation Link for proposal": ''}
          />
        </Box>

        <Box width='100%' mt={3}>
          <Button onClick={handleSubmit} fullWidth variant="contained" sx={{borderRadius:5, fontSize:'17px!important', backgroundColor:'#041431!important'}} size='small'>Send</Button>
        </Box>
      </Box>
    </Box>
  )
}

export default Proposal;