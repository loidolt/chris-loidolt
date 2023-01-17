import { getAlgoliaResults } from '@algolia/autocomplete-js';
import '@algolia/autocomplete-theme-classic';
import algoliasearch from 'algoliasearch';
import { navigate } from 'gatsby';
import React from 'react';

import './autocomplete.css';
import Autocomplete from './customAutocomplete';
import PostItem from './postItem';

const searchClient = algoliasearch(
  process.env.GATSBY_ALGOLIA_APP_ID,
  process.env.GATSBY_ALGOLIA_ADMIN_KEY,
);

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
  );
}
