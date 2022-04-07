import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function Markdown(props) {
    const { children } = props;
    return (
        <ReactMarkdown children={children} remarkPlugins={[remarkGfm]} />
    );
}