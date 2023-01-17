import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React from 'react';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { useContributions } from '../../hooks';

const placeholderData = [
  {
    week: 1,
    contributions: 40,
  },
  {
    week: 2,
    contributions: 30,
  },
  {
    week: 3,
    contributions: 20,
  },
  {
    week: 4,
    contributions: 27,
  },
  {
    week: 5,
    contributions: 18,
  },
  {
    week: 6,
    contributions: 23,
  },
  {
    week: 7,
    contributions: 34,
  },
];

export default function FooterChart() {
  const theme = useTheme();

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
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorContributions" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={theme.palette.primary.dark}
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={theme.palette.primary.dark}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <XAxis dataKey="week" hide={true} />
          <YAxis hide={true} />
          <Area
            type="monotone"
            name="Contributions"
            dataKey="contributions"
            stroke={theme.palette.primary.main}
            fillOpacity={1}
            fill="url(#colorContributions)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}
