import * as React from 'react';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';
import { saveDocumentGenerateID } from '../utils/firestore';

import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import FormControl from "@mui/material/FormControl";
import Typography from "@mui/material/Typography";
import { LoadingButton } from '@mui/lab';

import Layout from "../components/layout";
import Seo from "../components/seo";

export default function Contact() {
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
