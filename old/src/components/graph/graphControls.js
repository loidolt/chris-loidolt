import {
  ArrowBack,
  ArrowForward,
  Close,
  Label,
  LabelOff,
  StopCircle,
  ThreeSixty
} from '@mui/icons-material';
import { Box, IconButton, Stack, Tooltip } from '@mui/material';
import React from 'react';

const GraphControls = ({
  autoRotate,
  setAutoRotate,
  showLabels,
  setShowLabels,
  nodeData,
  handleNextNode,
  handleCloseNode,
  handlePrevNode
}) => {
  return (
    <Box sx={{ position: 'fixed', top: 80, right: 20, zIndex: 1000 }}>
      <Stack spacing={2} alignItems={'flex-end'} direction={{ xs: 'column', sm: 'row' }}>
        <Stack spacing={2} direction="row">
          <Tooltip title={autoRotate ? 'Stop Rotation' : 'Start Rotation'}>
            <IconButton variant={'contained'} onClick={() => setAutoRotate(!autoRotate)}>
              {autoRotate ? <StopCircle /> : <ThreeSixty />}
            </IconButton>
          </Tooltip>
          <Tooltip title={showLabels ? 'Show Labels' : 'Hide Labels'}>
            <IconButton variant={'contained'} onClick={() => setShowLabels(!showLabels)}>
              {showLabels ? <LabelOff /> : <Label />}
            </IconButton>
          </Tooltip>
        </Stack>
        {nodeData && (
          <>
            <Tooltip title={'Previous Node'}>
              <IconButton variant={'contained'} onClick={() => handleNextNode(nodeData.id)}>
                <ArrowBack />
              </IconButton>
            </Tooltip>
            <Tooltip title={'Close Node'}>
              <IconButton variant={'contained'} onClick={() => handleCloseNode()}>
                <Close />
              </IconButton>
            </Tooltip>
            <Tooltip title={'Next Node'}>
              <IconButton variant={'contained'} onClick={() => handlePrevNode(nodeData.id)}>
                <ArrowForward />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Stack>
    </Box>
  );
};

export default GraphControls;
