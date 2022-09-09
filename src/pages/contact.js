import React from 'react';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

import { TextField, Paper, Grid, FormControl, Typography } from "@mui/material";
import { LoadingButton } from '@mui/lab';
import { useTheme } from '@mui/material/styles';
//firebase
import { saveDocumentGenerateID } from '../utils/firestore';

import { Layout, Seo } from "../components/layout";

export default function Contact() {
  const theme = useTheme();

  const FormSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email("Please enter a valid email address").required('Email is required'),
    message: Yup.string().required('Message is required'),
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      message: '',
    },
    validationSchema: FormSchema,
    onSubmit: async (values, { resetForm }) => {
      console.log(values)
      const message = {
        to: 'loidolt@gmail.com',
        replyTo: `${values.email}`,
        message: {
          subject: `${values.name} | Loidolt Design Contact Form`,
          text: `${values.message}`,
          html: `${values.message}`,
        }
      }
      const response = await saveDocumentGenerateID("mail", message)
      if (response) {
        resetForm({})
      }
    },
  });

  const { errors, touched, isSubmitting, handleSubmit, getFieldProps } = formik;

  return (
    <Layout>
      <Typography variant="h3" component="h1" gutterBottom>
        Contact
      </Typography>
      <Paper
        sx={{
          padding: 4,
          backgroundColor: theme.palette.background.paper,
          borderRadius: "20px",
        }}
      >
        <FormikProvider value={formik}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <input type="hidden" name="form-name" value="contact" />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="filled">
                  <TextField
                    margin="dense"
                    id="name"
                    label="Name"
                    fullWidth
                    {...getFieldProps('name')}
                    error={Boolean(touched.name && errors.name)}
                    helperText={touched.name && errors.name}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="filled">
                  <TextField
                    margin="dense"
                    id="email"
                    label="Email"
                    fullWidth
                    {...getFieldProps('email')}
                    error={Boolean(touched.email && errors.email)}
                    helperText={touched.email && errors.email}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth variant="filled">
                  <TextField
                    margin="dense"
                    id="message"
                    label="Message"
                    multiline
                    rows={4}
                    fullWidth
                    {...getFieldProps('message')}
                    error={Boolean(touched.message && errors.message)}
                    helperText={touched.message && errors.message}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <LoadingButton size="large" type="submit" variant="contained" loading={isSubmitting}>
                  Submit
                </LoadingButton>
              </Grid>
            </Grid>
          </Form>
        </FormikProvider>
      </Paper>
    </Layout>
  );
};

export const Head = () => (
  <Seo title="Contact" />
)