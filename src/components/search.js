import React from 'react';
import { navigate } from 'gatsby';
import { getAlgoliaResults } from '@algolia/autocomplete-js';
import algoliasearch from 'algoliasearch';
import '@algolia/autocomplete-theme-classic';
import './algolia/autocomplete.css';

import Autocomplete from "./algolia/customAutocomplete";
import PostItem from './algolia/postItem';

const searchClient = algoliasearch(
  process.env.GATSBY_ALGOLIA_APP_ID,
  process.env.ALGOLIA_ADMIN_KEY
)

export default function Search() {

  return (
    <Autocomplete
      openOnFocus={true}
      detachedMediaQuery={''}
      getSources={({ query }) => [
        {
          sourceId: 'posts',
          getItems() {
            return getAlgoliaResults({
              searchClient,
              queries: [
                {
                  clickAnalytics: true,
                  indexName: 'posts',
                  query,
                },
              ],
            });
          },
          onSelect({ item, setQuery, setIsOpen, refresh }) {
            setQuery(`${item.query} `);
            setIsOpen(true);
            refresh();
          },
          /* getItemUrl({ item }) {
            return "/communities/" + item.slug;
          }, */
          navigator: {
            navigate({ item }) {
              navigate(item.Path);
            },
          },
          templates: {
            header() {
              return (
                <>
                  <span className="aa-SourceHeaderTitle">PROJECTS</span>
                  <div className="aa-SourceHeaderLine" />
                </>
              );
            },
            item({ item, components }) {
              return <PostItem hit={item} components={components} />;
            },
            noResults() {
              return 'No Matching Posts';
            },
          },
        },
      ]}
    />
  )
}