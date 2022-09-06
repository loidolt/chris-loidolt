import React from 'react'
import ReactMarkdown from 'react-markdown'
import Box from '@mui/material/Box'
import remarkGfm from 'remark-gfm'

const LinkRenderer = props => {
    console.log(props)
    return (
        <div>
            <a
                href={props.href}
                target="_blank"
                rel="noreferrer"
                style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "pre-wrap",
                    whiteSpace: "-moz-pre-wrap",
                    whiteSpace: "-pre-wrap",
                    whiteSpace: "-o-pre-wrap",
                    wordWrap: "break-word"
                }}
            >{props.href}</a>
        </div >
    );
};

export default function Markdown({ children }) {
    const renderers = {
        "a": LinkRenderer
    };

    return (
        <Box sx={{ width: "100%", position: "relative", }}>
            <ReactMarkdown children={children} remarkPlugins={[remarkGfm]} components={renderers} linkTarget="_blank" />
        </Box>
    );
}