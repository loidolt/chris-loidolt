import React from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import Box from "@mui/material/Box";

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
]

export default class FooterChart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: "loidolt",
            data: [],
        };
    }

    getContributions = () => {
        const year = new Date().getFullYear()

        axios({
            method: "GET",
            url: 'https://skyline.github.com/' + this.state.username + '/' + year + '.json',
        })
            .then((r) => {
                console.log(r)
            })
            .catch((r) => {
                this.setState({
                    data: placeholderData,
                })
                console.log(r.body);
            });
    };

    componentDidMount = () => {
        this.getContributions()
    }

    render() {
        return (
            <Box sx={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                    <AreaChart
                        data={this.state.data}
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
                                <stop offset="5%" stopColor="#056484" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#056484" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="week" hide={true} />
                        <YAxis hide={true} />
                        <Area type="monotone" name="Contributions" dataKey="contributions" stroke="#a9d8f0" fillOpacity={1} fill="url(#colorContributions)" />
                    </AreaChart>
                </ResponsiveContainer>
            </Box>
        );
    }
}
