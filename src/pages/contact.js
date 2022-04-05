import React from "react";
import axios from "axios";
import withStyles from "@mui/styles/withStyles";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import FormControl from "@mui/material/FormControl";
import Typography from "@mui/material/Typography";

import Layout from "../components/layout";
import Seo from "../components/seo";

const CustomTextField = withStyles({
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

class Contact extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      success: "",
      name: "",
      email: "",
      message: "",
      _gotcha: "",
      submitting: false,
    };
  }

  handleOnChange = (event) => {
    event.persist();
    this.setState((prev) => ({
      ...prev,
      [event.target.id]: event.target.value,
    }));
  };

  /* handleOnSubmit = (event) => {
    event.preventDefault();
    this.setState({ submitting: true });
    axios({
      method: "POST",
      url: "https://formspree.io/f/mzbkaobg",
      data: {
        name: this.state.name,
        email: this.state.email,
        message: this.state.message,
        _gotcha: this.state._gotcha,
      },
    })
      .then((r) => {
        this.setState({
          submitting: false,
          status: "SUCCESS",
          name: "",
          email: "",
          message: "",
        });
      })
      .catch((r) => {
        this.setState({ submitting: false, status: "ERROR" });
        console.log(r.body);
      });
  }; */

  render() {
    return (
      <Layout>
        <Seo title="Contact Loidolt Design" />
        <Typography variant="h3" component="h1" gutterBottom>
          Contact
        </Typography>
        <Paper
          sx={{
            padding: 4,
            backgroundColor: "#1e1e1e",
            borderRadius: "20px",
          }}
        >
          {this.state.status === "SUCCESS" ? (
            <Box
              sx={{
                padding: 4,
                color: "#03DAC6",
              }}
            >
              <p>Thanks! I'll get back to you as soon as possible.</p>
            </Box>
          ) : (
            <form name="contact" netlify>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth variant="filled">
                    <CustomTextField
                      id="name"
                      label="Name"
                      type="text"
                      name="name"
                      variant="outlined"
                      onChange={this.handleOnChange}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth variant="filled">
                    <CustomTextField
                      id="email"
                      label="Email"
                      type="email"
                      name="email"
                      variant="outlined"
                      onChange={this.handleOnChange}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth variant="filled">
                    <CustomTextField
                      id="message"
                      label="Message"
                      name="message"
                      multiline
                      rows={5}
                      variant="outlined"
                      onChange={this.handleOnChange}
                    />
                  </FormControl>
                </Grid>
                <input
                  type="text"
                  id="_gotcha"
                  name="_gotcha"
                  onChange={this.handleOnChange}
                  style={{ display: "none" }}
                />
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    type="submit"
                    /* onClick={this.handleOnSubmit} */
                    disabled={this.state.submitting}
                    sx={{ float: "right" }}
                  >
                    SUBMIT
                  </Button>
                  {this.state.status === "ERROR" && (
                    <Box
                      sx={{
                        marginTop: 4,
                        color: "#CF6679",
                      }}
                    >
                      <p>Oops! There was an error. Please try again.</p>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </form>
          )}
        </Paper>
      </Layout>
    );
  }
}

export default Contact;
