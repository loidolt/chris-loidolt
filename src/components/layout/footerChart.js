import { Box, Stack, Typography } from '@mui/material';
import React from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { useContributions } from '../../hooks';

const placeholderData = [
  {
    week: 1,
    contributions: 40
  },
  {
    week: 2,
    contributions: 30
  },
  {
    week: 3,
    contributions: 20
  },
  {
    week: 4,
    contributions: 27
  },
  {
    week: 5,
    contributions: 18
  },
  {
    week: 6,
    contributions: 23
  },
  {
    week: 7,
    contributions: 34
  }
];

const CustomTooltip = ({ active, payload, color }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          backgroundColor: color && color.paperBackground,
          paddingTop: 1,
          paddingBottom: 1,
          paddingLeft: 2,
          paddingRight: 2,
          borderRadius: 4,
          border: `2px solid ${color && color.main}`
        }}>
        <Stack direction="row" spacing={4} alignItems="center" justifyContent={'space-between'}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'white' }}>
            {`${payload[0].value}`}
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'white' }}>
            GitHub <br />
            Contributions
          </Typography>
        </Stack>
      </Box>
    );
  }

  return null;
};

export default function FooterChart({ color }) {
  const { data, isLoading, error } = useContributions();

  return (
    <Box sx={{ width: '100%', height: 250 }}>
      <ResponsiveContainer>
        <AreaChart
          data={error || isLoading ? placeholderData : data}
          name="Git Weekly"
          margin={{
            top: 10,
            right: 0,
            left: 0,
            bottom: 0
          }}>
          <defs>
            <linearGradient id="colorContributions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="35%" stopColor={color && color.paperBackground} stopOpacity={1} />
              <stop offset="90%" stopColor={color && color.paperBackground} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="week" hide={true} />
          <YAxis hide={true} />
          <Tooltip content={<CustomTooltip color={color && color} />} />
          <Area
            type="monotone"
            name="Contributions"
            dataKey="contributions"
            strokeWidth={4}
            stroke={color && color.main}
            fillOpacity={1}
            fill="url(#colorContributions)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}
