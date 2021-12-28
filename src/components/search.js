import React from "react";
import PropTypes from "prop-types";
import { Link } from "gatsby";
import withStyles from "@mui/styles/withStyles";
import algoliasearch from "algoliasearch/lite";
import {
  InstantSearch,
  Hits,
  Configure,
  Highlight,
  connectStateResults,
  connectSearchBox,
} from "react-instantsearch-dom";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Popover from "@mui/material/Popover";
import SearchIcon from "@mui/icons-material/Search";
import TextField from "@mui/material/TextField";

const searchClient = algoliasearch(
  process.env.GATSBY_ALGOLIA_APP_ID,
  process.env.GATSBY_ALGOLIA_SEARCH_KEY
);

const SearchTextField = withStyles({
  root: {
    "& input": {
      color: "rgba(255, 255, 255, 0.87)",
    },
    "& textarea": {
      color: "rgba(255, 255, 255, 0.87)",
    },
    "& label": {
      color: "rgba(255, 255, 255, 0.6)",
    },
    "& label.Mui-focused": {
      color: "rgba(255, 255, 255, 0.38)",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "rgba(255, 255, 255, 0.87)",
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "rgba(255, 255, 255, 0.6)",
      },
      "&:hover fieldset": {
        borderColor: "rgba(255, 255, 255, 0.87)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "rgba(255, 255, 255, 0.87)",
      },
    },
  },
})(TextField);

export default function Search() {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const Results = connectStateResults(
    ({ searchState, searchResults, children }) =>
      searchState && searchState.query ? (
        searchResults && searchResults.nbHits !== 0 ? (
          children
        ) : (
          <p style={{ color: "#CF6679", paddingLeft: 20, paddingRight: 20 }}>
            No joy, please try again
          </p>
        )
      ) : null
  );

  const open = Boolean(anchorEl);
  const id = open ? "search-results" : undefined;

  return (
    <InstantSearch searchClient={searchClient} indexName="posts">
      <Configure hitsPerPage={4} />

      <IconButton
        aria-label="search"
        sx={{
          position: "relative",
        }}
        onClick={handleClick}
        size="large"
      >
        <SearchIcon />
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={{
          "& .MuiPopover-paper": {
            padding: 2,
          },
        }}
      >
        <CustomSearchBox
          translations={{
            placeholder: "Search Projects",
          }}
        />
        <Results>
          <Hits hitComponent={Hit} />
        </Results>
      </Popover>
    </InstantSearch>
  );
}

const OverrideSearchBox = ({ currentRefinement, refine }) => {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 800,
      }}
    >
      <form
        noValidate
        action=""
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
        }}
        sx={{
          margin: 6,
        }}
      >
        <SearchTextField
          fullWidth
          type="search"
          id="search-projects"
          label="Search Projects"
          variant="outlined"
          value={currentRefinement}
          onChange={(event) => refine(event.currentTarget.value)}
        />
      </form>
    </Box>
  );
};

const CustomSearchBox = connectSearchBox(OverrideSearchBox);

function Hit(props) {
  return (
    <Paper
      key={props.hit.id}
      sx={{
        padding: 2,
        backgroundColor: "#1f1f1f",
        maxWidth: 800,
      }}
    >
      <Link to={props.hit.Path}>
        <Typography variant="h5" component="h4">
          <Highlight attribute="Title" hit={props.hit} />
        </Typography>
        <Typography variant="subtitle1">
          <Highlight attribute="Date" hit={props.hit} />
        </Typography>
        <Typography variant="body2" component="p">
          <Highlight attribute="Excerpt" hit={props.hit} />
        </Typography>
      </Link>
    </Paper>
  );
}

Hit.propTypes = {
  hit: PropTypes.object.isRequired,
};
